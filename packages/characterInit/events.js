"use strict";
/// Модуль выбора и создания персоонажа
let admin;
let characterInit = require("./index.js");
let logger = call("logger");
let utils = call("utils");
let notifs = call('notifications')

module.exports = {
    "init": () => {
        admin = call('admin');
        characterInit.moduleInit();
        inited(__dirname);
    },
    "auth.cutsc": (player) => {
        player.call('client.intro.start', []);
    },
    "auth.done": (player) => {
        player.characterInit = {
            created: false,
        };
                player.call('client.intro.stop', [])
        mp.events.call('characterInit.start', player);
        player.call('characterInit.start', []);
    },
    "characterInit.start": async (player) => {
        let charInfos = await characterInit.init(player);
        if (charInfos.length != 0 && player.account.slots == 1 && charInfos[0].charInfo.hours >= characterInit.timeForSecondSlot) {
            player.account.slots = 2;
            await player.account.save();
        }
        player.call('characterInit.init', [charInfos, {
            slots: player.account.slots,
            coins: player.account.donate,
            costSecondSlot: characterInit.costSecondSlot,
            timeForSecondSlot: characterInit.timeForSecondSlot,
            costThirdSlot: characterInit.costThirdSlot,
        }]);
    },
    "characterInit.choose": (player, charnumber) => {
        if (charnumber == null || isNaN(charnumber)) return player.call('characterInit.choose.ans', [0]);
        if (charnumber < 0 || charnumber > 2) return player.call('characterInit.choose.ans', [0]);

        if (player.characters[charnumber]) {
					player.character = player.characters[charnumber]
					player.name = player.character.name
					delete player.characters
					characterInit.applyCharacter(player);

					player.xpInterval = setInterval(() => {
						player.character.hoursXP += 1
						player.character.mainLVL = calculateLevel(player)
						player.call('client::exp.toCef', [player.character.hoursXP])
						notifs.info(player, `Время нахождения в игре увеличено.`) //если че уберешь
					}, 60000 * 60)

					player.call('characterInit.choose.ans', [1])
					characterInit.spawn(player)
					admin.checkClearWarns(player)
					mp.events.call('characterInit.done', player)
				} else {
            player.call('characterInit.choose.ans', [1]);
            characterInit.create(player);
        }
    },
    "characterInit.slot.buy": async (player) => {
        let price = player.account.slots === 3 ? null : player.account.slots === 2 ? characterInit.costThirdSlot : characterInit.costSecondSlot;
        if (price) {
            if (player.account.donate >= price) {
                player.account.donate -= price;
                player.account.slots++;
                await player.account.save();
                player.call("characterInit.slot.buy.ans", [1, player.account.slots, player.account.donate]);
            }
            else {
                player.call("characterInit.slot.buy.ans", [0, player.account.slots, player.account.donate]);
            }
        }
        else {
            player.call("characterInit.slot.buy.ans", [2, player.account.slots, player.account.donate]);
        }
    },
    /// Разморозка игрока после выбора персоонажа
    "characterInit.done": (player) => {
        player.call('characterInit.done');
        player.authTime = Date.now();
        logger.log(`Авторизовал персонажа (IP: ${player.ip})`, "characterInit", player);
    },
    /// События создания персоонажа
    "characterInit.create.check": (player, fullname, charData) => {
        characterInit.save(player, fullname, charData);
    },
    "characterInit.loadCharacter": (player) => {
        characterInit.applyCharacter(player);
    },
    "inventory.done": (player) => {
        player.characterInit.created && characterInit.setStartClothes(player);
    },
    "playerQuit": (player) => {
        if (!player.character) return;

        var minutes = parseInt((Date.now() - player.authTime) / 1000 / 60);
        player.character.minutes += minutes;
        if (!player.dimension && !player.character.arrestTime && !player.inCasino) {
            player.character.x = player.position.x;
            player.character.y = player.position.y;
            player.character.z = player.position.z;
            player.character.h = player.heading;
        }
        player.character.save();

        player.account.lastIp = player.ip;
        player.account.lastDate = new Date();
        player.account.save();
        logger.log(`Деавторизовал персонажа`, "characterInit", player);
    },
};

function calculateLevel(player) {
	let totalTime = 0
	let level = 0
	let additionalTime = 4

	while (player.character.hoursXP >= totalTime) {
		totalTime += additionalTime
		level++
		additionalTime += 4
	}

	return level - 1
};
