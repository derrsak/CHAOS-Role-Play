let timeout;

async function startScenario() {
	global.sleep = function (ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	global.soundCEF.execute(
		`playMusicIntro('./sounds/intro.mp3', 0.0)`
	)
};
global.soundCEF = mp.browsers.new('package://browser/sounds/index.html')



function stopScenario() {
	global.soundCEF.execute(`stopMusic()`)
	if (timeout != null) {
		clearTimeout(timeout)
		timeout = null
	}
};


mp.events.add({
	'client.intro.start': startScenario,
	'client.intro.stop': stopScenario
})
