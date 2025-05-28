const vehicles = require('../vehicles');
const timer = require('../timer');
const factions = require('../factions');
const inventory = require('../inventory');
const notifs = require('../notifications');

const DRON_ITEM_ID = 45;

module.exports = {

    init() {
        console.log('[DRONS] Модуль дронов загружен');
    },

    async droneStart(player, admin = false, type = 0) {
        if (!player.character) return;
        if (admin && player.character.admin < 1) return;
        const header = '[Запуск дрона]';

        const dron = inventory.getItemByItemId(player, DRON_ITEM_ID);
        if (!dron) return notifs.error(player, `У вас нет дрона`, header);
        if (!inventory.isInHands(dron)) return notifs.error(player, `Дрон не в руках`, header);

        if (!admin) {
            const factionId = player.character.factionId;

            if (factions.isPoliceFaction(factionId) || factions.isFibFaction(factionId) || factions.isArmyFaction(factionId)) type = 0;
            else if (factions.isNewsFaction(factionId)) type = 1;
            else return notifs.error(player, `Вы не умеете им управлять`, header);
        }

        let veh = {
            modelName: 'rcbandito',
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
            h: player.heading,
            color1: 0,
            color2: 0,
            license: 0,
            key: 'drone',
            owner: 0,
            fuel: 100,
            mileage: 0,
            plate: `DRONE`,
            destroys: 0
        };
        veh = await vehicles.spawnVehicle(veh);

        veh.droneType = type;
        if (!admin) veh.dronePos = player.position;
        veh.spawnedBy = player.name;
        veh.locked = true;
        veh.dimension = player.dimension;
        player.putIntoVehicle(veh, 0);

        veh.alpha = 0;
        player.addAttachment(`drone_${type.toString()}`);
        veh.setVariable('isDrone', true);

        notifs.success(player, `Дрон запущен!`, header);
        inventory.notifyOverhead(player, `Запустил дрона`);

        mp.players.forEachInRange(player.position, 300, rec => rec.call('drone.sync.sound', [veh.id]));
        player.call('drone.start', [admin]);
    },

    droneStop(player) {
        const veh = player.vehicle;
        if (!veh || veh.key != 'drone') return;

        const droneType = veh.droneType.toString();
        if (player.hasAttachment(`drone_${droneType}`)) player.addAttachment(`drone_${droneType}`, true);
        if (veh.dronePos) player.position = veh.dronePos;

        inventory.notifyOverhead(player, `Спрятал дрона`);
        timer.remove(veh.fuelTimer);
        veh.destroy();
    }
};