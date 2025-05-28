const drone = require('./index.js');

module.exports = {
    "/drone": {
        access: 6,
        description: "Запустить дрона от имени администратора",
        args: "[тип_дрона]:n",
        handler: (player, args, out) => {
            drone.droneStart(player, true, parseInt(args[0]));
        }
    }
}