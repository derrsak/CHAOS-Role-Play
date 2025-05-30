let supermarket = require('./index.js');

module.exports = {
    "/loadmarkets": {
        access: 7,
        args: '',
        handler: (player, args) => {
            let list = [
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [29.1, -1350.1, 30.0],
                    "pickup": [26.1, -1345.0, 28.4],
                    "price": 185000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [376.6, 323.3, 103.5],
                    "pickup": [374.8, 328.3, 102.5],
                    "price": 152000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [1698.3, 4929.6, 42.0],
                    "pickup": [1698.2, 4924.8, 41.0],
                    "price": 85800
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [-1821.921, 787.7424, 138.1834],
                    "pickup": [-1820.7, 792.4, 137.1],
                    "price": 96000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [1159.864, -327.3117, 69.21395],
                    "pickup": [1163.2, -323.9, 68.2],
                    "price": 102400
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [-711.7557, -917.2692, 19.2142],
                    "pickup": [-707.7, -914.5, 18.2],
                    "price": 192000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [-53.29216, -1757.069, 29.43966],
                    "pickup": [-48.4, -1757.7, 28.4],
                    "price": 250000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [1730.876, 6410.715, 35.00065],
                    "pickup": [1730.1, 6416.4, 34.0],
                    "price": 96000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [1965.45, 3740.146, 32.32734],
                    "pickup": [1960.2, 3742.5, 31.3],
                    "price": 80000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [2682.5, 3282.227, 55.24056],
                    "pickup": [2676.9, 3281.8, 54.2],
                    "price": 217000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [544.105, 2673.123, 42.15447],
                    "pickup": [547.8, 2669.0, 41.1],
                    "price": 89000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [544.105, 2673.123, 42.15447],
                    "pickup": [547.8, 2669.0, 41.1],
                    "price": 115000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [-3239.264, 1004.406, 12.45598],
                    "pickup": [-3244.2, 1001.5, 11.8],
                    "price": 82000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [-3038.054, 589.7609, 7.81606],
                    "pickup": [-3041.5, 585.1, 6.9],
                    "price": 90000
                },
                {
                    "type": 1,
                    "name": "24/7",
                    "pos": [2559.797, 385.3533, 108.6211],
                    "pickup": [2555.1, -382.4, 107.6],
                    "price": 192000
                }
            ];

            list.forEach((current) => {
                db.Models.Supermarket.create({
                    x: current['pickup'][0],
                    y: current['pickup'][1],
                    z: current['pickup'][2]
                });
            });
        }
    },
    "/mk": {
        access: 6,
        args: '',
        handler: (player, args) => {
            player.position = new mp.Vector3(26.74213981628418, -1347.25341796875, 29.497028350830078);
        }
    }
}