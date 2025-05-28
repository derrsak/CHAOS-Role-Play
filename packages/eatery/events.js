let eatery = require('./index.js');
let money = call('money');
let inventory = call('inventory');

module.exports = {
    "init": async () => {
        await eatery.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isEatery) return;

        let id = shape.eateryId;
        let data = eatery.getRawShopData(id);
        let priceConfig = eatery.getPriceConfig();
        player.call('eatery.shape.enter', [data, priceConfig]);
        player.currentEateryId = shape.eateryId;
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isEatery) return;

        player.call('eatery.shape.leave');
    },
    "eatery.products.buy": (player, productId) => {
        let eateryId = player.currentEateryId;
        if (eateryId == null) return;

        let productName;
        let params = {};
        switch (productId) {
            case 0:
                productName = 'hamburger';
                params.satiety = 60;
                params.thirst = -10;
                break;
            case 1:
                productName = 'hotdog';
                params.satiety = 55;
                params.thirst = -10;
                break;
            case 2:
                productName = 'pizza';
                params.satiety = 50;
                params.thirst = -5;
                break;
            case 3:
                productName = 'chips';
                params.satiety = 30;
                params.thirst = -5;
                break;
            case 4:
                productName = 'cola';
                params.thirst = 50;
                break;
        }

        let price = parseInt(eatery.productsConfig[productName] * eatery.productPrice * eatery.getPriceMultiplier(eateryId));
        if (player.character.cash < price) return player.call('eatery.products.buy.ans', [2]);
        let productsAvailable = eatery.getProductsAmount(eateryId);
        if (eatery.defaultProductsAmount > productsAvailable) return player.call('eatery.products.buy.ans', [3]);

        let itemId = eatery.itemIds[productName];

        inventory.addItem(player, itemId, params, (error) => {
            if (error) return player.call('eatery.products.buy.ans', [4, error]);

            money.removeCash(player, price, (result) => {
                if (!result) return player.call('eatery.products.buy.ans', [0]);

                eatery.removeProducts(eateryId, eatery.defaultProductsAmount);
                eatery.updateCashbox(eateryId, price);
                player.call('eatery.products.buy.ans', [1]);
            }, `Покупка в закусочной ${productName}`);
        });
    },
}