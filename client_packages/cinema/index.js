const cinema_camera_pos = [-1426.763427734375, -230.83377075195312, 21.399110794067383];
const cinema_camera_lookat = [-1426.56396484375, -258.2504577636719, 21.399110794067383];
const player = mp.players.local;

let cinemaCam = null;
let inShapeCinema = false;

mp.events.add('cinema.shape.enter', (state) => {
    inShapeCinema = state;

    if (state) mp.prompt.show(`Используйте <span>E</span> для того, чтобы войти в кинотеатр.`);
    else mp.prompt.hide();
});

mp.keys.bind(0x45, true, () => { // E
    if (!inShapeCinema) return;
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    mp.events.callRemote('cinema.enter');
});

mp.events.add('cinema.enter.fadeScreen', async (time) => {
    mp.game.cam.doScreenFadeOut(time);
    await new Promise(resolve => setTimeout(resolve, time));
    mp.game.cam.doScreenFadeIn(time);
});

mp.events.add('cinema.open', (url, time, urls, skipped, votes, maxvotes, name) => {
    mp.callCEFV(`cinema.openCinema('${JSON.stringify(url)}', ${time}, '${JSON.stringify(urls)}', ${skipped}, ${votes}, ${maxvotes}, '${name}'); cinema.active = true`);

	cinemaCam = mp.cameras.new("default", new mp.Vector3(cinema_camera_pos[0], cinema_camera_pos[1], cinema_camera_pos[2]), new mp.Vector3(0,0,0), 40);
	cinemaCam.pointAtCoord(cinema_camera_lookat[0], cinema_camera_lookat[1], cinema_camera_lookat[2]);
	cinemaCam.setActive(true);
	mp.game.cam.renderScriptCams(true, false, 0, true, false);
	player.setVelocity(0.0, 0.0, 0.0);
	player.freezePosition(true);
    showHud(false);
});

mp.events.add('cinema.skipVideo', (time, url, urls, vote, votesm) => {
	mp.callCEFV(`cinema.skipVideo(${time}, '${JSON.stringify(url)}', '${JSON.stringify(urls)}', ${vote}, ${votesm})`);
});

mp.events.add('cinema.sendVote', (votes, maxvotes) => {
	mp.callCEFV(`cinema.setVote(${votes}, ${maxvotes})`);
});

mp.events.add('cinema.updateLine', (urls) => {
	mp.callCEFV(`cinema.updateLine('${JSON.stringify(urls)}')`);
});

mp.events.add('cinema.close', () => {
	mp.events.callRemote('cinema.exit');
	setTimeout(() => {
		if(cinemaCam != null)
		{
			cinemaCam.setActive(false);
			cinemaCam.destroy();
			cinemaCam = null;
			mp.game.cam.renderScriptCams(false, false, 0, true, false);
		}
	}, 400);
	
    showHud(true);
	player.freezePosition(false);
});

function showHud(status) {
    mp.inventory.enable(status);
    setTimeout(() => {
        mp.events.call('hud.enable', status);
        mp.game.ui.displayRadar(status);
        mp.callCEFR('setOpacityChat', [status ? 1.0 : 0.0]);
        mp.callCEFV(`playerMenu.enable = ${status}`);
    }, 100);
}