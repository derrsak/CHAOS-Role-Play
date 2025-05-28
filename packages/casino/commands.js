const casino = require('./index.js');
const utils = call('utils');

module.exports = {
    "/resetlw": {
        access: 6,
        description: "Сброс кулдауна прокрута колеса",
        args: "[ид_игрока]:n",
        handler: (player, args, out) => {
            const target = mp.players.at(args[0]);
            if (!target || !target.character) return out.error(`Игрок ID ${args[0]} не в сети`, player);

            target.character.lastLuckyWheelRoll = null;
            target.character.save();
            out.info(`Админ ${player.name} сбросил кулдаун колеса удачи игроку ${target.name}`);
        }
    },
    "/slotsm": {
        access: 6,
        description: "Моделирование прибыли на слот-машинах",
        args: "[размер_ставки]:n [количество_ставок]:n",
        handler: (player, args, out) => {
            let bet = args[0];
            let count = args[1];
            let income = 0;
            for (let i = 0; i < count; i++) {
                let res = casino.getSlotMachineResult();
                let prize = casino.getSlotMachinePrize(res, bet);
                income += prize;
            }
            out.info(`Размер ставки: ${bet} фишек`, player);
            out.info(`Количество ставок: ${count}`, player);
            out.info(`Потрачено: ${count * bet} фишек`, player);
            out.info(`Заработано: ${income} фишек`, player);
        }
    },
    "/smhelper": {
        access: 6,
        description: "Помощь при создании автоматов (вывод инфы в консоль)",
        args: "",
        handler: (player, args, out) => {
            let pos = player.position;
            let heading = player.heading;
            let zOffset = -1;
            if (!player.helperSlotObjects) player.helperSlotObjects = [];
            player.helperSlotObjects.push(mp.objects.new(mp.joaat('vw_prop_casino_slot_02a'),
                new mp.Vector3(pos.x, pos.y, pos.z + zOffset), {dimension: player.dimension, rotation: new mp.Vector3(0, 0, heading)}));

            let helperObject = {
                model: 'vw_prop_casino_slot_02a',
                pos: [pos.x, pos.y, pos.z + zOffset],
                heading: heading
            };
            console.log(helperObject);
        }
    },
    "/smhd": {
        access: 6,
        description: "Удалить последний автомат",
        args: "",
        handler: (player, args, out) => {
            if (!player.helperSlotObjects) return;
            let obj = player.helperSlotObjects.pop();
            if (mp.objects.exists(obj)) obj.destroy();
        }
    },
}