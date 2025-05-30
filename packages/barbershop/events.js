let barbershop = require('./index.js');
let money = call('money');
let inventory = call('inventory');
let quests = call('quests');

module.exports = {
    "init": async () => {
        await barbershop.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        barbershop.loadNPC(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isBarbershop) return;

        player.call('prompt.show', ['Нажмите <span>E</span> для того, чтобы сменить прическу']);
        player.call('barbershop.shape', [true]);
        player.currentBarbershopId = shape.barbershopId;

        !quests.isEmpty && quests.processStageQuest(player, 'enter_area', {areaName: 'barbershop'});
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isBarbershop) return;

        player.call('barbershop.shape', [false]);
        player.call('prompt.hide');
    },
    "barbershop.enter": (player) => {
        let id = player.currentBarbershopId;
        if (!id) return;
        let shopData = barbershop.getRawBarbershopData(id);
        player.dimension = player.id + 1;
        let gender = player.character.gender;
        let appearanceData = {
            hairColor: player.character.hairColor,
            hairHighlightColor: player.character.hairHighlightColor,
            facialHairColor: player.character.beardColor,
            hairstyle: player.character.hair
        }
        let productPrice = barbershop.productPrice;
        let multiplier = barbershop.getPriceMultiplier(id);
        let priceData = {
            hairstylePrice: barbershop.hairstyleProducts * productPrice * multiplier,
            facialHairPrice: barbershop.facialHairProducts * productPrice * multiplier,
            colorChangePrice: barbershop.colorChangeProducts * productPrice * multiplier
        }
        player.call('barbershop.enter', [shopData, gender, appearanceData, priceData]);
    },
    "barbershop.exit": (player) => {
        player.dimension = 0;
        inventory.updateAllView(player);
        // TODO: выкинуть игрока куда то, можно на кассу
    },
    "barbershop.hairstyle.buy": (player, hairstyleId) => {
        let barbershopId = player.currentBarbershopId;
        if (barbershopId == null) return;

        let price = barbershop.hairstyleProducts * barbershop.productPrice * barbershop.getPriceMultiplier(barbershopId);
        if (player.character.cash < price) return player.call('barbershop.hairstyle.buy.ans', [1]);
        let productsAvailable = barbershop.getProductsAmount(barbershopId);
        let finalProducts = parseInt(barbershop.hairstyleProducts * barbershop.finalProductsMultiplier);
        if (finalProducts > productsAvailable) return player.call('barbershop.hairstyle.buy.ans', [3]);

        money.removeCash(player, price, (result) => {
            if (!result) return player.call('barbershop.hairstyle.buy.ans', [2]);

            barbershop.removeProducts(barbershopId, finalProducts);
            barbershop.updateCashbox(barbershopId, price);
            player.character.hair = hairstyleId;
            player.character.save();
            player.setClothes(2, hairstyleId, 0, 2);
            player.call('barbershop.hairstyle.buy.ans', [0]);
        }, `Смена прически на #${hairstyleId}`);
    },
    "barbershop.facialHair.buy": (player, index) => {
        let barbershopId = player.currentBarbershopId;
        if (barbershopId == null) return;
        
        let price = barbershop.facialHairProducts * barbershop.productPrice * barbershop.getPriceMultiplier(barbershopId);
        if (player.character.cash < price) return player.call('barbershop.facialHair.buy.ans', [1]);
        let productsAvailable = barbershop.getProductsAmount(barbershopId);

        let finalProducts = parseInt(barbershop.facialHairProducts * barbershop.finalProductsMultiplier);
        if (finalProducts > productsAvailable) return player.call('barbershop.facialHair.buy.ans', [3]);

        money.removeCash(player, price, (result) => {
            if (!result) return player.call('barbershop.facialHair.buy.ans', [2]);

            barbershop.removeProducts(barbershopId, finalProducts);
            barbershop.updateCashbox(barbershopId, price);
            player.setHeadOverlay(1, [index, 1.0, player.character.beardColor, 0]);
            player.character.Appearances[1].value = index;
            player.character.Appearances[1].save();
            player.call('barbershop.facialHair.buy.ans', [0]);
        }, `Смена бороды на #${index}`);

    },
    "barbershop.color.buy": (player, type, index) => {
        let barbershopId = player.currentBarbershopId;
        if (barbershopId == null) return;

        let price = barbershop.colorChangeProducts * barbershop.productPrice * barbershop.getPriceMultiplier(barbershopId);
        if (player.character.cash < price) return player.call('barbershop.color.buy.ans', [3]);
        let productsAvailable = barbershop.getProductsAmount(barbershopId);
        let finalProducts = parseInt(barbershop.colorChangeProducts * barbershop.finalProductsMultiplier);

        if (finalProducts > productsAvailable) return player.call('barbershop.color.buy.ans', [5]);

        money.removeCash(player, price, (result) => {
            if (!result) return player.call('barbershop.color.buy.ans', [4]);

            barbershop.removeProducts(barbershopId, finalProducts);
            barbershop.updateCashbox(barbershopId, price);
            switch (type) {
                case 0:
                    player.setHairColor(index, player.character.hairHighlightColor);
                    player.character.hairColor = index;
                    break;
                case 1:
                    player.setHairColor(player.character.hairColor, index);
                    player.character.hairHighlightColor = index;
                    break;
                case 2:
                    player.setHeadOverlay(1, [player.character.Appearances[1].value, 1.0, index, 0]);
                    player.character.beardColor = index;
                    break;
            }
            player.character.save();
            player.call('barbershop.color.buy.ans', [type]);
        }, `Смена цвета растительности типа #${type} на #${index}`);
    }
}