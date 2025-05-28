const roulette = require("./index");

module.exports = {
    "init": () => {
        roulette.init();
        inited(__dirname);
    },

    "server_make_roulette_bet": (player, spot) => {
        roulette.makeRouletteBet(player, spot);
    },

    "serverSetRouletteBet": (player, val) => {
        roulette.setBet(player, val);
    },

    "exitRoulette": (player) => {
        roulette.exitRoulette(player);
    },

    "roulette_seat": (player) => {
        if (player.inRouletteTablet == null) return;
        roulette.seatAtRoulette(player, player.inRouletteTablet);
    }
}