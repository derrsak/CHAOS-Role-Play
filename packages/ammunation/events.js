let ammunation = require('./index.js');
let inventory = call('inventory');
let money = call('money');
let quests = call('quests');

module.exports = {
    "init": async () => {
        await ammunation.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        ammunation.loadNPC(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isAmmunation) return;

        player.currentAmmunationId = shape.ammunationId;
        player.call('ammunation.shape.enter', []);

        !quests.isEmpty && quests.processStageQuest(player, 'enter_area', {areaName: 'ammunation'});
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isAmmunation) return;

        player.call('ammunation.shape.leave');
    },
    "ammunation.entering": (player) => {
        let id = player.currentAmmunationId;
        let data = ammunation.getRawShopData(id);
        let weaponsConfig = ammunation.getWeaponsConfig();
        player.call('ammunation.enter', [data, weaponsConfig, ammunation.ammoProducts, ammunation.armourProducts]);
    },
    "ammunation.weapon.buy": (player, weaponId) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;

        if (!player.character) return;
        if (!player.character.gunLicenseDate) return player.call('ammunation.weapon.buy.ans', [4]);
        let weaponData = ammunation.weaponsConfig[weaponId];

        let price = parseInt(weaponData.products * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return player.call('ammunation.weapon.buy.ans', [0]);
        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(weaponData.products * 0.8);
        if (finalProducts > productsAvailable) return player.call('ammunation.weapon.buy.ans', [1]);

        let params = {
            weaponHash: mp.joaat(weaponData.gameId),
            ammo: 0,
            owner: player.character.id
        };

        inventory.addItem(player, weaponData.itemId, params, (e) => {
            if (e) return player.call('ammunation.weapon.buy.ans', [2, e]);

            money.removeCash(player, price, function (result) {
                if (!result) return player.call('ammunation.weapon.buy.ans', [4]);

                ammunation.removeProducts(ammunationId, finalProducts);
                ammunation.updateCashbox(ammunationId, price);
                player.call('ammunation.weapon.buy.ans', [3, weaponData.name]);

                const paramsQuest = {
                    itemId: weaponData.itemId,
                    count: 1
                };
                !quests.isEmpty && quests.processStageQuest(player, 'buy_item', paramsQuest);
            }, `Покупка оружия ${weaponData.name}`);
        });
    },
    "ammunation.ammo.buy": (player, values) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;

        if (!player.character) return;
        if (!player.character.gunLicenseDate) return player.call('ammunation.weapon.buy.ans', [4]);
        
        values = JSON.parse(values);
        let ammoIndex = values[0];
        let ammoCount = values[1];

        let price = parseInt(ammunation.ammoProducts * ammoCount * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return player.call('ammunation.ammo.buy.ans', [0]);

        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(ammunation.ammoProducts * ammoCount * 0.8);
        if (finalProducts > productsAvailable) return player.call('ammunation.ammo.buy.ans', [1]);

        let itemIds = [37, 38, 40, 39];
        let params = {
            count: ammoCount,
            owner: player.character.id
        };

        inventory.addItem(player, itemIds[ammoIndex], params, (e) => {
            if (e) return player.call('ammunation.ammo.buy.ans', [2, e]);

            money.removeCash(player, price, function (result) {
                if (!result) return player.call('ammunation.ammo.buy.ans', [4]);

                ammunation.removeProducts(ammunationId, finalProducts);
                ammunation.updateCashbox(ammunationId, price);
                player.call('ammunation.ammo.buy.ans', [3]);

                const paramsQuest = {
                    itemId: itemIds[ammoIndex],
                    count: 1
                };
                !quests.isEmpty && quests.processStageQuest(player, 'buy_item', paramsQuest);
            }, `Покупка боеприпасов с itemId #${itemIds[ammoIndex]} (${ammoCount} шт.)`);
        });
    },
    "ammunation.armour.buy": (player, armourId) => {
        let ammunationId = player.currentAmmunationId;
        if (ammunationId == null) return;
        if (!player.character) return;
        
        let price = parseInt(ammunation.armourProducts * ammunation.productPrice * ammunation.getPriceMultiplier(ammunationId));
        if (player.character.cash < price) return player.call('ammunation.armour.buy.ans', [0]);

        let productsAvailable = ammunation.getProductsAmount(ammunationId);
        let finalProducts = parseInt(ammunation.armourProducts * 0.8);
        if (finalProducts > productsAvailable) return player.call('ammunation.armour.buy.ans', [1]);

        let params = {
            variation: 12,
            texture: armourId,
            health: 100,
            pockets: '[3,3,3,3,3,3,3,3,10,5,3,5,10,3,3,3]',
            sex: player.character.gender ? 0 : 1
        };

        inventory.addItem(player, 3, params, (e) => {
            if (e) return player.call('ammunation.armour.buy.ans', [2, e]);

            money.removeCash(player, price, function (result) {
                if (!result) return player.call('ammunation.armour.buy.ans', [4]);
                
                ammunation.removeProducts(ammunationId, finalProducts);
                ammunation.updateCashbox(ammunationId, price);
                player.call('ammunation.armour.buy.ans', [3]);

                const paramsQuest = {
                    itemId: 3,
                    count: 1
                };
                !quests.isEmpty && quests.processStageQuest(player, 'buy_item', paramsQuest);
            }, `Покупка бронежилета`);
        });
    },
}