let breakdowns = require('vehicles/breakdowns.js');
let sell = require('vehicles/sell.js');
let garage = require('vehicles/garage.js');
let radiosync = require('vehicles/radiosync.js');
let own = require('vehicles/own.js');
let controlsDisabled = false;
let currentSirenState = false;
let isCurrentVehicleElectric = false;
mp.speedometerEnabled = true;

mp.events.add("playerLeaveVehicle", () => {
    mp.callCEFV('speedometer.arrow = 0');
    mp.callCEFV('speedometer.emergency = false');
    mp.timer.add(() => {
        try {
            currentSirenState = false;
        } catch (err) {
            mp.chat.debug('currentSirenState = false error')
        }

    }, 2000);

});

mp.events.addDataHandler("engine", (entity) => {
    var player = mp.players.local;
    var engine = entity.getVariable('engine');
    entity.setUndriveable(!engine);
    entity.setEngineOn(engine, true, true);

});

mp.timer.addInterval(() => { /// Синхронизация двигателя
    try {
        var player = mp.players.local;
        if (player.vehicle && mp.vehicles.exists(player.vehicle)) {
            var engine = player.vehicle.getVariable('engine') || false;

            player.vehicle.setUndriveable(!engine);
            player.vehicle.setEngineOn(engine, true, true);
        }
    } catch (err) {
        mp.chat.debug('engine sync error');
    }

}, 100);

let lastLightState;
let lightState = 0;
let lastLockStatus;

speedometerUpdateTimer = mp.timer.addInterval(() => { /// Обновление спидометра

    try {
        if ((!mp.players.local.vehicle) || (mp.players.local.vehicle.getPedInSeat(-1) != mp.players.local.handle)) return;

        let engine = mp.players.local.vehicle.getIsEngineRunning();
        let lastEngine;
        if (engine != lastEngine) {
            if (!engine) {
                mp.callCEFV(`speedometer.isActive = false`);
                lastEngine = false;
            } else {
                mp.callCEFV(`speedometer.isActive = true`);
                lastEngine = true;
            }
        }

        let speed = Math.floor(mp.players.local.vehicle.getSpeed() * 3.6);
        mp.callCEFV(`speedometer.speed = ${speed}`);

        let lights = mp.players.local.vehicle.getLightsState(1, 1); /// Фары

        let low = lights.lightsOn;
        let high = lights.highbeamsOn;
        if (low == 0 && high == 0) lightState = 0;
        if (low == 0 && high == 1) lightState = 1;
        if (low == 1 && high == 0) lightState = 2;
        if (low == 1 && high == 1) lightState = 3;
        if (lastLightState != lightState) {
            mp.callCEFV(`speedometer.headlights = ${lightState}`);
            lastLightState = lightState;
        }
        let lockStatus = mp.players.local.vehicle.getDoorLockStatus();
        if (lockStatus != lastLockStatus) {
            lastLockStatus = lockStatus;
            if (lockStatus == 1) {
                mp.callCEFV(`speedometer.lock = 0`);
            } else {
                mp.callCEFV(`speedometer.lock = 1`);
            }
        }
    } catch (err) {
        mp.chat.debug('speedometerUpdateTimer error');
    }


}, 100);

mp.keys.bind(0x32, true, function() {
    if (mp.busy.includes(['chat', 'cuffs', 'terminal'])) return;
    if (!mp.players.local.vehicle) return;
    if (mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
        mp.events.callRemote('vehicles.engine.toggle');
    }
});

mp.events.add('vehicles.engine.toggle', (state) => {
    mp.callCEFV(`speedometer.isActive = ${state}`);
})

mp.events.add('vehicles.speedometer.show', (state, isElectric = isCurrentVehicleElectric) => {
    isCurrentVehicleElectric = isElectric;
    if (mp.speedometerEnabled) {
        if (state) {
            let vehicle = mp.players.local.vehicle;
            if (!vehicle) return;
            let engine = vehicle.getIsEngineRunning()
            mp.callCEFV(`speedometer.isElectricCar = ${isElectric}`);
            mp.callCEFV(`speedometer.isActive = ${engine}`);
            mp.callCEFV('speedometer.show = true');
        } else {
            mp.callCEFV('speedometer.show = false');
        }
    }

});

