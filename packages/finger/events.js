"use strict";
let finger = require("./index.js");

module.exports = {
    "init": () => {
        finger.init();
        inited(__dirname);
    },
	"fpsync.update": (player, camPitch, camHeading) => {
		mp.players.call(player.streamedPlayers, "fpsync.update", [player.id, camPitch, camHeading]);
	},
	"pointingStop": (player) => {
		player.stopAnimation();
	},
};