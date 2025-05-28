const money = call('money');
const notify = call('notifications')
const vehicles = call('vehicles');
const utils = call('utils');
const logger = call('logger');

const info = {
    enter: {                    // вход
        x: 936.04,
        y: 47.14,
        z: 81.09,
        toX: 1090.12,
        toY: 208.46,
        toZ: -48.99,
        toH: 358.18,
        toD: 0
    },
    exit: {                     // выход
        x: 1089.68,
        y: 205.87,
        z: -48.99,
        d: 0,
        toX: 935.11,
        toY: 45.80,
        toZ: 81.09,
        toH: 140.51
    },
    area: {                     // область казино
        x: 1100.58,
        y: 219.75,
        z: -48.74,
        range: 100
    }
}

module.exports = {
    minDiceChips: 100,          // мин. ставка фишек в броске костей
    maxDiceChips: 10000,        // макс. ставка фишек в броске костей

    slotMachineMinBet: 500,     // мин. ставка в слоте
    slotMachineMaxBet: 10000,   // макс. ставка в слоте

    chipsBuyPrice: 3,           // цена покупки, $ за фишку
    chipsSellPrice: 2,          // цена продажи, $ за фишку

    luckyWheelPosition: new mp.Vector3(1110.91, 229.26, -49.63), // координаты колеса удачи
    luckyWheelRollPrice: 3000,  // цена прокрута колеса в фишках
    luckyWheelRollHours: 24,    // кулдаун прокрута колеса

    isLuckyWheelRolling: false,
    currentLuckyWheelPlayer: null,

    /// Все доступные призы с колеса
    availablePrizes: [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18],
    slotValues: [0, 1, 2, 3, 4, 5, 2, 6, 0, 1, 3, 4, 1, 6, 2, 4],

    mainVeh: 'ast',           // главный приз авто (будет стоять в казино на подиуме)
    mysteryVeh: 'speedo2',      // секретный приз авто

    prizesConfig: {             // настройки списка призов
        0: {
            type: 'clothing',
            name: 'Кепка Casino',
            value: {
                itemId: 6,
                1: { // male
                    variation: 135,
                    texture: 0
                },
                0: { // female
                    variation: 134,
                    texture: 0
                },
            },
            chances: 20,
        },
        1: {
            type: 'cash',
            name: 'Наличные суммой $50000',
            value: 50000,
            chances: 20,
        },
        2: {
            type: 'vehicle',
            name: 'Автомобиль',
            value: '',
            chances: 5,
        },
        4: {
            type: 'clothing',
            name: 'Шорты Broker',
            value: {
                itemId: 8,
                1: { // male
                    variation: 117,
                    texture: 8,
                    pockets: [5, 4]
                },
                0: { // female
                    variation: 123,
                    texture: 8,
                    pockets: [5, 4]
                },
            },
            chances: 50,
        },
        5: {
            type: 'chips',
            name: 'Фишки для казино 25000 шт',
            value: 25000,
            chances: 20,
        },
        6: {
            type: 'cash',
            name: 'Наличные суммой $40000',
            value: 40000,
            chances: 20,
        },
        8: {
            type: 'clothing',
            name: 'Кепка Casino',
            value: {
                itemId: 6,
                1: { // male
                    variation: 135,
                    texture: 4
                },
                0: { // female
                    variation: 134,
                    texture: 4
                },
            },
            chances: 50,
        },
        9: {
            type: 'vehicle', // mystery
            name: 'Секретный автомобиль',
            value: '',
            chances: 5,
        },
        10: {
            type: 'chips',
            name: 'Фишки для казино 20000 шт',
            value: 20000,
            chances: 20,
        },
        12: {
            type: 'clothing',
            name: 'Маска Casino',
            value: {
                itemId: 14,
                1: { // male
                    variation: 156,
                    texture: 0
                },
                0: { // female
                    variation: 157,
                    texture: 0
                },
            },
            chances: 20,
        },
        13: {
            type: 'chips',
            name: 'Фишки для казино 15000 шт',
            value: 15000,
            chances: 20,
        },
        14: {
            type: 'cash',
            name: 'Наличные суммой $30000',
            value: 30000,
            chances: 20,
        },
        16: {
            type: 'cash',
            name: 'Наличные суммой $10000',
            value: 10000,
            chances: 20,
        },
        17: {
            type: 'chips',
            name: 'Фишки для казино 10000 шт',
            value: 10000,
            chances: 20,
        },
        18: {
            type: 'cash',
            name: 'Наличные суммой $20000',
            value: 20000,
            chances: 20,
        },
    },
    cashiers: [
        [1116.36, 221.75, -49.43],
        [1115.99, 220.13, -49.43],
        [1116.42, 218.15, -49.43]
    ],
    slotMachines: [{
            model: 'vw_prop_casino_slot_01a',
            pos: [1100.5103759765625, 230.36892700195312, -50.84077453613281],
            heading: 51.27
        },
        {
            model: 'vw_prop_casino_slot_02a',
            pos: [1101.262939453125, 231.63941955566406, -50.84080123901367],
            heading: 71.25
        },
        {
            model: 'vw_prop_casino_slot_03a',
            pos: [1101.3001708984375, 233.13919067382812, -50.84075164794922],
            heading: 98.67
        },
        {
            model: 'vw_prop_casino_slot_04a',
            pos: [1108.8233642578125, 239.53152465820312, -50.840789794921875],
            heading: 308.77
        },
        {
            model: 'vw_prop_casino_slot_05a',
            pos: [1110.284814453125, 238.66675720214844, -50.84080123901367],
            heading: 347.21
        },
        {
            model: 'vw_prop_casino_slot_06a',
            pos: [1111.7760009765625, 238.5751953125, -50.84077072143555],
            heading: 19.30
        },
        {
            model: 'vw_prop_casino_slot_07a',
            pos: [1112.9979248046875, 239.45040893554688, -50.84077835083008],
            heading: 50.01
        },
        {
            model: 'vw_prop_casino_slot_08a',
            pos: [1120.8240966796875, 233.2279510498047, -50.84078598022461],
            heading: 251.42
        },
        {
            model: 'vw_prop_casino_slot_03a',
            pos: [1120.7730712890625, 231.73455810546875, -50.84078598022461],
            heading: 291.02
        },
        {
            model: 'vw_prop_casino_slot_04a',
            pos: [1121.530517578125, 230.3941650390625, -50.840797424316406],
            heading: 319.34
        }
    ],

    init() {
        mp.blips.new(617, new mp.Vector3(info.enter.x, info.enter.y, info.enter.z),
        {
            name: "Diamond Casino",
            shortRange: true,
            color: 26
        });

        const enter = mp.colshapes.newSphere(info.enter.x, info.enter.y, info.enter.z, 1.5);
        enter.onEnter = (player) => {
            player.position = new mp.Vector3(info.enter.toX, info.enter.toY, info.enter.toZ);
            player.dimension = info.enter.toD;
            player.heading = info.enter.toH;

            player.inCasino = true;
            player.call('casino.area.enter', [true]);
        }

        mp.markers.new(2, new mp.Vector3(info.enter.x, info.enter.y, info.enter.z - 0.3), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: 0
        });

        const exit = mp.colshapes.newSphere(info.exit.x, info.exit.y, info.exit.z, 1.5);
        exit.dimension = info.exit.d;
        exit.onEnter = (player) => {
            player.position = new mp.Vector3(info.exit.toX, info.exit.toY, info.exit.toZ);
            player.dimension = 0;
            player.heading = info.exit.toH;

            player.inCasino = null;
            player.call('casino.area.enter', [false]);
        }

        mp.markers.new(2, new mp.Vector3(info.exit.x, info.exit.y, info.exit.z - 0.05), 0.75, {
            rotation: new mp.Vector3(0, 180, 0),
            dimension: info.exit.d
        });

        const luckyWheelShape = mp.colshapes.newSphere(this.luckyWheelPosition.x, this.luckyWheelPosition.y, this.luckyWheelPosition.z, 1.8);
        luckyWheelShape.dimension = info.exit.d;
        luckyWheelShape.onEnter = (player) => player.call('casino.luckywheel.enter', [true, this.luckyWheelRollPrice]);
        luckyWheelShape.onExit = (player) => player.call('casino.luckywheel.enter', [false]);

        this.createSlotMachinesColshapes();
        this.createCashierColshapes();
        this.setVehicleValues();
    },

    async loadCharacterPrizes(player) {
        if (!player.character) return;

        const prizes = await db.Models.CharacterPrize.findAll({
            where: {
                characterId: player.character.id
            }
        });

        player.character.prizes = prizes;
        console.log(`[CASINO] Для персонажа ${player.character.name} загружено ${prizes.length} призов`);
    },

    giveLuckyWheelPrize(player, prizeId) {
        if (!player.character) return;
        const prize = this.prizesConfig[prizeId];

        switch (prize.type) {
            case 'cash':
                money.addCash(player, prize.value, (result) => !result && notify.error(player, 'Ошибка начисления денег'), 'Выигрыш в колесе удачи');
                break;
            case 'chips':
                this.addChips(player, prize.value, 'Выигрыш в колесе удачи');
                break;
            case 'clothing':
            case 'vehicle':
                this.saveLuckyWheelPrize(player, prizeId);
                break;
            default:
                notify.error(player, 'Неизвестный тип приза, обратитесь к разработчикам');
                break;
        }

        notify.success(player, `Ваш приз - ${prize.name}!`);
        notify.info(player, `${prize.type == 'cash' || prize.type == 'donate' || prize.type == 'chips' ?
            'Приз выдан вам на руки' : 'Чтобы использовать приз, нажмите L -> Мои призы'}`);
    },

    async saveLuckyWheelPrize(player, prizeId) {
        if (!player.character) return;

        const prize = await db.Models.CharacterPrize.create({
            characterId: player.character.id,
            prizeId: prizeId
        });

        player.character.prizes.push(prize);
    },

    async removePrize(player, index) {
        if (!player.character) return;

        player.character.prizes[index].destroy();
        player.character.prizes.splice(index, 1);
    },

    addChips(player, count, reason = '') {
        if (!player.character) return;
        
        player.character.casinoChips += count;
        player.character.save();

        logger.log(`+${count} фишек (${reason})`, 'casino', player);
        player.call('casino.chips.changed', [player.character.casinoChips]);
    },

    removeChips(player, count, reason = '') {
        if (!player.character) return;

        player.character.casinoChips -= count;
        player.character.save();

        logger.log(`-${count} фишек (${reason})`, 'casino', player);
        player.call('casino.chips.changed', [player.character.casinoChips]);
    },

    createCashierColshapes() {
        this.cashiers.forEach(current => {
            const shape = mp.colshapes.newSphere(current[0], current[1], current[2], 0.85);
            shape.dimension = info.exit.d;
            shape.onEnter = (player) => player.call('casino.cashier.show', [true]);
            shape.onExit = (player) => player.call('casino.cashier.show', [false]);
        });
    },

    createSlotMachinesColshapes() {
        for (let i = 0; i < this.slotMachines.length; i++) {
            const machine = this.slotMachines[i];
            const shape = mp.colshapes.newSphere(machine.pos[0], machine.pos[1], machine.pos[2], 1.3);
            shape.dimension = info.exit.d;
            shape.isSlotMachine = true;
            shape.slotMachineIndex = i;

            shape.onEnter = (player) => {
                player.call('casino.slotmachine.enter', [true]);
                player.currentSlotMachineIndex = i;
            }
            shape.onExit = (player) => {
                if (player.isOccupySlotmachine) return;
                player.call('casino.slotmachine.enter', [false]);
                player.currentSlotMachineIndex = null;
                if (player == this.slotMachines[i].currentPlayer) {
                    this.slotMachines[i].currentPlayer = null;
                    this.slotMachines[i].isSpinning = false;
                }
            }
        }
    },

    getSlotMachineResult() {
        let result = "";
        for (let i = 0; i < 3; i++) result += this.slotValues[utils.randomInteger(0, this.slotValues.length - 1)];
        return result;
    },

    getSlotMachinePrize(res, bet) {
        let multiplier;
        switch (res) {
            case '222':
                multiplier = 8;
                break;
            case '111':
                multiplier = 16;
                break;
            case '333':
                multiplier = 25;
                break;
            case '666':
                multiplier = 50;
                break;
            case '000':
                multiplier = 75;
                break;
            case '444':
                multiplier = 100;
                break;
            case '555':
                multiplier = 200;
                break;
            default:
                multiplier = 0;
                break
        }
        return bet * multiplier;
    },

    setVehicleValues() {
        this.prizesConfig[2].value = this.mainVeh;
        this.prizesConfig[9].value = this.mysteryVeh;
    },

    async spawnMainVehicle() {
        const veh = {
            modelName: this.mainVeh,
            x: 1100.03,
            y: 219,
            z: -49.42,
            h: 182.22,
            d: info.exit.d,
            color1: 37,
            color2: 37,
            license: 0,
            key: "casino",
            owner: 0,
            fuel: 40,
            mileage: 0,
            plate: 'Casino',
            destroys: 0
        }
        await vehicles.spawnVehicle(veh, null, true);
    }
}