"use strict";

/*
    Модуль полиции.

    created 20.08.19 by Carter Slade
*/

mp.police = {
    arrestType: null,
    haveCuffs: false,
    followPlayer: null,
    wanted: 0,
    wantedTimer: null,
    clearWantedTime: 60 * 60 * 1000, // время очищения 1 ур. розыска (ms)
    searchRadius: 150,
    searchTime: 2 * 60 * 1000, // время жизни блипа поиска преступника
    searchTimer: null,
    natives: {
        SET_BLIP_SPRITE: "0xDF735600A4696DAF",
        SET_BLIP_ALPHA: "0x45FF974EEE1C8734",
        SET_BLIP_COLOUR: "0x03D7FB09E75D6B7E",
    },
    jailInfo: {
        // КПЗ ЛСПД
        0: {
            coords: new mp.Vector3(455.70, -986.90, 34.20),
            radius: 50,
        },
        // тюрьма за городом
        1: {
            coords: new mp.Vector3(1689.7947998046875, 2598.755859375, 45.56488800048828),
            radius: 300,
        },
        // КПЗ ЛССД
        2: {
            coords: new mp.Vector3(-439.4527282714844, 5989.65185546875, 31.716529846191406),
            radius: 25,
        },
    },

    setArrest(arrestType) {
        this.arrestType = arrestType;
    },
    setCuffs(enable) {
        this.haveCuffs = enable;
        mp.inventory.enable(!enable);
        mp.mapCase.enable(!enable);
        mp.callCEFR('phone.show', [false]);
        enable ? mp.busy.add("cuffs", false) : mp.busy.remove("cuffs");
    },
    setWanted(val) {
        this.wanted = val;
        mp.playerMenu.setWanted(val);
        mp.timer.remove(this.wantedTimer);
        mp.callCEFV(`hud.wanted = ${val}`);
        if (!val) return;
        this.wantedTimer = mp.timer.add(() => {
            mp.events.callRemote(`police.wanted.lower`);
        }, this.clearWantedTime);
    },
    startFollowToPlayer(playerId) {
        var player = mp.players.atRemoteId(playerId);
        if (!player) return;
        this.followPlayer = player;
    },
    stopFollowToPlayer() {
        this.followPlayer = null;
    },
    searchBlipCreate(name, pos) {
        this.removeSearchBlip();
        pos = mp.utils.randomSpherePoint(pos, this.searchRadius);
        var blip = mp.game.ui.addBlipForRadius(pos.x, pos.y, 50, this.searchRadius);
        mp.game.invoke(this.natives.SET_BLIP_ALPHA, blip, 175);
        mp.game.invoke(this.natives.SET_BLIP_COLOUR, blip, 1);

        this.saveSearchBlip(blip);

        mp.timer.remove(this.searchTimer);
        this.searchTimer = mp.timer.add(() => {
            this.removeSearchBlip();
        }, this.searchTime);
    },
    saveSearchBlip(blip) {
        mp.storage.data.searchBlip = blip;
    },
    removeSearchBlip() {
        if (!mp.storage.data.searchBlip) return;

        mp.game.ui.removeBlip(mp.storage.data.searchBlip);
        delete mp.storage.data.searchBlip;
    },
};

