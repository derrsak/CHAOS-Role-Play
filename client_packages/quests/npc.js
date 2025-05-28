// -- npc --

let nearbyNPC = false;      // npc рядом
let npcList = [];           // список npc

mp.keys.bind(0x45, true, () => { // E
    if (!nearbyNPC) return;
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    
    mp.events.callRemote('quest.npc.startDialog');
});

mp.events.add('quest.npc.nearby', (state) => {
    nearbyNPC = state;

    if (state) mp.prompt.show('Используйте <span>E</span> для того, чтобы поговорить с NPC.');
    else {
        mp.prompt.hide();
        mp.callCEFV(`dialogs.setState(false);`); // закрыть диалог с NPC (это тоже впихнуть в переход камеры)

        // плавный переход камеры на игрока (функцию сделать отдельную)
        mp.events.call('quest.npc.dialog.cameraOff', 1000);
    }
});

mp.events.add('quest.npc.dialog', (data) => {
    mp.callCEFV(`dialogs.setDialog('${JSON.stringify(data)}');`);
    mp.callCEFV(`dialogs.setState(true);`); // открытие диалога в cef

    // плавный переход камеры на нпц
    mp.events.call('quest.npc.dialog.cameraOn', data.npcId, 1000);
});

mp.events.add('quest.npc.dialog.callback', (event, data) => {
    mp.callCEFV(`dialogs.setState(false);`); // закрыть диалог с NPC
    mp.events.call('quest.npc.dialog.cameraOff', 1000);
    // плавный переход камеры на игрока (функцию сделать отдельную)

    switch (event) {
        case 'close':
            break;
        case 'quest':
            sendQuestPlayer(data);
            break;
    }

});

mp.events.add('quest.npc.createNpc', (data) => {

    /*  data:
        {
            id: npc.id,
            position: {
                x: npc.x,
                y: npc.y,
                z: npc.z
            },
            dimension: npc.d,
            heading: npc.h,
            model: npc.model,
            defaultScenario: npc.scenario,
        }
    */

    const ped = mp.peds.new(mp.game.joaat(data.model), data.position, data.heading, data.dimension);
    ped.scenario = data.defaultScenario;
    ped.taskStartScenarioInPlace(data.defaultScenario, 0, false);

    npcList.push({
        id: data.id,
        pos: data.position,
        d: data.dimension,
        h: data.heading,
        ped: ped
    });
});

mp.events.add('quest.npc.deleteNpc', (npcId) => {
    const npc = getNpcById(npcId);
    if (!npc) return;

    const npcIndex = npcList.findIndex(x => x.id == npcId);
    if (npcIndex == -1) return;

    npc.ped.destroy();
    npcList.splice(npcIndex, 1);
});

mp.events.add('quest.npc.updateNpcInfo', (npcId, data) => {
    const npc = getNpcById(npcId);
    if (!npc) return;

    npc.ped.model = mp.game.joaat(data.model);
    npc.ped.scenario = data.defaultScenario;
    npc.ped.dimension = data.dimension;
    npc.ped.position = new mp.Vector3(data.position.x, data.position.y, data.position.z - 1);
    npc.ped.setHeading(data.heading);
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type != 'ped') return;
    if (!entity.scenario) return;
    entity.taskStartScenarioInPlace(entity.scenario, 0, false);
});

function getNpcById(npcId) {
    return npcList.find(x => x.id == npcId);
}

function sendQuestPlayer(questId) {
    mp.events.callRemote('quest.npc.dialog.SendQuest', questId);
}

// -- npc camera
let handCamera;

function toRadian(x) {
    return Math.PI * x / 180;
}

mp.events.add('quest.npc.dialog.cameraOn', (npcId, transitionTime = 0) => {
    const npc = getNpcById(npcId);
    if (!npc) return;

    mp.prompt.hide();

    handCamera = mp.cameras.new('default', new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0), 50);
    handCamera.setActive(true);
    handCamera.pointAtCoord(npc.pos.x, npc.pos.y, npc.pos.z + 0.6);

    const heading = npc.ped.getHeading() + 90;
    const markerX = npc.ped.getCoords(true).x + 0.8 * Math.cos(heading * Math.PI / 180.0);
    const markerY = npc.ped.getCoords(true).y + 0.8 * Math.sin(heading * Math.PI / 180.0);

    const newPos = new mp.Vector3(markerX, markerY, npc.ped.getCoords(true).z + 0.6);
    handCamera.setCoord(newPos.x, newPos.y, newPos.z);
    mp.game.cam.renderScriptCams(true, transitionTime > 0, transitionTime, true, false);

    //mp.players.local.setAlpha(0);
});

mp.events.add('quest.npc.dialog.cameraOff', (transitionTime = 0)=>{
    if(!handCamera) return;
    
    mp.game.cam.renderScriptCams(false, transitionTime>0, transitionTime, true, true);
    handCamera.destroy();
    handCamera = null;
    
    // setTimeout(()=>{
    //     mp.players.local.setAlpha(255);
    // }, transitionTime/2);
});