mp.events.add('vehicles.speedometer.sync', () => {

    let vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);

    if (left && right) {
        mp.callCEFV('speedometer.emergency = true');
    }
    if (left && !right) {
        mp.callCEFV('speedometer.arrow = 1');
    }
    if (!left && right) {
        mp.callCEFV('speedometer.arrow = 2');
    }
});

mp.events.add('vehicles.speedometer.fuel.update', (litres) => {
    mp.callCEFV(`speedometer.fuel = ${litres}`);
});

mp.events.add('vehicles.speedometer.mileage.update', (mileage) => {
    mileage = parseInt(mileage);
    mp.callCEFV(`speedometer.mileage = ${mileage}`);
});

mp.events.add('vehicles.speedometer.max.update', (fuel) => {
    mp.callCEFV(`speedometer.maxFuel = ${fuel}`);
    let vehicle = mp.players.local.vehicle;
    if (!vehicle) return;
    let maxSpeed = (mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model) * 3.6).toFixed(0);
    mp.callCEFV(`speedometer.maxSpeed = ${maxSpeed}`);
});

var mileageTimer, mileageUpdateTimer, lastPos, currentDist = 0;

mp.events.add('vehicles.mileage.start', (value) => {
    if (mp.players.local.vehicle) {
        mp.players.local.vehicle.mileage = value;
    }
    startMileageCounter();
});

function startMileageCounter() {

    var player = mp.players.local;
    lastPos = player.position;
    stopMileageCounter();
    mileageTimer = mp.timer.addInterval(() => {
        var vehicle = player.vehicle;
        if (!vehicle) return stopMileageCounter();

        var dist = (vehicle.position.x - lastPos.x) * (vehicle.position.x - lastPos.x) + (vehicle.position.y - lastPos.y) * (vehicle.position.y - lastPos.y) +
            (vehicle.position.z - lastPos.z) * (vehicle.position.z - lastPos.z);
        dist = Math.sqrt(dist);
        if (dist > 200) dist = 50;
        dist /= 1000;

        currentDist += dist;
        lastPos = vehicle.position;

        var mileage = vehicle.mileage + currentDist;
        mp.events.call('vehicles.speedometer.mileage.update', mileage);
    }, 1000);
    mileageUpdateTimer = mp.timer.addInterval(() => {
        try {
            var vehicle = player.vehicle;
            if (!vehicle) return stopMileageCounter();
            if (currentDist < 0.1) return;
            mp.events.callRemote(`vehicles.mileage.add`, currentDist);
            vehicle.mileage += currentDist;
            currentDist = 0;
        } catch (err) {
            mp.chat.debug('mileageUpdateTimer error');
        }
    }, 60000);
};

function stopMileageCounter() {

    mp.timer.remove(mileageTimer);
    mp.timer.remove(mileageUpdateTimer);

    if (currentDist < 0.1) return;
    mp.events.callRemote(`vehicles.mileage.add`, currentDist);
    currentDist = 0;
};

mp.keys.bind(0x25, true, function() {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);
    mp.callCEFV('speedometer.arrow = 0');
    if (!left || !right) {
        mp.events.callRemote("vehicles.signals.left", !left);
        if (!left) {
            mp.callCEFV('speedometer.arrow = 0');
            mp.callCEFV('speedometer.arrow = 1');
        } else {
            mp.callCEFV('speedometer.arrow = 0');
        }

    }
});

mp.keys.bind(0x27, true, function() {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);
    mp.callCEFV('speedometer.arrow = 0');
    if (!left || !right) {
        mp.events.callRemote("vehicles.signals.right", !right);
        if (!right) {
            mp.callCEFV('speedometer.arrow = 0');
            mp.callCEFV('speedometer.arrow = 2');
        } else {
            mp.callCEFV('speedometer.arrow = 0');
        }
    }
});

mp.keys.bind(0x28, true, () => {
    if (mp.busy.includes()) return;
    var player = mp.players.local;
    var vehicle = player.vehicle;
    if (!vehicle) return;
    if (vehicle.getPedInSeat(-1) != player.handle) return;

    var left = vehicle.getVariable(`leftTurnSignal`);
    var right = vehicle.getVariable(`rightTurnSignal`);

    if (left && right) {
        mp.events.callRemote(`vehicles.signals.emergency`, false);
        mp.callCEFV('speedometer.arrow = 0');
        mp.callCEFV('speedometer.emergency = false');
    } else {
        mp.events.callRemote(`vehicles.signals.emergency`, true);
        mp.callCEFV('speedometer.arrow = 0');
        mp.callCEFV('speedometer.emergency = true');
    }
});

