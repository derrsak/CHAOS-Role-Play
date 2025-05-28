let isInElevateEnter = false;

mp.events.add('elevators.shape.enter', (enter) => {
    isInElevateEnter = enter;

    if (enter) mp.prompt.show(`Используйте <span>E</span> для того, чтобы использовать лифт.`);
    else mp.prompt.hide();
});

mp.keys.bind(0x45, true, () => { // E
    if (!isInElevateEnter) return;
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    mp.events.callRemote('elevators.startElevate');
});

mp.events.add('elevators.resetCam', () => {
    mp.utils.resetPlayerCam();
});