const pauseMenu = require('./index.js');

module.exports = {
    "init": () => {
        pauseMenu.init();
        inited(__dirname);
    },
    "pauseMenu.show": (player) => {
        if (player.character) player.call('pauseMenu.show');
    }
}