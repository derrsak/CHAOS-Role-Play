let isInGarageVehicle = false;
let isInPointGarage = false;
mp.events.add('vehicles.garage', (state) => {
    isInGarageVehicle = state;
    if (state) mp.prompt.showByName('garage_control');
});
mp.events.add('vehicles.garage.3nter', (state) => {
    isInPointGarage = state;
    if (isInPointGarage) mp.prompt.showByName('garage_control2');
    else mp.prompt.hide();
});
mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInGarageVehicle) return;
    isInGarageVehicle = false;
    mp.prompt.hide();
    mp.events.callRemote('vehicles.garage.leave');
});
mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInPointGarage) return;
    isInPointGarage = false;
    mp.prompt.hide();
    mp.events.callRemote('vehicles.garage.3nter');
});