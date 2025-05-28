let clothingShop = require('./index.js');
let money = call('money');
let inventory = call('inventory');
let clothes = call('clothes');
let quests = call('quests');

module.exports = {
    "init": async () => {
        await clothingShop.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        clothingShop.loadNPC(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isClothingShop) return;

        const isCuffed = player.getVariable('cuffs') || false;
        if (isCuffed) return;
        player.currentClothingShopId = shape.clothingShopId;
        player.call('clothingShop.shape.enter', []);

        !quests.isEmpty && quests.processStageQuest(player, 'enter_area', {areaName: 'clothingShop'});
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isClothingShop) return;
        player.call('clothingShop.shape.leave', []);
    },
    "clothingShop.entering": (player) => {
        player.dimension = player.id + 1;
        if (player.hasValidClothesData) {
            mp.events.call('clothingShop.enter', player);
        } else {
            player.call('clothingShop.player.freeze');
            let gender = player.character.gender ? '0' : '1';
            let list = clothes.getClientList()[gender];
            for (let key in list) {
                player.call('clothingShop.list.get', [key, list[key]]);
            }
            player.hasValidClothesData = true;
        }
    },
    "clothingShop.enter": (player) => {
        let id = player.currentClothingShopId;
        let data = clothingShop.getRawShopData(id);
        data.appearance = {
            hairColor: player.character.hairColor,
            hairHighlightColor: player.character.hairHighlightColor,
            hairstyle: player.character.hair
        }
        player.call('clothingShop.enter', [data]);
    },
    "clothingShop.exit": (player) => {
        player.dimension = 0;
        inventory.updateAllView(player);

        // TODO: выбросить игрока куда нибудь из примерочной, например на кассу
    },
    "clothingShop.item.buy": (player, group, itemId, textureIndex) => {
        let shopId = player.currentClothingShopId;
        let gender = player.character.gender ? '0' : '1';
        let list = clothes.getClientList()[gender][group];
        let item = list.find(x => x.id == itemId);

        if (!item) return player.call('clothingShop.item.buy.ans', [1]);

        let defaultPrice = item.price;
        let products = clothingShop.calculateProductsNeeded(item.price);
        let price = parseInt(defaultPrice * clothingShop.getPriceMultiplier(shopId));
        //let income = parseInt(products * clothingShop.productPrice * clothingShop.getPriceMultiplier(shopId));

        if (player.character.cash < price) return player.call('clothingShop.item.buy.ans', [4]);
        let productsAvailable = clothingShop.getProductsAmount(shopId);
        if (products > productsAvailable) return player.call('clothingShop.item.buy.ans', [6]);
        let params = {
            sex: parseInt(gender),
            variation: item.variation,
            texture: item.textures[textureIndex],
            name: item.name
        }

        if (item.torso != null) params.torso = item.torso;
        if (item.undershirt != null) {
            params.undershirt = item.undershirt;
            params.uTexture = 0;
        }
        if (item.clime != null) params.clime = JSON.stringify(item.clime);
        if (item.pockets != null) params.pockets = JSON.stringify(item.pockets);

        inventory.addItem(player, clothingShop.itemIds[group], params, (e) => {
            if (e) return player.call('clothingShop.item.buy.ans', [2, e]);
            
            money.removeCash(player, price, (result) => {
                if (!result) return player.call('clothingShop.item.buy.ans', [5]);

                clothingShop.removeProducts(shopId, products);
                clothingShop.updateCashbox(shopId, price);
                player.call('clothingShop.item.buy.ans', [0]);
            }, `Покупка одежды ${group}. Variation #${itemId}. Texture #${textureIndex}`);
        });
    }
};