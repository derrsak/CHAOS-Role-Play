const elevators = require('./index.js');

module.exports = {
    'init': () => {
        elevators.loadElevators();
        inited(__dirname);
    },
    'elevators.startElevate': (player) => {
        elevators.startElevateTp(player);
    }
}