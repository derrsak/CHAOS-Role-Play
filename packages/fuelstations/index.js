"use strict";

let dbFuelStations; // массив всех заправок
let bizes; // модуль бизнесов

module.exports = {
    business: { // объект, показывающий, что модуль включает управление бизнесом
        type: 0,
        name: "АЗС",
        productName: "Топливо",
    },
    shapeRange: 10, // радиус действия заправки
    productPrice: 1, // цена продукта для закупки дальнобойщиком на складе
    rentPerDayMultiplier: 0.01, // множитель стоимости аренды в день
    minFuelPrice: 1, // минимальная сумма за литр
    maxFuelPrice: 8, // максимальная сумма за литр

    // инициализация модуля
    async init() {
        bizes = call('bizes');
        await this.loadFuelStationsFromDB();
    },
    // загрузить все заправки из БД
    async loadFuelStationsFromDB() {
        dbFuelStations = await db.Models.FuelStation.findAll();

        for (var i = 0; i < dbFuelStations.length; i++) {
            this.createFuelStation(dbFuelStations[i]);
        }
        console.log(`[FUELSTATIONS] Загружено АЗС: ${i}`);
    },
    // создать заправку
    createFuelStation(station) {
        // mp.blips.new(361, new mp.Vector3(station.x, station.y, station.z),
        //     {
        //         name: "Заправка",
        //         shortRange: true,
        //     });

        let shape = mp.colshapes.newSphere(station.x, station.y, station.z, this.shapeRange);
        shape.isFuelStation = true;
        shape.fuelStationId = station.id;

        let label = mp.labels.new(`~y~${station.name}\n~g~$${station.fuelPrice} ~w~за литр\nНажмите ~b~E~w~`, new mp.Vector3(station.x, station.y, station.z),
            {
                los: false,
                font: 0,
                drawDistance: 20,
            });
        label.isFuelStation = true;
        label.fuelStationId = station.id;
    },
    /*parseFuelStations() {
        st.forEach((current) => {
            db.Models.FuelStation.create({
                name: current.name,
                x: current.pos[0],
                y: current.pos[1],
                z: current.pos[2]
            });
        });
    },*/
    // установить цену за литр заправки по id заправки
    setFuelPrice(id, price) {
        let station = dbFuelStations.find(x => x.id == id);
        if (!station) throw new Error('[FUELSTATIONS] АЗС не найдена');

        station.fuelPrice = price;
        station.save();
        this.updateLabel(id);
    },
    // обновить labeltext заправки по id заправки
    updateLabel(id) {
        let label = mp.labels.toArray().find(x => x.isFuelStation && x.fuelStationId == id)
        if (!label) throw new Error('[FUELSTATIONS] Label АЗС не найдена');

        let station = this.getFuelStationById(id);
        label.text = `~y~${station.name}\n~g~$${station.fuelPrice} ~w~за литр\nНажмите ~b~E~w~`;

        /*mp.labels.forEach(current => {
            if (current.isFuelStation && current.fuelStationId == id) {
                let station = this.getFuelStationById(id);
                current.text = `~y~${station.name}\n~g~$${station.fuelPrice} ~w~за литр\nНажмите ~b~E~w~`;
            }
        });*/
    },
    // получить объект заправки по id заправки
    getFuelStationById(id) {
        let station = dbFuelStations.find(x => x.id == id);
        return station ? station : null;

        /*for (let i = 0; i < dbFuelStations.length; i++) {
            if (dbFuelStations[i].id == id) {
                return dbFuelStations[i];
            }
        }
        return null;*/
    },
    // получить экономические параметры заправки по id бизнеса
    getBizParamsById(id) {
        let station = dbFuelStations.find(x => x.bizId == id);
        if (!station) return;
        return [
            {
                key: 'fuelPrice',
                name: 'Цена топлива',
                max: this.maxFuelPrice,
                min: this.minFuelPrice,
                current: station.fuelPrice,
                isInteger: true
            }
        ];
    },
    // установить экономические параметры заправки по id бизнеса
    setBizParam(id, key, value) {
        let station = dbFuelStations.find(x => x.bizId == id);
        if (!station) return;

        station[key] = value;
        station.save();
        if (key == 'fuelPrice') this.updateLabel(station.id);
    },
    // получить кол-во продукции в бизнесе по id заправки
    getProductsAmount(id) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    // убрать продукцию с бизнеса по id заправки
    removeProducts(id, products) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        bizes.removeProducts(bizId, products);
    },
    // получить цену за литр по id заправки
    getFuelPriceById(id) {
        let station = dbFuelStations.find(x => x.id == id);
        return station ? station.fuelPrice : undefined;

        /*for (let i = 0; i < dbFuelStations.length; i++) {
            if (dbFuelStations[i].id == id) {
                return dbFuelStations[i].fuelPrice;
            }
        }*/
    },
    // пополнить кассу в бизнесе по id заправки
    updateCashbox(id, money) {
        let station = dbFuelStations.find(x => x.id == id);
        let bizId = station.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    }
}