mp.events.add({
    "characterInit.done": () => {
        mp.police.removeSearchBlip();
    },
    "police.arrest.set": (arrestType) => {
        mp.police.setArrest(arrestType);
    },
    "police.cuffs.set": (enable) => {
        mp.police.setCuffs(enable);
    },
    "police.cuffs.callRemote": (data) => {
        if (typeof data == 'string') data = JSON.parse(data);

        var rec = mp.utils.getNearPlayer(mp.players.local.position);
        if (!rec) return mp.notify.error(`Рядом никого нет`);
        data.recId = rec.remoteId;
        mp.events.callRemote(`police.cuffs`, JSON.stringify(data));
    },
    "police.wanted.set": (val) => {
        mp.police.setWanted(val);
        // mp.game.gameplay.setFakeWantedLevel(val);
    },
    "render": () => {
        if (mp.police.followPlayer) {
            mp.game.controls.disableControlAction(0, 21, true); /// бег
            mp.game.controls.disableControlAction(0, 22, true); /// прыжок
            mp.game.controls.disableControlAction(0, 31, true); /// вперед назад
            mp.game.controls.disableControlAction(0, 30, true); /// влево вправо
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(1, 200, true); // esc
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(24, 37, true); /// Tab
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
        }
        if (mp.police.haveCuffs) {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
            mp.game.controls.disableControlAction(0, 257, true); // INPUT_ATTACK2
            mp.game.controls.disableControlAction(0, 75, true); /// // need input veh enter
            mp.game.controls.disableControlAction(0, 49, true); /// // need input veh enter
            mp.game.controls.disableControlAction(0, 23, true); /// // need input veh enter

            if (mp.players.local.vehicle) {
                mp.game.controls.disableControlAction(0, 59, true); /// INPUT_VEH_MOVE_LR
                mp.game.controls.disableControlAction(0, 60, true); /// INPUT_VEH_MOVE_UD
                mp.game.controls.disableControlAction(0, 71, true); /// INPUT_VEH_ACCELERATE
                mp.game.controls.disableControlAction(0, 72, true); /// INPUT_VEH_BRAKE
                mp.game.controls.disableControlAction(0, 75, true); /// INPUT_VEH_EXIT
            }
        }
        if (mp.police.arrestType != null) {
            mp.game.controls.disableControlAction(0, 24, true); /// удары
            mp.game.controls.disableControlAction(0, 25, true); /// INPUT_AIM
            mp.game.controls.disableControlAction(0, 257, true); /// стрельба
            mp.game.controls.disableControlAction(0, 140, true); /// удары R
        }
    },
    "police.follow.start": (playerId) => {
        mp.police.startFollowToPlayer(playerId);
    },
    "police.follow.stop": () => {
        mp.police.call('follow.suspec', -1);
        mp.mafia.call('im.followe', -1);
    },
    "police.search.blip.create": (name, pos) => {
        mp.police.searchBlipCreate(name, pos);
    },
    // "playerEnterVehicle": (vehicle, seat) => {
    //     if (mp.police.haveCuffs && seat == -1) {
    //         mp.players.local.taskLeaveVehicle(vehicle.handle, 16); // teleports outside, door kept closed
    //         mp.notify.error(`Вы не могли сесть в авто в наручниках`);
    //     }
    // },
    "playerEnterVehicle": (vehicle, seat) => {
        if (mp.police.haveCuffs && seat == -1) {
            mp.players.local.taskLeaveVehicle(vehicle.handle, 16); // teleports outside, door kept closed
            mp.notify.error(`Вы не могли сесть в авто в наручниках`);
        }
    },
    "police.following": (player, cop, speed) => {
        if (!player || !cop || player.isAttachedTo(cop.handle)) return;
        cop.taskPlayAnim(dragAnimDict, "static", 8.0, 1.0, -1, 49, 1.0, false, false, false);
        cop.isDragging = true;
    
        let copBone = cop.getBoneIndexByName("SKEL_R_Hand");
        
        target.attachTo(cop.handle, copBone, 0.5125, 0.425, 0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
        target.isSuspected = true;
    
        cop.suspect = target;
        cop.intervalChecker = setInterval(() => {
            if (cop && cop.suspect) {
                if (cop.isWalking() || cop.isRunning() || cop.isSprinting()) {
                    const gotooPosition = cop.suspect.getOffsetFromInWorldCoords(0, 3, 1.32);
                    const speed = cop.isSprinting() || cop.isRunning() ? 5 : 1;
                    cop.suspect.taskGoStraightToCoord(gotooPosition.x, gotooPosition.y, gotooPosition.z, speed, 500, 130, 1.0);
                    cop.suspect._walking = true;
                }
                else if (cop.suspect._walking) {
                    var gotooPosition = cop.suspect.getOffsetFromInWorldCoords(0, 0, 1.32)
                    cop.suspect.taskGoStraightToCoord(gotooPosition.x, gotooPosition.y, gotooPosition.z, 1, 2000, cop.suspect.getHeading(), 3.0);
                    cop.suspect._walking = false;
                }
                mp.game.invoke("0x971D38760FBC02EF", cop.suspect.handle, true);
            }
            else {
                clearInterval(cop.intervalChecker);
                delete cop.intervalChecker;
                delete cop.suspect;
            }
            
            if (cop && cop.handle && cop.suspect && cop.suspect.handle)
                mp.game.invoke("0xC32779C16FCEECD9", cop.handle, 4, cop.suspect.handle, 45509, 0.18, 0.0, 0.1, 0, -1, -1);
        }, 100);
    },
    "time.main.tick": () => {
        var start = Date.now();
        if (mp.police.followPlayer) {
            var pos = mp.police.followPlayer.position;
            var localPos = mp.players.local.position;
            var dist = mp.game.system.vdist(pos.x, pos.y, pos.z, localPos.x, localPos.y, localPos.z);
            if (dist > 30) {
                mp.police.followPlayer = null;
                return;
            }
            var speed = 3;
            if (dist < 10) speed = 2;
            if (dist < 5) speed = 1;
            mp.players.local.taskFollowNavMeshToCoord(pos.x, pos.y, pos.z, speed, -1, 1, true, 0);
        }
        mp.players.forEachInStreamRange(rec => {
            if (mp.police.followPlayer) rec.call('police.following', [mp.players.local, mp.police.followPlayer, speed]);

            if (rec.vehicle) return;
            if (!rec.getVariable("cuffs")) return;
            if (rec.isPlayingAnim('mp_arresting', 'idle', 3)) return;
            mp.utils.requestAnimDict('mp_arresting', () => {
                rec.taskPlayAnim('mp_arresting', 'idle', 1, 0, -1, 49, 0, false, false, false);
            });
        });
        mp.timeMainChecker.modules.police = Date.now() - start;
    },
    "entityStreamOut": (entity) => {
        if (entity.type != "player") return;
        if (!mp.police.followPlayer) return;
        if (entity.remoteId != mp.police.followPlayer.remoteId) return;
        mp.police.followPlayer = null;
    },
    "playerQuit": (player) => {
        if (!mp.police.followPlayer) return;
        if (player.remoteId != mp.police.followPlayer.remoteId) return;
        mp.police.followPlayer = null;
    },
});

// По поводу заказа
// Discord / Telegramm - @quaraw

// Created by quaraw

const localPlayer = mp.players.local;

const requestAnimDict = animDict => new Promise(async (resolve, reject) => {
    if (mp.game.streaming.hasAnimDictLoaded(animDict))
        return resolve(true);

    mp.game.streaming.requestAnimDict(animDict);
    while(!mp.game.streaming.hasAnimDictLoaded(animDict)) {
        await mp.game.waitAsync(1);
    }

    return resolve(true);
});

mp.events.add("im.followe", (entity, value, oldValue) => {
    if (value != -1 && mp.players.atRemoteId(value) != null) {
        let cop = mp.players.atRemoteId(value);
        dragTarget(cop, entity);
    }
    else if (entity.isSuspected) {
        if (entity.isAttached())
            entity.detach(true, true);

        entity.isSuspected = false;
        entity.clearTasks();
    }
});

mp.events.add("follow.suspec", (entity, value, oldValue) => {
    if (value != -1 && mp.players.atRemoteId(value) != null) {
        let suspect = mp.players.atRemoteId(value);
        dragTarget(entity, suspect);
    }
    else if (entity.isDragging) {
        entity.isDragging = false;
        entity.clearTasks();

        if (entity.intervalChecker) 
            clearInterval(entity.intervalChecker);

        delete entity.intervalChecker;
        delete entity.suspect;
    }
});

mp.events.addDataHandler("im.followed", (entity, value, oldValue) => {
    if (value != -1 && mp.players.atRemoteId(value) != null) {
        let cop = mp.players.atRemoteId(value);
        dragTarget(cop, entity);
    }
    else if (entity.isSuspected) {
        if (entity.isAttached())
            entity.detach(true, true);

        entity.isSuspected = false;
        entity.clearTasks();
    }
});

mp.events.addDataHandler("follow.suspect", (entity, value, oldValue) => {
    if (value != -1 && mp.players.atRemoteId(value) != null) {
        let suspect = mp.players.atRemoteId(value);
        dragTarget(entity, suspect);
    }
    else if (entity.isDragging) {
        entity.isDragging = false;
        entity.clearTasks();

        if (entity.intervalChecker) 
            clearInterval(entity.intervalChecker);

        delete entity.intervalChecker;
        delete entity.suspect;
    }
});

mp.events.add("render", () => {
    if (localPlayer.getVariable("im.followed") != null && localPlayer.getVariable("im.followed") != -1) {
        mp.game.controls.disableAllControlActions(2);
        mp.game.controls.enableControlAction(2, 30, true);
        mp.game.controls.enableControlAction(2, 31, true);
        mp.game.controls.enableControlAction(2, 32, true);
        mp.game.controls.enableControlAction(2, 1, true);
        mp.game.controls.enableControlAction(2, 2, true);
    }
    
    if (localPlayer.getVariable("follow.suspect") != null && localPlayer.getVariable("follow.suspect") != -1) {
        if (!localPlayer.isPlayingAnim(dragAnimDict, "static", 3)) {
            localPlayer.taskPlayAnim(dragAnimDict, "static", 8.0, 1.0, -1, 49, 1.0, false, false, false);
        }
    }
});

mp.events.add("entityStreamIn", (entity) => {
    if (!entity || entity.type != 'player' || entity.handle == 0 || !mp.players.exists(entity)) return;

    let imFollowed = entity.getVariable("im.followed");
    if (imFollowed != null && imFollowed != -1) {
		let cop = mp.players.atRemoteId(imFollowed);
		if (!cop) return;
		
        dragTarget(cop, entity);
        return;
    }
    
    let followSuspect = entity.getVariable("follow.suspect");
    if (followSuspect != null && followSuspect != -1) {
		let suspect = mp.players.atRemoteId(followSuspect);
		if (!suspect) return;
		
        dragTarget(entity, suspect);
        return;
    }
});

const cuffAnimDict = "mp_arresting";
async function cuffTarget(cop, target) {
	if (!target || !cop || !target.handle || !cop.handle || !mp.players.exists(cop) || !mp.players.exists(target)) return;
    await requestAnimDict(cuffAnimDict);

    target.clearTasks();
    target.taskPlayAnim(cuffAnimDict, "idle", 8.0, 1.0, -1, 49, 1.0, false, false, false);
}

const dragAnimDict = "amb@code_human_wander_drinking_fat@female@base";
async function dragTarget(cop, target) {
    if (!target || !cop || !target.handle || !cop.handle || !mp.players.exists(cop) || !mp.players.exists(target) || target.isAttachedTo(cop.handle)) return;

    await cuffTarget(cop, target);
    await requestAnimDict(dragAnimDict);

    cop.taskPlayAnim(dragAnimDict, "static", 8.0, 1.0, -1, 49, 1.0, false, false, false);
    cop.isDragging = true;

    let copBone = cop.getBoneIndexByName("SKEL_R_Hand");
    
    target.attachTo(cop.handle, copBone, 0.5125, 0.425, 0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
    target.isSuspected = true;

    cop.suspect = target;
    cop.intervalChecker = setInterval(() => {
        if (cop && cop.suspect) {
            if (cop.isWalking() || cop.isRunning() || cop.isSprinting()) {
                const gotooPosition = cop.suspect.getOffsetFromInWorldCoords(0, 3, 1.32);
                const speed = cop.isSprinting() || cop.isRunning() ? 5 : 1;
                cop.suspect.taskGoStraightToCoord(gotooPosition.x, gotooPosition.y, gotooPosition.z, speed, 500, 130, 1.0);
                cop.suspect._walking = true;
            }
            else if (cop.suspect._walking) {
                var gotooPosition = cop.suspect.getOffsetFromInWorldCoords(0, 0, 1.32)
                cop.suspect.taskGoStraightToCoord(gotooPosition.x, gotooPosition.y, gotooPosition.z, 1, 2000, cop.suspect.getHeading(), 3.0);
                cop.suspect._walking = false;
            }
            mp.game.invoke("0x971D38760FBC02EF", cop.suspect.handle, true);
        }
        else {
            clearInterval(cop.intervalChecker);
            delete cop.intervalChecker;
            delete cop.suspect;
        }
		
		if (cop && cop.handle && cop.suspect && cop.suspect.handle)
			mp.game.invoke("0xC32779C16FCEECD9", cop.handle, 4, cop.suspect.handle, 45509, 0.18, 0.0, 0.1, 0, -1, -1);
    }, 100);
}