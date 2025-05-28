const cinema = require('./index.js');

module.exports = {
    'init': async () => {
        await cinema.init();
        inited(__dirname);
    },
    'cinema.enter': (player) => {
        cinema.enter(player);
    },
    'cinema.exit' : (player) => {
        cinema.exit(player);
    },
    'cinema.voteSkip': (player) => {
        cinema.voteSkipVideo(player);
    },
    'cinema.setUrl': (player, url) => {
        cinema.setVideo(player, url);
    }
}