mp.keys.bind(87, true, () => { // W
    var player = mp.players.local;
    if (!player.autopilot || !player.vehicle) return;
    delete player.autopilot;
    player.clearTasks();
    mp.notify.info("Автопилот деактивирован");
});

mp.events.addDataHandler("leftTurnSignal", (entity) => {
    var player = mp.players.local;
    var left = entity.getVariable('leftTurnSignal');
    entity.setIndicatorLights(1, left);
});

mp.events.addDataHandler("rightTurnSignal", (entity) => {
    var player = mp.players.local;
    var right = entity.getVariable('rightTurnSignal');
    entity.setIndicatorLights(0, right);
});

mp.events.addDataHandler("hood", (entity) => {
    var hood = entity.getVariable('hood');
    if (hood) {
        entity.setDoorOpen(4, false, false);
    } else {
        entity.setDoorShut(4, false);
    }
});


mp.events.addDataHandler("trunk", (entity) => {
    var trunk = entity.getVariable('trunk');
    if (trunk) {
        entity.setDoorOpen(5, false, false);
    } else {
        entity.setDoorShut(5, false);
    }
});

mp.events.addDataHandler("sirenSound", (entity) => {
    var sirenSound = entity.getVariable("sirenSound");
    entity.setSirenSound(sirenSound);
});

mp.events.addDataHandler("sirenLights", (entity) => {
    var sirenLights = entity.getVariable("sirenLights");
    entity.setSiren(sirenLights);
});

mp.events.addDataHandler("heading", (entity, value) => {
    if (value != null) entity.setHeading(value);
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type == 'vehicle') {
        let left = entity.getVariable("leftTurnSignal") || false;
        let right = entity.getVariable("rightTurnSignal") || false;
        entity.setIndicatorLights(1, left);
        entity.setIndicatorLights(0, right);

        let hood = entity.getVariable("hood") || false;
        let trunk = entity.getVariable("trunk") || false;

        let sirenLights = entity.getVariable("sirenLights") || false;
        let sirenSound = entity.getVariable("sirenSound") || false;

        if (hood) {
            entity.setDoorOpen(4, false, false);
        } else {
            entity.setDoorShut(4, false);
        }

        if (trunk) {
            entity.setDoorOpen(5, false, false);
        } else {
            entity.setDoorShut(5, false);
        }

        entity.setSiren(sirenLights);
        entity.setSirenSound(sirenSound);

        var rotation = entity.getVariable("rotation");
        if (rotation) entity.setRotation(rotation);

        entity.setDoorBreakable(4, false); // hood
        entity.setDoorBreakable(5, false); // trunk
    }
});

let isBelt = false;
mp.players.local.setConfigFlag(32, true);
/*mp.keys.bind(0x42, true, () => {  //бинд
	if(checkConditions()) return;
    pointing.start();
});*/
mp.keys.bind(0x4A, true, () => {
    if (!isBelt) {
        if (!mp.players.local.vehicle) return;
        mp.players.local.setConfigFlag(32, false);
        global.soundCEF.execute(`playSound("buckle");`);
        mp.notify.success(`Вы пристегнули ремень безопасности`);
        isBelt = true;
    }
    else {
        if (!mp.players.local.vehicle) return;
        mp.players.local.setConfigFlag(32, true);
        global.soundCEF.execute(`playSound("unbuckle");`);
        mp.notify.warning(`Вы отстегнули ремень безопасности`);
        isBelt = false;
    }
});

mp.events.add('vehicles.lock', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    if (mp.moduleVehicles.nearBootVehicleId != null || mp.moduleVehicles.nearHoodVehicleId != null)
        return mp.notify.error(`Необходимо находиться у двери`, `Авто`);
    mp.events.callRemote('vehicles.lock', veh.remoteId);
});

