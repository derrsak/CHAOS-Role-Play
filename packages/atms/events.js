const atms = require('./index.js');

module.exports = {
    'init': async () => {
        await atms.init();
        inited(__dirname);
    }
}