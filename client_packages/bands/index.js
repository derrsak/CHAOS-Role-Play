"use strict";


/*
    Модуль банд (организации).

    created 15.09.19 by Carter Slade
*/

let bandZonesEdit = false;
let bandZonesEditId = -1;
let bandZonesEditStartCoords;
let bandZonesEditSpeed = 1;

mp.bands = {
    // Блипы зон гетто
    bandZones: [],
    // Показ блипов на карте
    zonesShow: false,
    // Цвета блипов (factionId: blipColor)
    colors: {
        8: 2,
        9: 27,
        10: 46,
        11: 3,
    },
    // Нативки
    natives: {
        _GET_BLIP_INFO_ID_ITERATOR: "0x186E5D252FA50E7D",
        GET_FIRST_BLIP_INFO_ID: "0x1BEDE233E6CD2A1F",
        GET_NEXT_BLIP_INFO_ID: "0x14F96AA50D6FBEA7",
        DOES_BLIP_EXIST: "0xA6DB27D19ECBB7DA",
        SET_BLIP_SPRITE: "0xDF735600A4696DAF",
        SET_BLIP_ALPHA: "0x45FF974EEE1C8734",
        SET_BLIP_ROTATION: "0xF87683CDF73C3F6E",
        SET_BLIP_COLOUR: "0x03D7FB09E75D6B7E",
        SET_BLIP_FLASHES: "0xB14552383D39CE3E",
        GET_BLIP_COLOUR: "0xDF729E8D20CF7327",
        _SET_BLIP_SHOW_HEADING_INDICATOR: "0x5FBCA48327B914DF",
        SET_BLIP_COORDS: "0xAE2AF67E9D9AF65D",
        GET_BLIP_COORDS: "0x586AFE3FF72D996E"
    },
    blipAlpha: 175,
    flashTimer: null,
    flashColor: 1,
    captureTimer: null,
    captureFactions: [],


    initBandZones(zones) {
        mp.bands.zonesShow = false;
        this.clearBandZones();
        zones.forEach(zone => {

            let blip = mp.blips.new(5, new mp.Vector3(zone.x, zone.y, 50), {
                color: this.colors[zone.factionId],
                alpha: this.blipAlpha,
                radius: zone.size,
            });

            this.bandZones.push(blip);
            //this.saveBlip(blip);
            if (zone.flash) this.flashBlip(zone.id, true);
        });
        mp.bands.zonesShow = true;
    },
    clearBandZones() {
        // var blips = mp.storage.data.bandZones;
        // if (!blips) return;
        // blips.forEach(blip => {
        //     if (blip) blip.destroy();
        // });
        // blips = [];
        if (!this.bandZones) return;
        this.bandZones.forEach(blip => {
            if (blip) blip.destroy();
        });
        this.bandZones = [];
    },
    saveBlip(blip) {
        if (!mp.storage.data.bandZones) mp.storage.data.bandZones = [];
        mp.storage.data.bandZones.push(blip);
    },
    flashBlip(id, toggle) {
        var blip = this.bandZones[id - 1];
        // mp.game.invoke(this.natives.SET_BLIP_FLASHES, blip, toggle);
        mp.timer.remove(this.flashTimer);
        if (!toggle) return;
        var oldColor = blip.getColour();
        this.flashTimer = mp.timer.addInterval(() => {
            var color = blip.getColour();
            if (color == oldColor) blip.setColour(this.flashColor);
            else blip.setColour(oldColor);
        }, 500);
    },
    setOwner(id, factionId) {
        var blip = this.bandZones[id - 1];
        this.flashBlip(id, false);
        blip.setColour(this.colors[factionId]);
    },
    startCapture(bandId, enemyBandId, time, bandScore = 0, enemyBandScore = 0) {
        time = parseInt(time);
        mp.callCEFV(`captureScore.start(${bandId}, ${enemyBandId}, ${time}, ${bandScore}, ${enemyBandScore})`);
        mp.timer.remove(this.captureTimer);
        //this.removePlayerBlips();
        this.captureFactions = [bandId, enemyBandId];

        //this.createPlayerBlips();
        this.captureTimer = mp.timer.add(() => {
            //this.removePlayerBlips();
            this.captureFactions = [];
        }, time * 1000);
    },
    stopCapture() {
        mp.callCEFV(`captureScore.show = false`);
    },
    setCaptureScore(bandId, score) {
        mp.callCEFV(`captureScore.setScore(${bandId}, ${score})`);
    },
    logKill(target, killer, reason) {
        reason = parseInt(reason);
        // if (killer)
        //     debug(`[KILL-LIST] ${killer.name} killed ${target.name} with reason ${reason}`)
        // else
        //     debug(`[KILL-LIST] ${target.name} сам себя with reason ${reason}`)


        if (typeof target == 'object') target = JSON.stringify(target);
        if (typeof killer == 'object') killer = JSON.stringify(killer);
        // самоубийство
        if (reason == 3452007600) return mp.callCEFV(`killList.add(\`${target}\`)`);
        // на авто
        if (reason == 2741846334) return mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, 'car')`);
        // рукопашка
        if (reason == 2725352035) return mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, 'hand')`);

        // огнестрел, либо что-то еще? :D
        var name = mp.weapons.getWeaponName(reason);
        mp.callCEFV(`killList.add(\`${target}\`, \`${killer}\`, \`${name}\`)`);
    },
    createPlayerBlip(player) {
        if (!this.captureFactions.length) return;
        if (player.remoteId == mp.players.local.remoteId) return;
        var factionId = player.getVariable("factionId");
        if (!this.captureFactions.includes(factionId)) return;
        player.createBlip(1);
        player.blip.setShowHeadingIndicator(true);
        player.blip.setColour(this.colors[factionId]);
    },
    createPlayerBlips() {
        // debug(`createPlayerBlips`)
        mp.players.forEach(rec => {
            this.createPlayerBlip(rec);
        });
    },
    removePlayerBlips() {
        // debug(`removePlayerBlips`)
        mp.players.forEach(rec => {
            var factionId = rec.getVariable("factionId");
            if (!mp.factions.isBandFaction(factionId)) return;
            rec.destroyBlip();
        });
    },
    setStorageInfo(data) {
        var items = [];
        for (var i = 0; i < data.names.length; i++) {
            var name = data.names[i];
            var count = data.counts[i];
            var per = parseInt(count / this.bandZones.length * 100);
            items.push({
                text: name,
                values: [`${count} зон ( ${per}% )`],
            });
        }
        items.push({
            text: "Вернуться"
        });

        mp.callCEFV(`selectMenu.setItems('bandPower', ${JSON.stringify(items)})`);

        var cash = JSON.stringify([`$${data.cash}`]);
        mp.callCEFV(`selectMenu.setItemValues('bandCash', 'Баланс', \`${cash}\`)`);
    },
    setRobbedVehicle(vehicle, enable) {
        if (enable) {
            vehicle.setTyreBurst(0, true, 1000);
            vehicle.setTyreBurst(1, true, 1000);
            vehicle.setTyreBurst(4, true, 1000);
            vehicle.setTyreBurst(5, true, 1000);

            vehicle.setDoorBroken(0, false);
            vehicle.setDoorBroken(1, false);
            vehicle.setDoorBroken(2, false);
            vehicle.setDoorBroken(3, false);
            vehicle.setDoorBroken(4, false);
            vehicle.setDoorBroken(5, false);

            vehicle.setEngineHealth(0);
            vehicle.setDamage(0, 1, 0, 200, 200, false);
            vehicle.setDamage(0, -1, 0, 200, 200, false);
            vehicle.setDamage(1, 0, 0, 200, 200, false);
            vehicle.setDamage(-1, 0, 0, 200, 200, false);

            vehicle.setDirtLevel(15);
        } else {
            vehicle.setFixed();
            vehicle.setDirtLevel(0);
        }
    },
    setPosition(id, pos) {
        let blip = this.bandZones[id - 1];
        blip.setCoords(pos);
    },
    getPosition(id) {
        let blip = this.bandZones[id - 1];
        return blip.getCoords();
    }
};

