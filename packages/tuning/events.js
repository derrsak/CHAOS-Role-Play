let tuning = require('./index.js');
let money = call('money');
let vehicles = call('vehicles');
module.exports = {
    "init": async () => {
        await tuning.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        tuning.loadNPC(player);

    },
    "loadwheelbd1": (player) => {
        tuning.loadedWheels1FromBD(player);
    },
    "loadwheelbd2": (player) => {
        tuning.loadedWheels2FromBD(player);
    },
    "loadwheelbd3": (player) => {
        tuning.loadedWheels3FromBD(player);
    },
    "loadwheelbd4": (player) => {
        tuning.loadedWheels4FromBD(player);
    },
    "loadwheelbd5": (player) => {
        tuning.loadedWheels5FromBD(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (shape.isCustoms) {
            if (!player.vehicle) return player.call('prompt.show', ['Вы должны находиться в транспорте']);

            if (player.vehicle.key != 'private') return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']); 

            if (player.vehicle.owner != player.character.id) return player.call('prompt.show', ['Нельзя модифицировать чужой транспорт']);

            let allowedTypes = [0, 3];
            let modelsWithDisabledTuning = ['caddy'];
            if (!player.vehicle.tuning || !allowedTypes.includes(player.vehicle.properties.vehType)) return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']);
            if (modelsWithDisabledTuning.includes(player.vehicle.modelName)) return player.call('prompt.show', ['Этот транспорт нельзя модифицировать']);
            let occupants = vehicles.getOccupants(player.vehicle);
            if (occupants.length > 1) return player.call('prompt.show', ['Нельзя тюнинговать транспорт с пассажирами']);

            player.call('tuning.fadeOut');
            let customs = tuning.getCustomsDataById(shape.customsId);
            player.currentCustomsId = shape.customsId;
            player.vehicle.dimension = player.id + 10000;
            player.vehicle.position = new mp.Vector3(customs.tuneX, customs.tuneY, customs.tuneZ);
            player.call('vehicles.heading.set', [customs.tuneH])
            let priceInfo = {
                veh: player.vehicle.properties.price,
                config: tuning.getPriceConfig(),
                priceMultiplier: tuning.getPriceMultiplier(shape.customsId)
            }
            let ignoreGetterData = tuning.getIgnoreGetterModsData(player.vehicle);
            player.call('tuning.start', [customs.id, priceInfo, ignoreGetterData]);
            // player.call('vehicles.engine.toggle', [false]);
            // player.vehicle.setVariable("engine", false);
            player.vehicle.isBeingTuned = true;

            // TODO: from Carter: test hotfix with vehicle dimension
            mp.players.forEach(rec => {
                if (!rec.character) return;
                if (rec.id == player.id) return;
                if (rec.dimension != player.vehicle.dimension) return;

                rec.dimension = 0;
            });
        }
    },
    "tuning.end": (player, id) => {
        if (!player.vehicle) return player.dimension = 0;
        let customs = tuning.getCustomsDataById(id);
        player.vehicle.position = new mp.Vector3(customs.returnX, customs.returnY, customs.returnZ);
        player.vehicle.dimension = 0;
        player.vehicle.isBeingTuned = false;
        player.call('vehicles.heading.set', [customs.returnH]);
    },
    "wheelses.create": (player, kolvoses) => {
        tuning.createWheelsibDB(JSON.parse(kolvoses));
    },
    "tuning.colors.setdef": (player) => {
        let secColor = player.vehicle.getColorRGB(1);
        let r2 = secColor[0];
        let g2 = secColor[1];
        let b2 = secColor[2];
        let prim = player.vehicle.getColorRGB(0);
        let r1 = prim[0];
        let g1 = prim[1];
        let b1 = prim[2];
        player.vehicle.setColorRGB(r1, g1, b1, r2, g2, b2);
    },
    "tuning.colors.back": (player, r1, g1, b1, r2, g2, b2) => {
        if (!player.vehicle) return;
        player.vehicle.setColorRGB(r1, g1, b1, r2, g2, b2);
    },
    "tun.col.changing": (player, r, g, b, wha) => {
        let secColor = player.vehicle.getColorRGB(1);
        let r2 = secColor[0];
        let g2 = secColor[1];
        let b2 = secColor[2];
        let prim = player.vehicle.getColorRGB(0);
        let r1 = prim[0];
        let g1 = prim[1];
        let b1 = prim[2];
        if (wha == 1) {
            player.vehicle.setColorRGB(r, g, b, r2, g2, b2);
        } else if (wha == 2) {
            player.vehicle.setColorRGB(r1, g1, b1, r, g, b);
        } else if (wha == 4) { //neon
            player.call('setNeonCol', [r, g, b]);//player.vehicle.setNeonColour(r,g,b);
		} else if (wha == 5) { //xenon
			///player.vehicle.toggleMod(22, true);
            player.call('setXENonCol', [r, g, b]);//mp.game.invoke("0x1683E7F0", player.vehicle, r,g,b);
		}
    },
  /*  "tuning.colors.setUPD": async (player, r,g,b, whatcolor) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.colors.set.ansUPD', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.colors.set.ansUPD', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.getColorsPrice();
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.colors.set.ansUPD', [5]);

        if (player.character.cash < price) return player.call('tuning.colors.set.ansUPD', [1]);

        money.removeCash(player, price, async function (result) {
            if (!result) return player.call('tuning.colors.set.ansUPD', [4]);
            let primaryColor = vehicle.getColorRGB(0);
            let secondaryColor = vehicle.getColorRGB(1);
            let r1, g1, b1, r2, g2, b2;
            if (whatcolor == 1) {
                vehicle.setColorRGB(r, g, b, secondaryColor);
                r1 = r;
                g1 = g;
                b1 = b;
                [r2, g2, b2] = secondaryColor;
            } else if (whatcolor == 2) {
                vehicle.setColorRGB(primaryColor, r, g, b);
                r2 = r;
                g2 = g;
                b2 = b;
                [r1, g1, b1] = primaryColor;
            }
 //           vehicle.color1 = primary;
 //           vehicle.color2 = secondary;
            await vehicle.db.update({
                color1: 1,
                color2: 2,
                colorr1: r1,
                colorg1: g1,
                colorb1: b1,
                colorr2: r2,
                colorg2: g2,
                colorb2: b2,
            });
            player.call('tuning.colors.set.ansUPD', [0]);
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        }, `Смена цвета т/с ${vehicle.properties.name} в LSC (#${primary} | #${secondary})`);
    },*/
 /*   "tuning.colors.set": async (player, primary, secondary) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.colors.set.ans', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.colors.set.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.getColorsPrice();
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.colors.set.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.colors.set.ans', [1]);

        money.removeCash(player, price, async function (result) {
            if (!result) return player.call('tuning.colors.set.ans', [4]);

            vehicle.setColor(primary, secondary);
            vehicle.color1 = primary;
            vehicle.color2 = secondary;
            await vehicle.db.update({
                color1: primary,
                color2: secondary
            });
            player.call('tuning.colors.set.ans', [0]);
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        }, `Смена цвета т/с ${vehicle.properties.name} в LSC (#${primary} | #${secondary})`);
    },*/
    "tuning.colors.set": async (player, red, green, blue) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.colors.set.ans', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.colors.set.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let products = tuning.calculateProductsNeeded(5000);
        let price = parseInt(5000 * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.colors.set.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.colors.set.ans', [1]);

        money.removeCash(player, price, async function (result) {
            if (!result) return player.call('tuning.colors.set.ans', [4]);
            let primaryRGB = 200;
            let secColor = vehicle.getColorRGB(1);
            let x = secColor[0];
            let y = secColor[1];
            let z = secColor[2];

            vehicle.setColorRGB(red, green, blue, x,y,z);

            await vehicle.db.update({
                color1: primaryRGB,
                colorR1: red,
                colorG1: green,
                colorB1: blue
            }); 
            player.call('tuning.colors.set.ans', [0]);
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        },);
    },
    "tuning.colors.set2": async (player, red, green, blue) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.colors.set.ans', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.colors.set.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let products = tuning.calculateProductsNeeded(5000);
        let price = parseInt(5000 * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.colors.set.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.colors.set.ans', [1]);

        money.removeCash(player, price, async function (result) {
            if (!result) return player.call('tuning.colors.set.ans', [4]);
            let primaryRGB = 200;
            let primColor = vehicle.getColorRGB(0);
            let x = primColor[0];
            let y = primColor[1];
            let z = primColor[2];

            vehicle.setColorRGB(x, y, z, red, green, blue);

            await vehicle.db.update({
                color1: primaryRGB,
                colorR2: red,
                colorG2: green,
                colorB2: blue
            });
            player.call('tuning.colors.set.ans', [0]);
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        },);
    },
    "tuning.buy": (player, type, index) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.buy.ans', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.buy.ans', [3]);
        
        let customsId = player.currentCustomsId;
        if (customsId == null) return;
        if (tuning.swapModType.includes(vehicle.model)) { // swapmodtype
            switch (type) {
                case 0: // spoiler
                    type = 1;
                    break;
                case 1: // frontBumper
                    type = 0;
                    break;
            }
        }
        let zeekrdev;
        if (type == 23) {
            let modIndexNowForWheels = player.vehicle.getMod(23);
            if (modIndexNowForWheels == index) return player.call('tuning.buy.ans', [6]);
            zeekrdev = 9730000;
            pricewheels = 0;
        } else {
            zeekrdev = vehicle.properties.price;
        }
        let defaultPrice = tuning.calculateModPrice(zeekrdev, type, index);
        let products = tuning.calculateProductsNeeded(defaultPrice);
//сюдасюда
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));
       // let income = parseInt(products * tuning.productPrice * tuning.getPriceMultiplier(customsId));
        
        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.buy.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.buy.ans', [1]);

        money.removeCash(player, price, function (result) {
            if (!result) return player.call('tuning.buy.ans', [4]);

            let config = tuning.getModsConfig();
            let syncMods = tuning.elementsToSync;
            let typeName = config[type.toString()];
            tuning.saveMod(vehicle, typeName, index);
            if (syncMods.includes(type.toString())) {
                tuning.syncMod(vehicle, type.toString(), index);
            } else {
                
                if (tuning.swapModType.includes(vehicle.model)) { // swapmodtype
                    switch (type) {
                        case 0: // spoiler
                            type = 1;
                            break;
                        case 1: // frontBumper
                            type = 0;
                            break;
                    }
                }
                vehicle.setMod(type, index);
            }
            player.call('tuning.buy.ans', [0, typeName, index]);
            
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        }, `Покупка тюнинга т/с ${vehicle.properties.name} в LSC (type #${type} | index #${index})`);

    },
    "tuning.repair": (player) => {
        let vehicle = player.vehicle;
        if (!vehicle) return player.call('tuning.repair.ans', [2]);
        if (vehicle.key != 'private' || vehicle.owner != player.character.id) return player.call('tuning.repair.ans', [3]);

        let customsId = player.currentCustomsId;
        if (customsId == null) return;

        let defaultPrice = tuning.getPriceConfig().repair;
        let products = tuning.calculateProductsNeeded(defaultPrice);
        let price = parseInt(defaultPrice * tuning.getPriceMultiplier(customsId));

        let productsAvailable = tuning.getProductsAmount(customsId);
        if (products > productsAvailable) return player.call('tuning.repair.ans', [5]);

        if (player.character.cash < price) return player.call('tuning.repair.ans', [1]);

        money.removeCash(player, price, function (result) {
            if (!result) return player.call('tuning.repair.ans', [4]);
            
            player.vehicle.repair();
            player.call('tuning.repair.ans', [0]);
            tuning.removeProducts(customsId, products);
            tuning.updateCashbox(customsId, price);
        }, `Ремонт т/с ${vehicle.properties.name} в LSC`);
    }
}