const pointing =
{
    active: false,
    interval: null,
    lastSent: 0,

    start: function () {
        if (!this.active) {
            this.active = true;

            mp.game.streaming.requestAnimDict("anim@mp_point");
            while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                mp.game.wait(0);
            }

            mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1);
            mp.players.local.setConfigFlag(36, true)
            mp.players.local.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);  //анимка
            mp.game.streaming.removeAnimDict("anim@mp_point");

            this.interval = setInterval(this.process.bind(this), 0);
        }
    },

    stop: function () {
        if (this.active) {
            clearInterval(this.interval);
            this.interval = null
            this.active = false;

            mp.game.invoke("0xd01015c7316ae176", mp.players.local.handle, "Stop");
            if (!mp.players.local.isInjured()) {
                mp.players.local.clearTasks();
            }

            if (!mp.players.local.isInAnyVehicle(true)) {
                mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 1, 1, 1, 1);
            }

            mp.players.local.setConfigFlag(36, false);
            mp.players.local.clearTasks()
        }
    },

    gameplayCam: mp.cameras.new("gameplay"),
    lastSync: 0,

    getRelativePitch: function () {
        const camRot = this.gameplayCam.getRot(2);

        return camRot.x - mp.players.local.getPitch();
    },

    process: function () {
        if (this.active) {
            mp.game.invoke("0x921ce12c489c4c41", mp.players.local.handle);

            let camPitch = this.getRelativePitch();
            if (camPitch < -70.0) {
                camPitch = -70.0;
            } else if (camPitch > 42.0) {
                camPitch = 42.0;
            }

            camPitch = (camPitch + 70.0) / 112.0;

            let camHeading = mp.game.cam.getGameplayCamRelativeHeading();
            let cosCamHeading = mp.game.system.cos(camHeading);
            let sinCamHeading = mp.game.system.sin(camHeading);

            if (camHeading < -180.0) {
                camHeading = -180.0;
            } else if (camHeading > 180.0) {
                camHeading = 180.0;
            }

            camHeading = (camHeading + 180.0) / 360.0;

            let coords = mp.players.local.getOffsetFromGivenWorldCoords((cosCamHeading * -0.2) - (sinCamHeading * (0.4 * camHeading + 0.3)), (sinCamHeading * -0.2) + (cosCamHeading * (0.4 * camHeading + 0.3)), 0.6);
            let blocked = (typeof mp.raycasting.testPointToPoint(new mp.Vector3(coords.x, coords.y, coords.z - 0.2), new mp.Vector3(coords.x, coords.y, coords.z + 0.2), mp.players.local.handle, 7) !== 'undefined');

            mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Pitch", camPitch)
            mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Heading", camHeading * -1.0 + 1.0)
            mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isBlocked", blocked)
            mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isFirstPerson", mp.game.invoke('0xee778f8c7e1142e2', mp.game.invoke('0x19cafa3c87f7c2ff')) == 4)

            if ((Date.now() - this.lastSent) > 10) {
                this.lastSent = Date.now();
                mp.events.callRemote("fpsync.update", camPitch, camHeading);
            }
        }
    }
}

function CheckMyWaypoint() {
	try {
		if(mp.game.invoke('0x1DD1F58F493F1DA5')) {
			let foundblip = false;
			let blipIterator = mp.game.invoke('0x186E5D252FA50E7D');
			let totalBlipsFound = mp.game.invoke('0x9A3FF3DE163034E8');
			let FirstInfoId = mp.game.invoke('0x1BEDE233E6CD2A1F', blipIterator);
			let NextInfoId = mp.game.invoke('0x14F96AA50D6FBEA7', blipIterator);
			for (let i = FirstInfoId, blipCount = 0; blipCount != totalBlipsFound; blipCount++, i = NextInfoId) {
				if (mp.game.invoke('0x1FC877464A04FC4F', i) == 8) {
					var coord = mp.game.ui.getBlipInfoIdCoord(i);
					foundblip = true;
					break;
				}
			}
			if(foundblip) mp.events.call('syncWaypoint', coord.x, coord.y);
		}
	} catch (e) { }
}

mp.events.add('syncWaypoint', function (bX, bY, type) {
				  if (player.Vehicle == null) return;
                   var tempDriver = NAPI.Vehicle.GetVehicleDriver(player.Vehicle);
                   var driver = NAPI.Player.GetPlayerFromHandle(tempDriver);
                   if (driver == player || driver == null) return;
                  mp.events.call("syncWP", X, Y);
});

