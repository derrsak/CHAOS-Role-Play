"use strict";

let bank = require('./index.js');
let money;
let notifications;
let houseService;
let bizService;

module.exports = {
    "init": async () => {
        money = call("money");
        notifications = call("notifications");
        houseService = call("houses");
        bizService = call("bizes");
        await bank.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        bank.loadNPC(player);
    },
    "playerEnterColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isBank) return;

        player.call('prompt.show', ['Нажмите <span>E</span> для того, чтобы взаимодействовать с банковским счетом']);
        player.call('bank.shape', [true]);
    },
    "playerExitColshape": (player, shape) => {
        if (!player.character) return;
        if (!shape.isBank) return;

        player.call('prompt.hide');
        player.call('bank.shape', [false]);
        player.call("bank.close", [true]);
    },
    "bank.entering": (player) => {
        let info = bank.getInfo(player);
        if (info == null) return;
        player.call("bank.show", [info]);
    },
    "bank.push": (player, number) => {
        if (player.character == null) return player.call("bank.push.ans", [0]);
        number = parseInt(number);
        if (isNaN(number)) return player.call("bank.push.ans", [0]);
        if (player.character.cash < number) return player.call("bank.push.ans", [3]);

        money.removeCash(player, number, (resultCash) => {
            if (!resultCash) return player.call("bank.push.ans", [0]);

            money.addMoney(player, number, (resultMoney) => {
                if (!resultMoney) return player.call("bank.push.ans", [0]);
                player.call("bank.push.ans", [1]);
            }, `Пополнение счета`);

        }, `Пополнение счета`);
    },
    "bank.pop": (player, number) => {
        if (player.character == null) return player.call("bank.pop.ans", [0]);
        number = parseInt(number);
        if (isNaN(number)) return player.call("bank.pop.ans", [0]);
        if (player.character.bank < number) return player.call("bank.pop.ans", [2]);

        money.removeMoney(player, number, (resultMoney) => {
            if (!resultMoney) return player.call("bank.pop.ans", [0]);

            money.addCash(player, number, (resultCash) => {
                if (!resultCash) return player.call("bank.pop.ans", [0]);
                player.call("bank.pop.ans", [1]);
            }, `Снятие со счета`);

        }, `Снятие со счета`);
    },
    "bank.transfer.ask": async (player, accountNumber) => {
        accountNumber = parseInt(accountNumber);
        if (isNaN(accountNumber)) return player.call("bank.transfer.ask.ans", [null]);
        if (player.character.id == accountNumber) return player.call("bank.transfer.ask.ans", [null]);
        let character = await db.Models.Character.findOne({
            where: {
                id: accountNumber
            }
        });
        if (character == null) return player.call("bank.transfer.ask.ans", [null]);
        player.call("bank.transfer.ask.ans", [character.name]);
    },
    "bank.transfer": (player, number, accountNumber) => {
        number = parseInt(number);
        if (isNaN(number)) return player.call("bank.transfer.ans", [0]);
        if (number > 200000) return player.call("bank.transfer.ans", [0]);
        if (player.character.bank < number) return player.call("bank.transfer.ans", [2]);
        if (parseInt(player.character.minutes / 60) < 30) player.call("bank.transfer.ans", [3]);

        money.moveMoneyById(player.character.id, accountNumber, number, (result) => {
            if (!result) return player.call("bank.transfer.ans", [0]);
            player.call("bank.transfer.ans", [1]);
        }, `Перевод средств для #${parseInt(accountNumber)}`, `Перевод средств от #${player.character.id}`);
    },
    "bank.phone.push": (player, number) => {
        if (player.character == null) return player.call("bank.phone.push.ans", [0]);
        if (player.phone == null) return player.call("bank.phone.push.ans", [0]);
        number = parseInt(number);
        if (isNaN(number)) return player.call("bank.phone.push.ans", [0]);
        if (player.character.bank < number) return player.call("bank.phone.push.ans", [2]);

        money.removeMoney(player, number, (resultMoney) => {
            if (!resultMoney) return player.call("bank.phone.push.ans", [0]);

            player.phone.money += number;
            player.phone.save();
            player.call("bank.phone.push.ans", [1]);
            notifications.success(player, `Текущий баланс телефона $${player.phone.money}`, "Телефон");
        }, `Пополнение баланса телефона`);
    },
    "bank.biz.push": (player, id, daysNumber) => {
        if (player.character == null) return player.call("bank.biz.push.ans", [0]);
        id = parseInt(id);
        daysNumber = parseInt(daysNumber);
        if (isNaN(daysNumber) || isNaN(id)) return player.call("bank.biz.push.ans", [0]);
        let biz = bizService.getBizById(id);
        if (biz == null || biz.info.characterId != player.character.id) return player.call("bank.biz.push.ans", [0]);
        let price = bizService.getBizRent(biz) * daysNumber;
        if (player.character.bank < price) return player.call("bank.biz.push.ans", [2]);
        if (daysNumber + bizService.getDateDays(biz.info.date) > 30) return player.call("bank.biz.push.ans", [0]);

        money.removeMoney(player, price, (resultMoney) => {
            if (!resultMoney) return player.call("bank.biz.push.ans", [0]);

            biz.info.date = bizService.getDropDate(daysNumber + bizService.getDateDays(biz.info.date));
            bizService.setTimer(biz);
            biz.info.save();
            player.call("bank.biz.push.ans", [1]);
        }, `Оплата налогов за бизнес`);
    },
    "bank.house.push": (player, id, daysNumber) => {
        if (player.character == null) return player.call("bank.house.push.ans", [0]);
        id = parseInt(id);
        daysNumber = parseInt(daysNumber);
        if (isNaN(daysNumber) || isNaN(id)) return player.call("bank.house.push.ans", [0]);
        let house = houseService.getHouseById(id);
        if (house == null || house.info.characterId != player.character.id) return player.call("bank.house.push.ans", [0]);
        let price = daysNumber * house.info.price * house.info.Interior.rent;
        if (player.character.bank < price) return player.call("bank.house.push.ans", [2]);
        if (daysNumber + houseService.getDateDays(house.info.date) > 30) return player.call("bank.house.push.ans", [0]);
        
        money.removeMoney(player, price, (resultMoney) => {
            if (!resultMoney) return player.call("bank.house.push.ans", [0]);

            house.info.date = houseService.getDropDate(daysNumber + houseService.getDateDays(house.info.date));
            houseService.setTimer(house);
            house.info.save();
            player.call("bank.house.push.ans", [1]);
        }, `Оплата налогов за дом`);
    },
    "bank.biz.cashbox.push": (player, id, number) => {
        if (player.character == null) return player.call("bank.biz.cashbox.push.ans", [0]);
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return player.call("bank.biz.cashbox.push.ans", [0]);
        let biz = bizService.getBizById(id);
        if (biz == null || biz.info.characterId != player.character.id) return player.call("bank.biz.cashbox.push.ans", [0]);
        if (player.character.bank < number) return player.call("bank.biz.cashbox.push.ans", [2]);
        biz.info.cashBox += number;

        money.removeMoney(player, number, (resultMoney) => {
            if (!resultMoney) return player.call("bank.biz.cashbox.push.ans", [0]);

            player.call("bank.biz.cashbox.push.ans", [1]);
        }, `Пополнение кассы бизнеса`);

        biz.info.save();
    },
    "bank.biz.cashbox.pop": (player, id, number) => {
        if (player.character == null) return player.call("bank.biz.cashbox.pop.ans", [0]);
        id = parseInt(id);
        number = parseInt(number);
        if (isNaN(number) || isNaN(id)) return player.call("bank.biz.cashbox.pop.ans", [0]);
        let biz = bizService.getBizById(id);
        if (biz == null || biz.info.characterId != player.character.id) return player.call("bank.biz.cashbox.pop.ans", [0]);
        if (biz.info.cashBox < number) return player.call("bank.biz.cashbox.pop.ans", [4]);
        biz.info.cashBox -= number;

        money.addMoney(player, number, (resultMoney) => {
            if (!resultMoney) return player.call("bank.biz.cashbox.pop.ans", [0]);

            player.call("bank.biz.cashbox.pop.ans", [1]);
        }, `Снятие из кассы бизнеса`);

        biz.info.save();
    },
    "bank.phoneApp.show": (player) => {
        let info = bank.getInfo(player);
        if (info == null) return;
        player.call("bank.phoneApp.show.ans", [info]);
    },
};
