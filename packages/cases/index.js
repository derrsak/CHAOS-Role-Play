const notifs = call('notifications');
const inventory = call('inventory');
const vehicles = call('vehicles');
const donate = call('donate');
const money = call('money');
const houses = call('houses');
const parkings = call('parkings');
const utils = call('utils');

const coinName = 'CC'; // название донат валюты

module.exports = {
    prizeList: [],
    caseList: [],

    async init() {
        this.prizeList = await db.Models.CasePrizeList.findAll();
        this.caseList = await db.Models.CaseList.findAll();

        console.log(`[CASE] Кейсов загружено: ${this.caseList.length} | Призов загружено: ${this.prizeList.length}`);
    },

    async loadCharacterPrizesCase(player) {
        player.character.casePrizes = await db.Models.CaseCharacterPrize.findAll({
            where: {
                characterId: player.character.id
            }
        });
    },

    showCase(player, caseId) {
        const caseData = this.getCaseById(caseId);
        if (!caseData) return notifs.error(player, `Кейс не найден`, 'Кейсы');
        if (player.showCaseId || player.openCaseWin) return;

        player.showCaseId = caseId;
        const data = [];

        caseData.prizes.forEach(id => {
            const prize = this.getPrizeById(id);
            if (!prize) return;

            data.push({
                id: prize.id,
                name: this.getNamePrize(prize),
                class: this.getClassPrizeByChance(prize.chance),
                sellPrice: prize.sellPrice,
                img: this.getImgByType(prize.type, prize.value)
            });
        });
        player.call("cases.show", [caseData.name, caseData.cost, data]);
    },

    openCase(player) {
        if (!player.character || !player.account) return;
        if (!player.showCaseId) return;

        const caseData = this.getCaseById(player.showCaseId);
        if (!caseData) return;

        if (player.account.donate < caseData.cost) return notifs.error(player, `Не хватает валюты (${caseData.cost} ${coinName})`, 'Кейсы');

        const prizes = this.getPrizesByCaseData(caseData);
        const winPrize = this.getRandomPrize(prizes);

        donate.setDonate(player, player.account.donate - caseData.cost, `Покупка кейса #${caseData.id}`);

        player.openCaseWin = winPrize;
        player.call("cases.open", [winPrize.id]);
    },

    async choosePrize(player, save = true, leave = false) {
        if (!player.character || !player.account) return;
        if (!player.openCaseWin) return;

        const prize = this.getPrizeById(player.openCaseWin.id);
        if (!prize) return;

        player.openCaseWin = null;

        if (!save) {
            donate.setDonate(player, player.account.donate + prize.sellPrice, `Продажа приза из кейса #${prize.id}`);
            notifs.success(player, `Вы продали свой приз за ${prize.sellPrice} ${coinName}`, 'Кейсы');
            return;
        }
        
        const newPrize = await db.Models.CaseCharacterPrize.create({
            characterId: player.character.id,
            prizeId: prize.id
        });
        player.character.casePrizes.push(newPrize);

        if (!leave) notifs.success(player, `Вы решили оставить приз, забрать: L - Призы с кейсов`, 'Кейсы');
    },

    showPrizes(player) {
        if (!player.character) return;
        if (player.character.casePrizes.length == 0) return notifs.warning(player, `У вас нет призов, выигранных в кейсах`, 'Кейсы');

        const prizes = [];
        player.character.casePrizes.forEach(x => {
            const prize = this.getPrizeById(x.prizeId);
            if (!prize) return;

            prizes.push({
                id: prize.id,
                name: this.getNamePrize(prize),
            });
        });

        player.call("cases.prizes.show", [prizes]);
    },

    usePrize(player, id) {
        if (!player.character) return;

        const prize = player.character.casePrizes.find(x => x.prizeId == id);
        if (!prize) return notifs.error(player, `У вас нет данного приза`, 'Кейсы');

        const prizeData = this.prizeList.find(x => x.id == id);
        if (!prizeData) return;

        if (prizeData.type == "Car") {
            const props = vehicles.getVehiclePropertiesByModel(prizeData.value);
            if (!vehicles.isAbleToBuyVehicle(player, props.vehType)) return notifs.error(player, `Достигнут лимит на транспорт`, 'Кейсы');
        }

        if (prizeData.type == "Item" || prizeData.type == "Car") {
            const cantAdd = prizeData.type == "Item" ? inventory.cantAdd(player, parseInt(prizeData.value), prizeData.itemParams) : inventory.cantAdd(player, 33, {});
            if (cantAdd) return notifs.error(player, cantAdd, 'Кейсы');
        }

        const prizeIndex = player.character.casePrizes.findIndex(x => x.prizeId == id);
        player.character.casePrizes[prizeIndex].destroy();
        player.character.casePrizes.splice(prizeIndex, 1);

        if (prizeData.type == "Money") return money.addCash(player, parseInt(prizeData.value), () => {}, 'Забрал приз из кейса');
        if (prizeData.type == "Item") return inventory.addItem(player, parseInt(prizeData.value), prizeData.itemParams, () => {});
        if (prizeData.type == "Car") return this.givePrizeCar(player, prizeData.value);
    },

    async givePrizeCar(player, model) {

        const props = vehicles.getVehiclePropertiesByModel(model);
        const hasHouse = houses.isHaveHouse(player.character.id);
        const carPlate = vehicles.generateVehiclePlate();
        const parking = parkings.getClosestParkingId(player, props.vehType);
        const now = new Date();

        const data = await db.Models.Vehicle.create({
            key: "private",
            owner: player.character.id,
            modelName: model,
            color1: utils.randomInteger(0, 150),
            color2: utils.randomInteger(0, 150),
            x: 0,
            y: 0,
            z: 0,
            h: 0,
            fuel: props.maxFuel,
            parkingId: parking,
            parkingDate: hasHouse ? null : now,
            plate: carPlate,
            owners: 1,
            regDate: now
        });

        const veh = {
            key: "private",
            owner: data.owner,
            modelName: model,
            color1: data.color1,
            color2: data.color2,
            x: 0,
            y: 0,
            z: 0,
            h: 0,
            fuel: data.fuel,
            parkingId: parking,
            parkingDate: data.parkingDate,
            plate: carPlate,
            owners: 1,
            regDate: now,
            mileage: 0,
            engineState: 0,
            fuelState: 0,
            steeringState: 0,
            brakeState: 0,
            destroys: 0,
            sqlId: data.id,
            db: data
        }

        const inParking = !hasHouse || props.vehType == 4 || props.vehType == 5;
        if (inParking) mp.events.call("parkings.vehicle.add", veh);
        else vehicles.spawnHomeVehicle(player, veh);
        
        player.vehicleList.push({
            id: data.id,
            name: props.name,
            plate: data.plate,
            regDate: data.regDate,
            owners: data.owners,
            vehType: props.vehType,
            price: props.price,
            parkingDate: data.parkingDate,
            dbInstance: data
        });

        inventory.fullDeleteItemsByParams(33, 'vehId', veh.db.id);
        inventory.addItem(player, 33, {
            owner: player.character.id,
            vehId: veh.db.id,
            vehName: props.name
        }, () => {});

        notifs.success(player, `Ваше Т/C перенесено ${inParking ? 'на парковку' : 'к дому'}`, 'Кейсы');
    },

    closeCase(player) {
        player.showCaseId = null;
        player.call("cases.close");
    },

    getPrizesByCaseData(caseData) {
        if (!caseData) return;
        let prizes = [];

        caseData.prizes.forEach(id => {
            const prize = this.getPrizeById(id);
            if (!prize) return;

            prizes.push({
                id: prize.id,
                chance: prize.chance
            });
        });
        return prizes;
    },

    getRandomPrize(prizes) {
        const lerp = (min, max, value) => ((1 - value) * min + value * max);
        const total = prizes.reduce((accum, item) => (accum + item.chance), 0);
        const chance = lerp(0, total, Math.random());
    
        let current = 0;
        for (const item of prizes) {
            if (current <= chance && chance < current + item.chance) {
                return item;
            }
            current += item.chance;
        }
    },

    getImgByType(type, value) {
        if (type == "Money") return "money";
        return value;
    },

    getNamePrize(prize) {
        switch (prize.type) {
            case "Item":
                return prize.itemParams && prize.itemParams.name ? prize.itemParams.name : inventory.getName(parseInt(prize.value));
            case "Car":
                return vehicles.getVehiclePropertiesByModel(prize.value).name;
            case "Money":
                return `$${prettyMoney(prize.value)}`;
        }
    },

    getClassPrizeByChance(chance) { // сейчас три типа редкости, настраивать в вебе
        if (chance >= 1 && chance <= 5) return 3;
        if (chance >= 6 && chance <= 30) return 2;
        if (chance >= 31 && chance <= 100) return 1;
    },

    getCaseById(caseId) {
        return this.caseList.find(x => x.id == caseId);
    },

    getPrizeById(prizeId) {
        return this.prizeList.find(x => x.id == prizeId);
    }
};

function prettyMoney(val) {
    val += '';
    return val.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
}