mp.events.add({
    "characterInit.done": () => {
        createPeds();
    },
    "bands.bandZones.init": (zones) => {
        mp.bands.initBandZones(zones);
    },
    "bands.bandZones.flash": (id, toggle) => {
        mp.bands.flashBlip(id, toggle);
    },
    "bands.bandZones.set": (id, factionId) => {
        mp.bands.setOwner(id, factionId);
    },
    "bands.bandZones.show": (enable) => {
        if (!mp.bands.bandZones) return;
        var alpha = (enable) ? mp.bands.blipAlpha : 0;
        mp.bands.bandZones.forEach(blip => {
            blip.setAlpha(alpha);
        });
        mp.bands.zonesShow = enable;
    },
    "bands.capture.start": (bandId, enemyBandId, time, bandScore = 0, enemyBandScore = 0) => {
        mp.bands.startCapture(bandId, enemyBandId, time, bandScore, enemyBandScore);
    },
    "bands.capture.stop": () => {
        mp.bands.stopCapture();
    },
    "bands.capture.score.set": (bandId, score) => {
        mp.bands.setCaptureScore(bandId, score);
    },
    "bands.capture.killList.log": (target, killer, reason) => {
        mp.bands.logKill(target, killer, reason);
    },
    "bands.storage.info.set": (data) => {
        mp.bands.setStorageInfo(data);
    },
    "render": () => {
        if (!mp.bands.zonesShow) return;
        mp.bands.bandZones.forEach(blip => {
            if (blip) blip.setRotation(0);
        });
    },
    "entityStreamIn": (entity) => {
        // if (entity.type == "player") mp.bands.createPlayerBlip(entity);
        if (entity.type == "vehicle" && entity.getVariable("robbed")) mp.bands.setRobbedVehicle(entity, true);
    },
    "bands.bandZones.edit": (id, statusEdit) => {
        bandZonesEdit = statusEdit;
        bandZonesEditId = id;
        bandZonesEditStartCoords = mp.bands.getPosition(id);
    },
    "bands.bandZones.edit.speed": (speed) => {
        bandZonesEditSpeed = speed;
    },
    "bands.bandZones.edit.resetPos": () => {
        if (!bandZonesEdit) return;
        mp.bands.setPosition(bandZonesEditId, bandZonesEditStartCoords);
    }
});

