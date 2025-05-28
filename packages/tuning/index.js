let bizes;

let customs;

let modsConfig = {
    "11": "engineType",
    "12": "brakeType",
    "13": "transmissionType",
    "15": "suspensionType",
    "16": "armourType",
    "18": "turbo",
    "0": "spoiler",
    "1": "frontBumper",
    "2": "rearBumper",
    "3": "sideSkirt",
    "4": "exhaust",
    "5": "frame",
    "6": "grille",
    "7": "hood",
    "8": "fender",
    "9": "rightFender",
    "10": "roof",
    "23": "frontWheels",
    "48": "livery",
    "55": "windowTint",
    "22": "xenon",
    "62": "plateHolder",
    "100": "neon"
}

let priceConfig = { 
    repair: 125,
    color: 5000,
    default: 0.005,
    engine: 0.02,
    brake: 0.02,
    transmission: 0.01,
    suspension: 0.01,
    armour: 0.03,
    wheels: 0.0001
}
let wheelse = [];
let colorsPrice = priceConfig.color;
let peds = [];
let wheelsesf1 = [];
let wheelsesf2 = [];
let wheelsesf3 = [];
let wheelsesf4 = [];
let wheelsesf5 = [];
module.exports = {
    business: {
        type: 9,
        name: "Los Santos Customs",
        productName: "Детали",
    },
    swapModType: [
        mp.joaat('toros'),
    ],
    enterRange: 4,
    rentPerDayMultiplier: 0.01,
    minPriceMultiplier: 1.0,
    maxPriceMultiplier: 2.0,
    productPrice: 20,
    elementsToSync: ['62', '100', '22'],
    async init() {
        bizes = call('bizes');
        await this.loadCustomsFromDB();
        await this.loadWheels1FromDB();
        await this.loadWheels2FromDB();
        await this.loadWheels3FromDB();
        await this.loadWheels4FromDB();
        await this.loadWheels5FromDB();
        //await this.createWheelsibDB();
    },
    async loadCustomsFromDB() {
        customs = await db.Models.LosSantosCustoms.findAll();
        for (var i = 0; i < customs.length; i++) {
            this.createLSC(customs[i]);
        }
        console.log(`[TUNING] Загружено LSC: ${i}`);
    },
    /*async createHouse(houseInfo) {
        let house = await db.Models.House.create({
            interiorId: houseInfo.interiorId,
            price: houseInfo.price,
            isOpened: true,
            pickupX: houseInfo.pickupX,
            pickupY: houseInfo.pickupY,
            pickupZ: houseInfo.pickupZ,
            spawnX: houseInfo.spawnX,
            spawnY: houseInfo.spawnY,
            spawnZ: houseInfo.spawnZ,
            angle: houseInfo.angle,
            carX: houseInfo.carX,
            carY: houseInfo.carY,
            carZ: houseInfo.carZ,
            carAngle: houseInfo.carAngle,
        });
        house = await db.Models.House.findOne({
            where: {
                id: house.id
            },
            include: [{
                model: db.Models.Interior,
                include: [{
                    model: db.Models.Garage,
                    include: [db.Models.GaragePlace]
                }]
            }]
        });
        house = this.addHouse(house);11
        this.setTimer(house);
        console.log("[HOUSES] added new house");
    },*/
    async createWheelsibDB(kolvoses) {
        let wheelse = await db.Models.wheels5s.create({
            id: kolvoses.id,
            name: kolvoses.name,
            wprice: kolvoses.wprice
        });
    },
    async loadWheels1FromDB() {
        wheelses1 = await db.Models.wheels1s.findAll();
        for (var j = 0; j < wheelses1.length; j++) {
            this.createWSH1(wheelses1[j]);
        }
        console.log(`[WHEELS1] Загружено колёс: ${j}`);
    },
    async loadWheels2FromDB() {
        wheelses2 = await db.Models.wheels2s.findAll();
        for (var j = 0; j < wheelses2.length; j++) {
            this.createWSH2(wheelses2[j]);
        }
        console.log(`[WHEELS2] Загружено колёс: ${j}`);
    },
    async loadWheels3FromDB() {
        wheelses3 = await db.Models.wheels3s.findAll();
        for (var j = 0; j < wheelses3.length; j++) {
            this.createWSH3(wheelses3[j]);
        }
        console.log(`[WHEELS3] Загружено колёс: ${j}`);
    },
    async loadWheels4FromDB() {
        wheelses4 = await db.Models.wheels4s.findAll();
        for (var j = 0; j < wheelses4.length; j++) {
            this.createWSH4(wheelses4[j]);
        }
        console.log(`[WHEELS4] Загружено колёс: ${j}`);
    },
    async loadWheels5FromDB() {
        wheelses5 = await db.Models.wheels5s.findAll();
        for (var j = 0; j < wheelses5.length; j++) {
            this.createWSH5(wheelses5[j]);
        }
        console.log(`[WHEELS5] Загружено колёс: ${j}`);
    },
    createWSH1(WHEEL1) {
        wheelsesf1.push(
            {
                name: WHEEL1.name,
                wprice: WHEEL1.wprice
            }
        );
    },
    createWSH2(WHEEL2) {
        wheelsesf2.push(
            {
                name: WHEEL2.name,
                wprice: WHEEL2.wprice
            }
        );
    },
    createWSH3(WHEEL3) {
        wheelsesf3.push(
            {
                name: WHEEL3.name,
                wprice: WHEEL3.wprice
            }
        );
    },
    createWSH4(WHEEL4) {
        wheelsesf4.push(
            {
                name: WHEEL4.name,
                wprice: WHEEL4.wprice
            }
        );
    },
    createWSH5(WHEEL5) {
        wheelsesf5.push(
            {
                name: WHEEL5.name,
                wprice: WHEEL5.wprice
            }
        );

    },
    createLSC(LSC) {
        // mp.blips.new(72, new mp.Vector3(LSC.x, LSC.y, LSC.z),
        //     {
        //         name: 'Los Santos Customs',
        //         color: 0,
        //         shortRange: true,
        //     });

        peds.push(
            {
                position: {
                    x: LSC.npcX,
                    y: LSC.npcY,
                    z: LSC.npcZ
                },
                heading: LSC.npcH
            }
        );

        let shape = mp.colshapes.newSphere(LSC.x, LSC.y, LSC.z, this.enterRange);
        shape.isCustoms = true;
        shape.customsId = LSC.id;
    },
    loadedWheels1FromBD(player) {
        player.call('tuning.wheels.menush', [wheelsesf1]);
    },
    loadedWheels2FromBD(player) {
        player.call('tuning.wheels.menush', [wheelsesf2]);
    },
    loadedWheels3FromBD(player) {
        player.call('tuning.wheels.menush', [wheelsesf3]);
    },
    loadedWheels4FromBD(player) {
        player.call('tuning.wheels.menush', [wheelsesf4]);
    },
    loadedWheels5FromBD(player) {
        player.call('tuning.wheels.menush', [wheelsesf5]);
    },
    loadNPC(player) {
        if (!peds.length) return;
        player.call('tuning.npc.create', [peds]);
    },
    getCustomsDataById(id) {
        return customs.find(x => x.id == id);
    },
    getModsConfig() {
        return modsConfig;
    },
    setTuning(vehicle) {
        for (let key in modsConfig) {
            let modType = parseInt(key);
            let modIndex = vehicle.tuning[modsConfig[key]];
            if (modIndex != -1) {
                if (this.elementsToSync.includes(key)) {
                    this.syncMod(vehicle, key, modIndex);
                } else {

                    if (this.swapModType.includes(vehicle.model)) { // swapmodtype
                        switch (modType) {
                            case 0: // spoiler
                                modType = 1;
                                break;
                            case 1: // frontBumper
                                modType = 0;
                                break;
                        }
                    }
                    vehicle.setMod(modType, modIndex);
                } 
            }
        }
    },
    getModTypeByName(name) {
        for (let key in modsConfig) {
            if (modsConfig[key] == name) return key;
        }
    },
    saveMod(vehicle, typeName, modIndex) {
        vehicle.tuning[typeName] = modIndex;
        vehicle.tuning.save();
    },
    syncMod(vehicle, type, index) {
        vehicle.setVariable(modsConfig[type], index);
    },
    getPriceConfig() {
        return priceConfig;
    },
    calculateModPrice(vehPrice, modType, index) {
        let key;
        let i = index + 1;
        switch (modType) {
            case 11:
                key = 'engine';
                break;
            case 12:
                key = 'brake';
                break;
            case 13:
                key = 'transmission';
                break;
            case 15:
                key = 'suspension';
                break;
            case 16:
                key = 'armour';
                break;
            case 23:
                key = 'wheels';
                break;
            default:
                key = 'default';
                break;
        }
        return parseInt(priceConfig[key] * vehPrice * i);
    },
    getColorsPrice() {
        return colorsPrice;
    },
    getBizParamsById(id) {
        let lsc = customs.find(x => x.bizId == id);
        if (!lsc) return;
        let params = [
            {
                key: 'priceMultiplier',
                name: 'Наценка на услуги',
                max: this.maxPriceMultiplier,
                min: this.minPriceMultiplier,
                current: lsc.priceMultiplier
            }
        ]
        return params;
    },
    setBizParam(id, key, value) {
        let lsc = customs.find(x => x.bizId == id);
        if (!lsc) return;
        lsc[key] = value;
        lsc.save();
    },
    getProductsAmount(id) {
        let lsc = customs.find(x => x.id == id);
        let bizId = lsc.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    removeProducts(id, products) {
        let lsc = customs.find(x => x.id == id);
        let bizId = lsc.bizId;
        bizes.removeProducts(bizId, products);
    },
    getPriceMultiplier(id) {
        let lsc = customs.find(x => x.id == id);
        return lsc.priceMultiplier;
    },
    updateCashbox(id, money) {
        let lsc = customs.find(x => x.id == id);
        let bizId = lsc.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    },
    calculateProductsNeeded(price) {
        switch (price) {
            // case price <= this.productPrice:
            //     return 1;
            default:
                let products = parseInt((price * 0.8) / this.productPrice);
                return products;
        }
    },
    getIgnoreGetterModsData(vehicle) {
        if (!vehicle.tuning) return;
        return {
            22: vehicle.tuning.xenon,
            55: vehicle.tuning.windowTint,
            62: vehicle.tuning.plateHolder,
            100: vehicle.tuning.neon
        }
    } 
}