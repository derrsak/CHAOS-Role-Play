const drone = require('./index.js');

module.exports = {
    'init': () => {
        drone.init();
        inited(__dirname);
    },
    'drone.start': (player) => {
        drone.droneStart(player);
    },
    'drone.stop': (player) => {
        drone.droneStop(player);
    },
    'playerQuit': (player) => {
        drone.droneStop(player);
    },
}