function editZoneSetPosition(coord, calc) {
    if (!bandZonesEdit) return;
    let pos = mp.bands.getPosition(bandZonesEditId);
    calc == '+' ? pos[coord] += bandZonesEditSpeed : pos[coord] -= bandZonesEditSpeed;
    mp.bands.setPosition(bandZonesEditId, pos);
}

mp.keys.bind(0x45, true, () => { // E (save)
    if (!bandZonesEdit) return;
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    
    let pos = mp.bands.getPosition(bandZonesEditId);
    mp.events.callRemote('bands.bandZones.edit.save', bandZonesEditId, pos);
});

mp.keys.bind(0x68, true, () => { // 8
    editZoneSetPosition('y', '+');
});

mp.keys.bind(0x62, true, () => { // 2
    editZoneSetPosition('y', '-');
});

mp.keys.bind(0x64, true, () => { // 4
    editZoneSetPosition('x', '-');
});

mp.keys.bind(0x66, true, () => { // 6
    editZoneSetPosition('x', '+');
});

mp.events.addDataHandler("factionId", (player, value) => {
    if (player.type == "player") player.destroyBlip();
});

mp.events.addDataHandler("robbed", (vehicle, value) => {
    if (vehicle.type == "vehicle") mp.bands.setRobbedVehicle(vehicle, value);
});

function createPeds() {
    mp.events.call('NPC.create', {
        model: "csb_chin_goon",
        position: {
            x: -167.32,
            y: 6174.69,
            z: 31.21
        },
        heading: 137.01
    });
}

// for tests
// mp.players.local.destroyBlip();
// mp.players.local.createBlip(1);
// mp.game.invoke(mp.bands.natives._SET_BLIP_SHOW_HEADING_INDICATOR, mp.players.local.blip, true);
