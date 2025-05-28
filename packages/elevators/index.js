const factions = require('../factions');
const notifs = require('../notifications');

const elevatorsCoords = [
    {
        factionId: 4, // FIB
        'lower': { // нижний
            x: 136.06,
            y: -761.72,
            z: 45.75,
            h: 155.62
        },
        'upper': { // верхний
            x: 136.09,
            y: -761.81,
            z: 242.15,
            h: 158.14
        }
    },
    {
        factionId: 5, // hospital
        'lower': {
            x: 339.94,
            y: -584.66,
            z: 28.80,
            h: 65.15
        },
        'upper': {
            x: 330.08,
            y: -601.06,
            z: 43.28,
            h: 67.96
        }
    }
];

module.exports = {
    loadElevators() {
        elevatorsCoords.forEach(el => {
            for (let pos in el) {
                if (typeof el[pos] == 'number' || el[pos] == null) continue;

                let elevate = el[pos];
                let shape = mp.colshapes.newSphere(elevate.x, elevate.y, elevate.z, 1);

                shape.onEnter = (player) => {
                    if (player.vehicle) return;
                    if (el.factionId && player.character.factionId != el.factionId) return notifs.error(player, `Вы не можете использовать этот лифт`, `Лифт`);
                    player.isElevator = el;
                    player.isElevatorPos = pos;
                    player.call('elevators.shape.enter', [true]);
                };

                shape.onExit = (player) => {
                    delete player.isElevator;
                    delete player.isElevatorPos;
                    player.call('elevators.shape.enter', [false]);
                };
            }
        });
    },
    startElevateTp(player) {
        if (player.vehicle) return;
        let elevate = Object.assign({}, player.isElevator);
        if (!elevate || (elevate.factionId && player.character.factionId != elevate.factionId)) return;

        let coordsToElevate = player.isElevatorPos == 'lower' ? elevate['upper'] : elevate['lower'];

        player.position = new mp.Vector3(coordsToElevate.x, coordsToElevate.y, coordsToElevate.z);
        player.heading = coordsToElevate.h;
        player.call('elevators.resetCam', []);
    }
};