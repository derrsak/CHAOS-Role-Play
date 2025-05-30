let fuelstations = require('./index.js');
let vehicles = call('vehicles');
let money = call('money');

module.exports = {
    "init": async () => {
        await fuelstations.init();
        inited(__dirname);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isFuelStation) return;

        player.call('fuelstations.shape.enter');
        player.currentColshape = shape;
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isFuelStation) return;

        player.call('fuelstations.shape.leave');
        player.currentColshape = null;
    },
    'fuelstations.fill.fulltank': (player) => {
        let shape = player.currentColshape;
        if (!shape) return player.call('fuelstations.fill.fulltank.ans', [0]);
        if (!shape.isFuelStation) return player.call('fuelstations.fill.fulltank.ans', [0]);;

        let fuelStationId = shape.fuelStationId;

        let vehicle = player.vehicle;
        if (!vehicle) return player.call('fuelstations.fill.fulltank.ans', [1]);
        if (vehicle.properties.isElectric) return player.call('fuelstations.fill.fulltank.ans', [7]);
        if (vehicle.fuel >= vehicle.properties.maxFuel) return player.call('fuelstations.fill.fulltank.ans', [2]);

        let litresToFill = parseInt(vehicle.properties.maxFuel - vehicle.fuel);

        let productsAvailable = fuelstations.getProductsAmount(fuelStationId);
        if (litresToFill > productsAvailable) return player.call('fuelstations.fill.fulltank.ans', [6]);
        let price = fuelstations.getFuelPriceById(fuelStationId);
        let total = litresToFill * price;

        if (player.character.cash < total) return player.call('fuelstations.fill.fulltank.ans', [4]);

        money.removeCash(player, total, result => {
            if (!result) return player.call('fuelstations.fill.fulltank.ans', [5]);

            fuelstations.removeProducts(fuelStationId, litresToFill);
            fuelstations.updateCashbox(fuelStationId, total);
            vehicles.setFuel(vehicle, vehicle.properties.maxFuel);
            let data = {
                litres: litresToFill,
                total: total
            };
            player.call('fuelstations.fill.fulltank.ans', [3, data]);
        }, `Заправка т/с ${vehicle.properties.name} (${litresToFill} л.) на АЗС #${fuelStationId}`);
    },
    'fuelstations.fill.litres': (player, litres) => {
        let shape = player.currentColshape;
        if (!shape) return player.call('fuelstations.fill.litres.ans', [0]);
        if (!shape.isFuelStation) return player.call('fuelstations.fill.litres.ans', [0]);;

        let fuelStationId = shape.fuelStationId;

        let vehicle = player.vehicle;
        if (!vehicle) return player.call('fuelstations.fill.litres.ans', [1]);
        if (vehicle.properties.isElectric) return player.call('fuelstations.fill.litres.ans', [9]);
        if (vehicle.fuel >= vehicle.properties.maxFuel) return player.call('fuelstations.fill.litres.ans', [2]);

        litres = parseInt(litres);
        if (isNaN(litres) || litres < 1) return player.call('fuelstations.fill.litres.ans', [6]);
        if (litres > vehicle.properties.maxFuel - vehicle.fuel) return player.call('fuelstations.fill.litres.ans', [7]);
        let price = fuelstations.getFuelPriceById(fuelStationId);
        let total = litres * price; 

        let productsAvailable = fuelstations.getProductsAmount(fuelStationId);
        if (litres > productsAvailable) return player.call('fuelstations.fill.litres.ans', [8]);

        if (player.character.cash < total) return player.call('fuelstations.fill.litres.ans', [4]);

        money.removeCash(player, total, result => {
            if (!result) return player.call('fuelstations.fill.litres.ans', [5]);
            
            fuelstations.removeProducts(fuelStationId, litres);
            fuelstations.updateCashbox(fuelStationId, total);
            vehicles.addFuel(vehicle, litres);
            let data = {
                litres: litres,
                total: total
            };
            player.call('fuelstations.fill.litres.ans', [3, data]);
        }, `Заправка т/с ${vehicle.properties.name} (${litres} л.) на АЗС #${fuelStationId}`);
    }
}