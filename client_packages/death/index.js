"use strict";

/*
    Модуль смерти игрока. Состояние присмерти.

    created 12.09.19 by Carter Slade
*/

mp.death = {
    // Время ожидания предложения (ms)
    waitHurtTime: 1 * 1000,
    // Время ожидания медиков (ms)
    medKnockTime: 90 * 1000,
    // Время ожидания без медиков (ms)
    knockTime: 60 * 1000,
    // Таймер ожидания медиков
    knockTimer: null,

    knock(player, enable) {
        if (!enable) return;

        player.taskBleedingDeath();

        setTimeout(() => {
            let vehicle = player.vehicle;
            if (vehicle) {
                player.taskLeaveVehicle(Vehicle, 4160);
            }

            player.setToRagdoll(-1, -1, 1, true, true, true);
        }, 500);
    },
    disableControls(enable) {
        mp.events.call(`mapCase.enable`, !enable);
        mp.events.call(`inventory.enable`, !enable);
        mp.callCEFV(`interactionMenu.enable = ${!enable}`);
    },
    startKnockTimer(time) {
        this.stopKnockTimer();
        this.knockTimer = mp.timer.add(() => {
            mp.events.call(`death.callRemote.spawn`);
        }, time);
        mp.gui.cursor.show(true, true);
        mp.callCEFV(`timer.start('death', ${time})`);
    },
    stopKnockTimer() {
        mp.gui.cursor.show(false, false);
        mp.timer.remove(this.knockTimer);
        mp.callCEFV(`timer.stop()`);
    }
};

mp.events.add({
    "death.callRemote.spawn": () => {
        var pos = mp.players.local.position;
        var groundZ = mp.game.gameplay.getGroundZFor3dCoord(pos.x, pos.y, pos.z + 2, false, false);
        var dimension = mp.players.local.dimension;
        pos.z = groundZ;
        // mp.events.call(`weapons.ammo.sync`, true);
        mp.events.callRemote(`inv.death.spawn`, pos, dimension);
        mp.events.callRemote(`death.spawn`);
        mp.players.local.taskRevive();
    },
    "playerDeath": (player, reason, killer) => {
        if (player.getVariable("knocked"))
        return mp.events.call('death.callRemote.spawn');
        mp.callCEFV("timer.buttonClicked = false");
        mp.death.disableControls(true);
        var arrest = false;
        var killerName = "Неизвестно";
        if (killer && killer.remoteId != mp.players.local.remoteId) {
            killerName = killer.name || "Неизвестно";
            var factionId = killer.getVariable("factionId");
            var haveCuffs = mp.busy.includes("cuffs");
            arrest = (mp.factions.isPoliceFaction(factionId) || mp.factions.isFibFaction(factionId)) && mp.police.wanted && haveCuffs;
        }

        mp.callCEFV(`timer.killerName = '${killerName}'`);

        mp.timer.add(() => {
            if (arrest) {
                return mp.events.callRemote(`police.cells.forceArrest`);
            }
            var knocked = mp.players.local.getVariable("knocked");
            if (!knocked) {
                mp.events.callRemote('death.wait', mp.death.knockTime);
                mp.death.startKnockTimer(time);
            } else {
                mp.events.callRemote('death.wait', mp.death.medKnockTime);
            }
        }, mp.death.waitHurtTime);

    },
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        var knocked = player.getVariable("knocked") || false;
        mp.death.knock(player, knocked);
    },
    "render": () => {
        var knocked = mp.players.local.getVariable("knocked");
        if (knocked) mp.game.controls.disableAllControlActions(0);
    },
    "time.main.tick": () => {
        var player = mp.players.local;
        if (!player.getVariable("knocked")) return;
        mp.death.knock(player, true);
    },

});

mp.events.addDataHandler("knocked", (player, knocked) => {
    mp.death.knock(player, knocked);
    if (player.remoteId == mp.players.local.remoteId) {
        mp.death.disableControls(knocked);
        if (knocked) {
            // mp.notify.info(`Ожидайте медиков в течение ${mp.death.knockTime / 1000} сек.`, `Здоровье`);
            mp.death.startKnockTimer(knocked);
        } else mp.death.stopKnockTimer();
    }
});
