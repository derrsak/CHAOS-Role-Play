let clothes = call('clothes');
let inventory = call('inventory');
let notifs = call('notifications');
let weather = call('weather');

module.exports = {
    "init": async () => {
        await clothes.init();
        inited(__dirname);
    },
	"clothes.primerka": (player, x,y,z,w) => {
		player.setClothes(parseInt(x), parseInt(y), parseInt(z), parseInt(w));
    },
    "clothes.clime.check": (player) => {
        var temperature = weather.getCurrentWeather().temperature;
        inventory.checkClimeDamage(player, temperature, (text) => {
            notifs.warning(player, text, `Климат`);
        });
    },
};