mp.events.add('syncWP', function (bX, bY, type) {
    if(!mp.game.invoke('0x1DD1F58F493F1DA5')) {
		mp.game.ui.setNewWaypoint(bX, bY);
		if(type == 0) mp.events.call('notify', 2, 9, "Пассажир передал Вам информацию о своём маршруте!", 3000);
		else if(type == 1) mp.events.call('notify', 2, 9, "Человек из списка контактов Вашего телефона передал Вам метку его местоположения!", 3000);
	} else {
		if(type == 0) mp.events.call('notify', 4, 9, "Пассажир попытался передать Вам информацию о маршруте, но у Вас уже установлен другой маршрут.", 5000);
		else if(type == 1) mp.events.call('notify', 4, 9, "Человек из списка контактов Вашего телефона попытался передать Вам метку его местоположения, но у Вас уже установлена другая метка.", 5000);
	}
});


const checkConditions = () => {
    const isLoggedIn = typeof loggedin !== 'undefined' ? loggedin : false;
    return (
        !isLoggedIn ||
        chatActive ||
        editing ||
        global.menuOpened ||
        cuffed ||
        global.phoneOpen ||
        localplayer.getVariable('AntiAnimDown') ||
        localplayer.getVariable('IS_DYING') ||
        localplayer.isSwimming() ||
        localplayer.isSwimmingUnderWater() ||
        localplayer.isInAir() ||
        localplayer.isRunningRagdollTask() ||
        localplayer.isRagdoll() ||
        localplayer.isJumping() ||
        localplayer.isShooting() ||
        localplayer.isReloading() ||
        localplayer.isFalling() ||
        localplayer.getIsTaskActive(4) ||               //TaskAimGunOnFoot
        localplayer.getIsTaskActive(160) ||
        localplayer.getIsTaskActive(2)
    );
}

mp.keys.bind(0x42, true, () => {  //бинд
	if(checkConditions()) return;
    pointing.start();
});

mp.keys.bind(0x42, false, () => { //бинд 
	if(checkConditions()) return;
    pointing.stop();
});

function getPlayerByHandle(handle) {
    let pla = mp.players.atHandle(handle);
    if (pla == undefined || pla == null) {
        return null;
    }
    return pla;
}

mp.keys.bind(0x4B, false, () => {
    var veh = mp.utils.getNearVehicle(mp.players.local.position, 3);
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicles.lock', veh.remoteId);
});

mp.events.add('vehicles.hood', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    if (mp.moduleVehicles.nearHoodVehicleId == null || mp.moduleVehicles.nearHoodVehicleId != veh.remoteId)
        return mp.notify.error(`Необходимо находиться у капота`, `Авто`);

    if (veh.getVariable("hood")) {
        mp.events.callRemote('vehicles.hood', veh.remoteId, false);
    } else {
        mp.events.callRemote('vehicles.hood', veh.remoteId, true);
    }
});

mp.events.add('vehicles.trunk', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    if (mp.moduleVehicles.nearBootVehicleId == null || mp.moduleVehicles.nearBootVehicleId != veh.remoteId)
        return mp.notify.error(`Необходимо находиться у багажника`, `Авто`);

    if (veh.getVariable("trunk")) {
        mp.events.callRemote('vehicles.trunk', veh.remoteId, false);
    } else {
        mp.events.callRemote('vehicles.trunk', veh.remoteId, true);
    }
});

mp.events.add('vehicles.explode', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicles.explode', veh.remoteId);
});

mp.events.add('vehicles.siren.sound', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicles.siren.sound', veh.remoteId);
});
/*mp.events.add('vehicle.megafon', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicle.megafon', veh.remoteId);
});*/

