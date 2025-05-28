let isInDrone = false;
let isLspd = false;

let maxSpeed = 13;
let currentSpeed = 0;
let currentSpeedZ = 0;
let speedOffset = 0.4;
let speedLeftRight = 0.9;
let vision_state = 0;

// - main

mp.drone = {
    enter: (admin) => {
        if (admin && mp.adminLevel < 1) return;

        isInDrone = true;
        mp.prompt.show(`Управление: WASD, Высота: Z/Q, Режим камеры: Tab, Выход - ESC`);

        if (!admin) {
            isLspd = true;
            mp.drone.showHud(false);
        }
        mp.busy.add('drone', false, true);
    },

    exit: () => {
        mp.drone.stopAllScreenEffect();

        if (isLspd) mp.drone.showHud(true);
        isInDrone = false;
        isLspd = false;
        vision_state = 0;

        mp.events.callRemote('drone.stop');
        setTimeout(() => mp.busy.remove('drone', true), 100);
    },

    showHud: (status) => {
        mp.inventory.enable(status);
        setTimeout(() => {
            mp.events.call('hud.enable', status);
            mp.game.ui.displayRadar(status);
            mp.callCEFR('setOpacityChat', [status ? 1.0 : 0.0]);
        }, 100);
    },

    stopAllScreenEffect: () => {
        mp.game.invoke('0xB4EDDC19532BFB85'); // ANIMPOSTFX_STOP_ALL
        mp.game.graphics.setNightvision(false);
        mp.game.graphics.setSeethrough(false);
        mp.game.graphics.setTimecycleModifierStrength(0);
        mp.game.graphics.setNoiseoveride(false);
        mp.game.graphics.setNoisinessoveride(0);
        mp.game.graphics.transitionFromBlurred(0);
    },

    keyPressToggleVision: () => {
        if (!isInDrone) return;

        switch (vision_state) {
            case 0:
                mp.game.graphics.setNightvision(true);
                vision_state = 1;
                break;
            case 1:
                mp.game.graphics.setNightvision(false);
                mp.game.graphics.setSeethrough(true);
                vision_state = 2;
                break;
            default:
                mp.game.graphics.setNightvision(false);
                mp.game.graphics.setSeethrough(false);
                vision_state = 0;
                break;
        }
        mp.game.audio.playSoundFrontend(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", false);
    },

    playSound: (vehId, name, ref = '') => {
        let veh = mp.vehicles.atRemoteId(vehId);
        if (!veh || !mp.vehicles.exists(veh)) return;

        const sId = mp.game.invoke('0x430386FE9BF80B45');
        mp.game.audio.playSoundFromEntity(sId, name, veh.handle, ref, true, 0);
    }
};

// - events

mp.events.add('drone.start', (admin) => {
    mp.drone.enter(admin);
});

mp.events.add('drone.sync.sound', (vehId) => {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (!veh || !mp.vehicles.exists(veh)) return;

    veh.setAlpha(0);
    veh.setCanBeDamaged(false);
    veh.setInvincible(true);
    mp.drone.playSound(veh.remoteId, "Flight_Loop", "DLC_Arena_Drone_Sounds");
});

mp.events.add('playerLeaveVehicle', () => {
    if (isInDrone) mp.drone.exit();
});

mp.events.add("entityStreamIn", (entity) => {
    if (entity.type !== "vehicle") return;
    if (!mp.vehicles.exists(entity)) return;
    if (!entity.getVariable('isDrone')) return;

    entity.setAlpha(0);
    mp.drone.playSound(entity.remoteId, "Flight_Loop", "DLC_Arena_Drone_Sounds");
    entity.setCanBeDamaged(false);
    entity.setInvincible(true);
});

// - binds

mp.keys.bind(0x1B, true, function() { // esc
    if (mp.game.ui.isPauseMenuActive()) return;
    if (isInDrone) mp.drone.exit();
});

mp.keys.bind(0x09, true, function() { // tab
    if (mp.game.ui.isPauseMenuActive()) return;
    if (isInDrone) mp.drone.keyPressToggleVision();
});

// - attach reg

mp.attachmentMngr.register("drone_0", "ch_prop_casino_drone_02a", 0, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
mp.attachmentMngr.register("drone_1", "xs_prop_arena_drone_02", 0, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
mp.attachmentMngr.register("drone_2", "ba_prop_battle_cameradrone", 0, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));
mp.attachmentMngr.register("drone_3", "ba_prop_battle_drone_hornet", 0, new mp.Vector3(0, 0, 0), new mp.Vector3(0, 0, 0));

// - other

mp.events.add('render', () => {
    if (!isInDrone) return;
    const v = mp.players.local.vehicle;
    if (!v) return;

    disableControls();

    let isPressW = mp.game.controls.isDisabledControlPressed(0, 33); // W
    let isPressA = mp.game.controls.isDisabledControlPressed(0, 34); // A
    let isPressS = mp.game.controls.isDisabledControlPressed(0, 32); // S
    let isPressD = mp.game.controls.isDisabledControlPressed(0, 35); // D

    let inputRoll     = isPressW ? speedOffset * -1 : 0;    // W
    let inputYaw      = isPressA ? speedLeftRight : 0;      // A
    let inputPitch    = isPressS ? speedOffset : 0;         // S
    let inputThrottle = isPressD ? speedLeftRight * -1 : 0; // D

    let hasColl = v.hasCollidedWithAnything();

    let offsetStop = 0;
    let offsetRotRoll = 0;
    let offsetRotYaw = 0;

    if (isPressS)
        offsetRotRoll = -0.6;
    if (isPressW)
        offsetRotRoll = 0.6;

    if (isPressA && (currentSpeed > 5 || currentSpeed < -5))
        offsetRotYaw = -2;
    if (isPressD && (currentSpeed > 5 || currentSpeed < -5))
        offsetRotYaw = 2;


    let zOffset = 0;
    let zOffsetStop = 0;
    if (mp.game.controls.isDisabledControlPressed(0, 44) && !hasColl) // Q
        zOffset = 0.004;
    if (mp.game.controls.isDisabledControlPressed(0, 20) && !hasColl) // Z
        zOffset = -0.004;

    if (!mp.game.controls.isDisabledControlPressed(0, 20) && !mp.game.controls.isDisabledControlPressed(0, 44) && !hasColl) {
        if (currentSpeedZ < -0.1)
            zOffsetStop = 0.004;
        else if (currentSpeedZ > 0.1)
            zOffsetStop = -0.004;
        else if (currentSpeedZ < 0)
            zOffsetStop = 0.001;
        else if (currentSpeedZ > 0)
            zOffsetStop = -0.001;
    }

    if (!isPressA && !isPressD) {
        if (v.getRotation(0).y < -1)
            offsetRotYaw = 2;
        else if (v.getRotation(0).y > 1)
            offsetRotYaw = -2;
        else if (v.getRotation(0).y < 0)
            offsetRotYaw = 0.001;
        else if (v.getRotation(0).y > 0)
            offsetRotYaw = -0.001;
    }

    if (!isPressS && !isPressW && currentSpeed !== 0) {
        if (currentSpeed < -1)
            offsetStop = 0.05;
        else if (currentSpeed > 1)
            offsetStop = -0.05;
        else if (currentSpeed < 0)
            offsetStop = 0.001;
        else if (currentSpeed > 0)
            offsetStop = -0.001;

        if (v.getRotation(0).x < -1)
            offsetRotRoll = 0.6;
        else if (v.getRotation(0).x > 1)
            offsetRotRoll = -0.6;
        else if (v.getRotation(0).x < 0)
            offsetRotRoll = 0.001;
        else if (v.getRotation(0).x > 0)
            offsetRotRoll = -0.001;
    }

    let yoff = inputPitch + inputRoll;
    let xoff = inputYaw + inputThrottle;

    currentSpeed += yoff + offsetStop;

    if (v.isInWater())
        zOffset = 0.01;

    let speedOffsetZ = 0;
    if (currentSpeed > 1) {
        speedOffsetZ = zOffset + (v.getRotation(0).x / -200);
    }
    if (currentSpeed < -1) {
        speedOffsetZ = zOffset + (v.getRotation(0).x / 400);
    }

    currentSpeedZ += zOffset + zOffsetStop;
    if (currentSpeedZ > maxSpeed / 100)
        currentSpeedZ = maxSpeed / 100;
    if (currentSpeedZ < maxSpeed / -100)
        currentSpeedZ = maxSpeed / -100;

    if (maxSpeed < currentSpeed)
        currentSpeed = maxSpeed;
    if ((maxSpeed * -1 / 2) > currentSpeed)
        currentSpeed = (maxSpeed * -1 / 2);

    if (hasColl && currentSpeed > 5)
        currentSpeed = 5;

    let newPos = v.getOffsetFromInWorldCoords(0, currentSpeed / 50, currentSpeedZ + speedOffsetZ);
    let heading = v.getRotation(0).z;

    v.setVelocity(0, currentSpeed / 30, currentSpeedZ + (v.getRotation(0).x / - 100));

    let finalX = offsetRotRoll + v.getRotation(0).x;
    let finalY = offsetRotYaw + v.getRotation(0).y;

    if (finalX > 25)
        finalX = 25;
    if (finalX < -25)
        finalX = -25;

    if (finalY > 50)
        finalY = 50;
    if (finalY < -50)
        finalY = -50;

    v.setRotation(finalX, finalY, heading + xoff, 0, false);
    v.setCoordsNoOffset(newPos.x, newPos.y, newPos.z, true, true, true);
});

function disableControls() {
    mp.game.controls.disableControlAction(0, 85, true); // Q
    mp.game.controls.disableControlAction(0, 75, true); // F
    mp.game.controls.disableControlAction(0, 8, true);
    mp.game.controls.disableControlAction(0, 9, true);
    mp.game.controls.disableControlAction(0, 30, true);
    mp.game.controls.disableControlAction(0, 31, true);
    mp.game.controls.disableControlAction(0, 32, true);
    mp.game.controls.disableControlAction(0, 33, true);
    mp.game.controls.disableControlAction(0, 34, true);
    mp.game.controls.disableControlAction(0, 35, true);
    mp.game.controls.disableControlAction(0, 36, true);
    mp.game.controls.disableControlAction(0, 63, true);
    mp.game.controls.disableControlAction(0, 64, true);
    mp.game.controls.disableControlAction(0, 71, true);
    mp.game.controls.disableControlAction(0, 72, true);
    mp.game.controls.disableControlAction(0, 77, true);
    mp.game.controls.disableControlAction(0, 78, true);
    mp.game.controls.disableControlAction(0, 78, true);
    mp.game.controls.disableControlAction(0, 87, true);
    mp.game.controls.disableControlAction(0, 88, true);
    mp.game.controls.disableControlAction(0, 89, true);
    mp.game.controls.disableControlAction(0, 90, true);
    mp.game.controls.disableControlAction(0, 129, true);
    mp.game.controls.disableControlAction(0, 130, true);
    mp.game.controls.disableControlAction(0, 133, true);
    mp.game.controls.disableControlAction(0, 134, true);
    mp.game.controls.disableControlAction(0, 136, true);
    mp.game.controls.disableControlAction(0, 139, true);
    mp.game.controls.disableControlAction(0, 146, true);
    mp.game.controls.disableControlAction(0, 147, true);
    mp.game.controls.disableControlAction(0, 148, true);
    mp.game.controls.disableControlAction(0, 149, true);
    mp.game.controls.disableControlAction(0, 150, true);
    mp.game.controls.disableControlAction(0, 151, true);
    mp.game.controls.disableControlAction(0, 232, true);
    mp.game.controls.disableControlAction(0, 266, true);
    mp.game.controls.disableControlAction(0, 267, true);
    mp.game.controls.disableControlAction(0, 268, true);
    mp.game.controls.disableControlAction(0, 269, true);
    mp.game.controls.disableControlAction(0, 278, true);
    mp.game.controls.disableControlAction(0, 279, true);
    mp.game.controls.disableControlAction(0, 338, true);
    mp.game.controls.disableControlAction(0, 339, true);
    mp.game.controls.disableControlAction(0, 44, true);
    mp.game.controls.disableControlAction(0, 20, true);
    mp.game.controls.disableControlAction(0, 47, true);
}