const blackjack = require("./index");

module.exports = {
    "init": () => {
        blackjack.init();
        inited(__dirname);
    },
    
    "playerDeath": (player, reason, killer) => {
        blackjack.OnPlayerDeath(player);
    },

    "playerQuit": (player) => {
        blackjack.Disconnect(player);
    },

    "client_trycatch": (player, moduleName, eventName, errorText) => {
        console.log(`[CLIENT_ERROR] player: ${player.name}[${player.id}] - ${moduleName}`);
        console.log(`${eventName} => ${errorText}`);
    },

    "server.blackjack.character_occupy_place": blackjack.BlackjackOpen,
    "server.blackjack.character_leave_place": blackjack.BlackjackLeaveByPlayer,
    "server.blackjack.setBet": blackjack.SetBet,
    "server.blackjack.move": blackjack.BlackjackMove,
    
}