mp.events.add('vehicle.megafon.l', () => {
    let veh = mp.getCurrentInteractionEntity();
    if (!veh) return;
    if (veh.type != 'vehicle') return;
    mp.events.callRemote('vehicle.megafon.l', veh.remoteId);
    controlsDisabled = true;

});
mp.events.add('vehicle.megafon.tol', (frac) => {
    mp.callCEFV('interactionMenu.menu = cloneObj(interactionMenu.menus["vehicle_megafons"])');
    if (frac == 2) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSPD 1",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSPD 2",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSPD 3",
                    icon: "mega.png"
                });`);
    }
    if (frac == 3) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSSD 1",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSSD 2",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSSD 3",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "LSSD 4",
                    icon: "mega.png"
                });`);
    }
    if (frac == 1) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "GOV 1",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "GOV 2",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "GOV 3",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "GOV 4",
                    icon: "mega.png"
                });`);
    }
    if (frac == 4) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "FIB 1",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "FIB 2",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "FIB 3",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "FIB 4",
                    icon: "mega.png"
                });`);
    }
    if (frac == 5) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "EMS 1",
                    icon: "mega.png"
                });`);
    }
    if (frac == 6) {
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "ARMY" 1",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "ARMY 2",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "ARMY 3",
                    icon: "mega.png"
                });`);
        mp.callCEFV(`interactionMenu.menu.items.push({
                    text: "ARMY 4",
                    icon: "mega.png"
                });`);
    }
    mp.events.call('interaction.menu.show');
    controlsDisabled = false;
});
let sirenLightsUpdater = mp.timer.addInterval(() => {
    try {
        if (!mp.players.local.vehicle) return;
        if (currentSirenState == mp.players.local.vehicle.isSirenOn()) return;
        mp.events.callRemote('vehicles.siren.lights');
        currentSirenState = mp.players.local.vehicle.isSirenOn();
    } catch (err) {
        mp.chat.debug('sirenLightsUpdater error');
    }

}, 1000);


mp.vehicles.getVehiclePosition = (vehicle) => {
    let data = {
        x: vehicle.position.x,
        y: vehicle.position.y,
        z: vehicle.position.z,
        h: vehicle.getHeading()
    }
    return data;
}

mp.events.add('vehicles.heading.set', (heading) => {
    let veh = mp.players.local.vehicle;
    if (!veh) return;

    veh.setHeading(heading);
    veh.setOnGroundProperly();
});

mp.events.add('vehicles.onGroundProperly.set', () => {
    let veh = mp.players.local.vehicle;
    if (!veh) return;
    veh.setOnGroundProperly();
});


mp.events.add('vehicles.speedometer.enabled', (enabled) => {
    mp.speedometerEnabled = enabled;
});
mp.events.add("time.main.tick", () => {
    var vehicle = mp.utils.getNearVehicle(mp.players.local.position, 10);

    if (vehicle && vehicle.type == "vehicle") {
        // Проверка и взаимодействие с багажником
        if (mp.moduleVehicles.nearBootVehicleId == null) {
            mp.moduleVehicles.nearBootVehicleId = vehicle.remoteId;
            mp.events.call("playerEnterVehicleBoot", mp.players.local, vehicle);
        }

        // Проверка и взаимодействие с капотом
        if (mp.moduleVehicles.nearHoodVehicleId == null) {
            mp.moduleVehicles.nearHoodVehicleId = vehicle.remoteId;
            mp.events.call("playerEnterVehicleHood", mp.players.local, vehicle);
        }
    } else {
        // Если игрок не рядом с транспортным средством, сбрасываем состояния
        if (mp.moduleVehicles.nearBootVehicleId != null) {
            mp.events.call("playerExitVehicleBoot", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearBootVehicleId));
            mp.moduleVehicles.nearBootVehicleId = null;
        }
        if (mp.moduleVehicles.nearHoodVehicleId != null) {
            mp.events.call("playerExitVehicleHood", mp.players.local, mp.vehicles.atRemoteId(mp.moduleVehicles.nearHoodVehicleId));
            mp.moduleVehicles.nearHoodVehicleId = null;
        }
    }

    var player = mp.players.local;
    if (player.autopilot && player.vehicle) {
        var coord = mp.utils.getWaypointCoord();
        if (!coord) {
            delete player.autopilot;
            player.clearTasks();
            mp.notify.info("Автопилот деактивирован");
        } else {
            var dist = mp.vdist(player.position, coord);
            if (dist < 50 && coord.z - player.position.z > 2) {
                delete player.autopilot;
                player.clearTasks();
                mp.notify.info("Вы прибыли на место", "Автопилот");
            }
        }
    }

    mp.timeMainChecker.modules.vehicles = Date.now() - start;
});

mp.moduleVehicles = {
    nearBootVehicleId: null,
    nearHoodVehicleId: null,
    disabledControl: false,

    getSeat(player) {
        if (!player.vehicle) return null;

        var seats = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        for (var i = 0; i < seats.length; i++) {
            if (player.vehicle.getPedInSeat(seats[i]) == player.handle) return seats[i];
        }

        return null;
    },
    disableControl(enable) {
        this.disabledControl = enable;
    },
}

