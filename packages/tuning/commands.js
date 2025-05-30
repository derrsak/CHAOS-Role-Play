
var tuning = require('./index.js');
module.exports = {
    "/bdwheels": {
        access: 6,
        description: "Колёса",
        args: "[кол-во]",
        handler: (player, args, out) => {
            player.call(`wheelses.create`, [parseInt(args[0])]);
        }
    },
    "/mod": {
        access: 4,
        description: "Выдать тестовый тюнинг",
        args: "[тип] [индекс]",
        handler: (player, args, out) => {
            if (!player.vehicle) return out.error('Вы не в авто!', player);
            player.vehicle.setMod(parseInt(args[0]), parseInt(args[1]));
        }
    },
    "/colortrim": {
        access: 5,
        description: "Выдать цвет салона",
        args: "[цвет]",
        handler: (player, args, out) => {
            if (!player.vehicle) return out.error('Вы не в авто!', player);
            player.call(`changetrimcolor`, [parseInt(args[0])]);
        }
    },
    "/lsc": {
        access: 6,
        handler: (player, args) => {
            player.spawn(new mp.Vector3(-368.9290466308594, -126.58971405029297, 38.69566345214844));
        }
    },
    "/modsnum": {
        access: 6,
        handler: (player, args) => {
            player.call('mods.num', [parseInt(args[0])]);
        }
    },
    "/modlab": {
        access: 6,
        handler: (player, args) => {
            player.call('mods.label', [parseInt(args[0]), parseInt(args[1])]);
        }
    },
    "/getmod": {
        access: 6,
        handler: (player, args) => {
            player.call('mods.get', [parseInt(args[0])]);
        }
    },
}

