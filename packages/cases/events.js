const cases = require("./index");

module.exports = {
    "init": async () => {
        await cases.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        cases.loadCharacterPrizesCase(player);
    },
    "cases.close": (player) => {
        cases.closeCase(player);
    },
    "cases.open": (player) => {
        cases.openCase(player);
    },
    "cases.choose": (player, save) => {
        cases.choosePrize(player, save);
    },
    "cases.prizes.show": (player) => {
        cases.showPrizes(player);
    },
    "cases.prizes.use": (player, id) => {
        cases.usePrize(player, id);
    },
    "playerQuit": (player) => {
        cases.choosePrize(player, true, true);
    },
}