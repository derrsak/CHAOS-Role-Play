let isInAtmEnter = false;

mp.events.add('atms.shape.enter', (enter) => {
    isInAtmEnter = enter;

    if (enter) mp.prompt.show('Используйте <span>E</span> для того, чтобы воспользоваться банкоматом.');
    else {
        mp.prompt.hide();
        mp.events.call('bank.close', [true]);
    }
});

mp.keys.bind(0x45, true, () => { // E
    if (!isInAtmEnter) return;
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    
    mp.events.callRemote('bank.entering');
});