mp.events.add({
    "vehicles.disableControl": (enable) => {
        mp.moduleVehicles.disableControl(enable);
    },
    "playerEnterVehicleBoot": (player, vehicle) => {
        if (player.vehicle) return;
        if (vehicle.getVariable("static")) return;
        if (!vehicle.getVariable("trunk")) {
        }
    },
    "playerEnterVehicleHood": (player, vehicle) => {
        if (player.vehicle) return;
        if (vehicle.getVariable("static")) return;
    },
    "playerExitVehicleBoot": (player, vehicle) => {
        mp.prompt.hide();
    },
    "playerExitVehicleHood": (player, vehicle) => {
        mp.prompt.hide();
    },
});

mp.events.addDataHandler("hood", (vehicle, value) => {
    if (mp.moduleVehicles.nearHoodVehicleId == null) return;
    if (mp.moduleVehicles.nearHoodVehicleId != vehicle.remoteId) return;
    if (value) mp.prompt.showByName("vehicle_close_hood");
    else mp.prompt.showByName("vehicle_open_hood");
});

mp.events.add('render', () => {
    var start = Date.now();
    mp.vehicles.forEachInStreamRange((vehicle) => {
        if (mp.vdist(mp.players.local.position, vehicle.position) > 10) return;
        if (vehicle.getVariable('label')) {
            let label = vehicle.getVariable('label');
            mp.game.graphics.drawText(label, [vehicle.position.x, vehicle.position.y, vehicle.position.z + 2.7], {
                font: 0,
                color: [255, 255, 255, 255],
                scale: [0.35, 0.35],
                outline: true,
                centre: true
            });
        }
        if (controlsDisabled) {
            mp.game.controls.disableControlAction(1, 200, true);
        }
        if (vehicle.getVariable('unload')) {
            var bootPos = mp.utils.getBootPosition(vehicle);
            mp.game.graphics.drawText(`Разгрузка...`, [bootPos.x, bootPos.y, bootPos.z + 1], {
                font: 0,
                color: [187, 255, 0, 255],
                scale: [0.25, 0.25],
                outline: true,
                centre: true
            });
        }
    });
    if (mp.moduleVehicles.disabledControl) {
        mp.game.controls.disableControlAction(0, 59, true); /// INPUT_VEH_MOVE_LR
        mp.game.controls.disableControlAction(0, 60, true); /// INPUT_VEH_MOVE_UD
        mp.game.controls.disableControlAction(0, 71, true); /// INPUT_VEH_ACCELERATE
        mp.game.controls.disableControlAction(0, 72, true); /// INPUT_VEH_BRAKE
        // mp.game.controls.disableControlAction(0, 75, true); /// INPUT_VEH_EXIT
    }
    if (mp.renderChecker) mp.utils.drawText2d(`vehicles rend: ${Date.now() - start} ms`, [0.8, 0.67]);
});

mp.events.add('vehicles.add.menu.show', () => {
    mp.events.call('selectMenu.show', 'vehiclePropAdd');
});

let autopilotIsEnabled = false;
mp.events.add('vehicles.autopilot.enable', (enable) => {
    autopilotIsEnabled = enable;
});

mp.events.add('vehicles.autopilot', () => {
    var player = mp.players.local;
    var veh = player.vehicle;
    if (!autopilotIsEnabled) return mp.notify.warning("На этот транспорт не установлен автопилот");
    if (!veh) return mp.notify.error("Вы не в авто");
    var pos = mp.utils.getWaypointCoord();
    if (!pos) return mp.notify.warning("Укажите точку на карте");

    var speed = 25;
    var drivingStyle = 1074528293;
    var stopRange = 50;

    player.autopilot = true;
    player.taskVehicleDriveToCoordLongrange(veh.handle, pos.x, pos.y, pos.z + 2, speed, drivingStyle, stopRange);
    mp.notify.success("Автопилот активирован");
    mp.prompt.showByName("vehicle_autopilot");
});

// mp.events.add('characterInit.done', () => {
//     mp.timer.addInterval(async () => {
//         mp.vehicles.forEachInStreamRange((vehicle) => {
//             if (mp.vdist(mp.players.local.position, vehicle.position) > 30) return;
//             if (vehicle.remoteId == null) return;
//             if (!vehicle.getVariable('isValid')) {
//                 mp.events.callRemote('vehicles.invalid.found', vehicle.remoteId);
//             }
//         });
//     }, 1000);
// });
