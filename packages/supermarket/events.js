let supermarket = require('./index.js');
let money = call('money');
let inventory = call('inventory');
let phone = call('phone');
let quests = call('quests');

module.exports = {
    "init": async () => {
        await supermarket.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        supermarket.loadNPC(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isSupermarket) return;

        let id = shape.supermarketId;
        let data = supermarket.getRawShopData(id);
        let priceConfig = supermarket.getPriceConfig();
        player.call('supermarket.shape.enter', [data, priceConfig]);
        player.currentsupermarketId = shape.supermarketId;

        !quests.isEmpty && quests.processStageQuest(player, 'enter_area', {areaName: 'supermarket'});
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isSupermarket) return;

        player.call('supermarket.shape.leave'); 
    },
    "supermarket.phone.buy": (player) => {
        if (player.phone) return player.call('supermarket.phone.buy.ans', [0]);
        let supermarketId = player.currentsupermarketId;
        if (supermarketId == null) return;

        let price = supermarket.productsConfig.phone * supermarket.productPrice * supermarket.getPriceMultiplier(supermarketId);
        if (player.character.cash < price) return player.call('supermarket.phone.buy.ans', [2]);
        let productsAvailable = supermarket.getProductsAmount(supermarketId);

        let finalProducts = parseInt(supermarket.productsConfig.phone * 0.7);
        if (finalProducts > productsAvailable) return player.call('supermarket.phone.buy.ans', [3]);

        money.removeCash(player, price, (result) => {
            if (!result) return player.call('supermarket.phone.buy.ans', [4]);

            supermarket.removeProducts(supermarketId, finalProducts);
            supermarket.updateCashbox(supermarketId, price);
            mp.events.call('phone.buy', player);
            player.call('supermarket.phone.buy.ans', [1]);
        }, `Покупка телефона`);
    },
    "supermarket.number.change": async (player, number) => {
        if (number.length != 6 || /\D/g.test(number) || number.charAt(0) == '0') return player.call('supermarket.number.change.ans', [0]);

        let supermarketId = player.currentsupermarketId;
        if (supermarketId == null) return;

        let price = supermarket.productsConfig.numberChange * supermarket.productPrice * supermarket.getPriceMultiplier(supermarketId);
        if (player.character.cash < price) return player.call('supermarket.number.change.ans', [2]);

        let finalProducts = parseInt(supermarket.productsConfig.numberChange * 0.7);

        let productsAvailable = supermarket.getProductsAmount(supermarketId);
        if (finalProducts > productsAvailable) return player.call('supermarket.number.change.ans', [3]);

        let changed = await phone.changeNumber(player, number);
        if (!changed) return player.call('supermarket.number.change.ans', [5]);

        money.removeCash(player, price, (result) => {
            if (!result) return player.call('supermarket.number.change.ans', [4]);

            supermarket.removeProducts(supermarketId, finalProducts);
            supermarket.updateCashbox(supermarketId, price);
            player.call('supermarket.number.change.ans', [1, number]);
        }, `Смена номера телефона на ${number}`);

    },
    "supermarket.products.buy": (player, productId) => {
        let supermarketId = player.currentsupermarketId;
        if (supermarketId == null) return;

        let productName;
        let bagColor;
        let params = {};

        switch (productId) {
            case 0:
                productName = 'water';
                params.thirst = 100;
                break;
            case 1:
                productName = 'chocolate';
                params.satiety = 20;
                params.thirst = -5;
                break;
            case 2:
                productName = 'cigarettes';
                params.count = 20;
                params.name = 'Redwood';
                break;
            case 3:
                productName = 'rope';
                break;
            case 4:
                productName = 'bag';
                break;
            case 5:
                productName = 'canister';
                params.litres = 0;
                params.max = 20;
                break;
            case 6:
                productName = 'duffleBag';
                bagColor = 'green';
                break;
            case 7:
                productName = 'duffleBag';
                bagColor = 'black';
                break;
            case 8:
                productName = 'healthPack';
                params.count = 1;
                break;
            case 9:
                productName = 'matches';
                params.count = 20;
                break;
        }

        let price = supermarket.productsConfig[productName] * supermarket.productPrice * supermarket.getPriceMultiplier(supermarketId);
        if (player.character.cash < price) return player.call('supermarket.products.buy.ans', [2]);
        let finalProducts = parseInt(supermarket.productsConfig[productName] * 0.7);
        let productsAvailable = supermarket.getProductsAmount(supermarketId);
        if (finalProducts > productsAvailable) return player.call('supermarket.products.buy.ans', [3]);

        let itemId = supermarket.itemIds[productName];

        if (productName == 'duffleBag') {
            params.sex = player.character.gender ? 0 : 1;
            params.pockets = '[4,4,10,4,7,7,7,7,14,10]';
            params.texture = 0;
            bagColor == 'green' ? params.variation = 41 : params.variation = 45;
        }

        inventory.addItem(player, itemId, params, (error) => {
            if (error) return player.call('supermarket.products.buy.ans', [4, error]);

            money.removeCash(player, price, (result) => {
                if (!result) return player.call('supermarket.products.buy.ans', [0]);

                supermarket.removeProducts(supermarketId, finalProducts);
                supermarket.updateCashbox(supermarketId, price);
                player.call('supermarket.products.buy.ans', [1]);

                const paramsQuest = {
                    itemId: itemId,
                    count: 1
                };
                !quests.isEmpty && quests.processStageQuest(player, 'buy_item', paramsQuest);
            }, `Покупка в 24/7 ${productName}`);
        });
    },
}
