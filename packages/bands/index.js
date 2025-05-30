"use strict";

let factions;
let inventory;
let notifs;
let terminal;
let timer;

function sendPlayerChat(player, message) {
    player.call('chat.message.push', [`!{#e0b8ff} ${message}`]);
}

module.exports = {
    // Зоны гетто
    bandZones: [],
    // Мин. ранг, который может каптить
    captureRank: 8,
    // Мин. ранг, который может грабить
    robRank: 1,
    // Зоны, на которых происходит капт
    wars: {},
    // Время завершения последнего капта (ms)
    lastWarTime: 0,
    // Время отдыха между каптами (ms)
    waitWarTime: 20 * 60 * 1000,
    // Повторное участие в капте после убийства
    reveangeKill: false,
    // Время захвата территории (ms)
    warTime: 5 * 60 * 1000,
    // Промежуток часов, в который можно начать захват
    captureInterval: [11, 20],
    // ЗП за владение 100% гетто (PayDay)
    bandZonesPrice: 5000,
    // Кол-во боеприпасов, списываемое за выдачу оружия
    gunAmmo: 100,
    // Кол-во боеприпасов, списываемое за выдачу патронов
    ammoAmmo: 1,
    // Наркопритон
    drugsStashMarker: null,
    // Цена за 1 г. нарко в наркопритоне (0% влияния в гетто)
    drugsPrice: [100, 200, 300, 600],
    // Мин. цена 1 г. нарко в наркопритоне (100% влияния в гетто)
    drugsPriceMin: [10, 20, 30, 60],
    // Прибавляемое кол-во здоровья от употребления 1 г. нарко
    drugsHealth: [10, 30, 50, 80],
    // Прибавляемое кол-во наркозависимости от употребления 1 г. нарко
    drugsNarcotism: [1, 2, 3, 6],
    // Время эффекта наркотика (ms)
    drugsEffectTime: [10000, 20000, 30000, 60000],
    // Визуальный эффект
    drugsEffect: ['DrugsDrivingOut', 'RampageOut', 'DrugsMichaelAliensFightOut', 'DrugsTrevorClownsFightOut'],
    // Повторное использование наркотика
    drugsInterval: [10 * 6000, 20 * 6000, 30 * 6000, 60 * 6000],
    // Процент от грабежа (0.00-1.00)
    robK: 0.01,
    // Макс. сумма грабежа с одного игрока
    robMaxPrice: 5000,
    // Анти-флуд грабежа (вешается на грабителя)
    robBandWaitTime: 60 * 60 * 1000,
    // Анти-флуд грабежа (вешается на  жертву)
    robVictimWaitTime: 60 * 60 * 1000,
    // Сохраненные грабежи (characterId : time)
    robLogs: {},
    // Организации, авто которых можно грабить
    robVehFactionIds: [2, 3, 6, 4],

    // цена за сбыт наркотиков за 1 грамм
    priceNarcoBuyer: [200, 400, 600, 1200],
    // лист игроков сбывших наркотики
    narcoBuyerPlayersList: [],
    // время сброса сбыта в минутах
    timeResetNarcoBuyer: 30,
    // лимит на сбыт нарко, кол-во
    countNarcoBuyer: 5,

    async init() {
        factions = call('factions');
        inventory = call('inventory');
        notifs = call('notifications');
        terminal = call('terminal');
        timer = call('timer');

        this.createDrugsStashMarker();
        await this.loadBandZonesFromDB();
    },

    async loadBandZonesFromDB() {
        var dbZones = await db.Models.BandZone.findAll();
        this.bandZones = dbZones;
        console.log(`[BANDS] Зоны гетто загружены (${dbZones.length} шт.)`)
    },
    convertToClientBandZones() {
        var zones = this.bandZones.map(x => Object.assign({}, x.dataValues));
        var warZoneIds = Object.keys(this.wars);
        if (warZoneIds.length) zones[warZoneIds[0] - 1].flash = true;

        return zones;
    },
    getZone(id) {
        return this.bandZones[id - 1];
    },
    isInBandZones(pos) {
        return this.bandZones.find(zone => this.isInBandZone(pos, zone));
    },
    isInBandZone(pos, zone) {
        return pos.x > zone.x - 100 && pos.x < zone.x + 100 && pos.y < zone.y + 100 && pos.y > zone.y - 100;
    },
    isSpawnZone(zone) {
        var bands = factions.factions.filter(x => x.id >= 8 && x.id <= 11);
        for (var i = 0; i < bands.length; i++) {
            var marker = factions.getMarker(bands[i].id);
            var bandZone = this.getZoneByPos(marker.position);
            if (bandZone && zone.id == bandZone.id) return true;
        }
        return false;
    },
    getZoneByPos(pos) {
        return this.isInBandZones(pos);
    },
    // влияние банды от 0 до 1 (min: 0 - ниодной зоны не захвачено, max: 1 - всё гетто захвачено)
    getPowerBand(bandId) {
        var count = 0;
        for (var i = 0; i < this.bandZones.length; i++) {
            var zone = this.bandZones[i];
            if (zone.factionId == bandId) count++;
        }

        return count / this.bandZones.length;
    },
    setBandZoneOwner(zone, factionId) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        if (!factions.isBandFaction(factionId)) return;

        zone.factionId = factionId;
        zone.save();
        mp.players.forEach(rec => {
            if (!rec.character) return;
            rec.call(`bands.bandZones.set`, [zone.id, factionId]);
        });
    },
    startCapture(player) {
        var header = `Захват территории`;
        var out = (text) => {
            notifs.error(player, text, header)
        };
        var faction = factions.getFaction(player.character.factionId);
        if (!factions.isBandFaction(faction)) return out(`Вы не член группировки`);
        var rank = factions.getRank(faction, this.captureRank);
        if (player.character.factionRank < rank.id) return out(`Доступно с ранга ${rank.name}`);
        var zone = this.getZoneByPos(player.position);
        if (!zone) return out(`Вы не в гетто`);
        if (zone.factionId == faction.id) return out(`Территория уже под контролем ${faction.name}`);
        if (this.isSpawnZone(zone)) return out(`Нельзя захватить зону, в которой проживает банда`);
        if (Object.keys(this.wars).length) return out(`В гетто уже идет война`);
        var diff = Date.now() - this.lastWarTime;
        if (diff < this.waitWarTime) {
            var minutes = parseInt((this.waitWarTime - diff) / 1000 / 60);
            return out(`Повторный захват будет доступен через ${minutes} мин.`);
        }

        var hours = new Date().getHours();
        if (hours < this.captureInterval[0] || hours > this.captureInterval[1])
            return out(`Захват доступен с ${this.captureInterval[0]} до ${this.captureInterval[1]} ч.`);

        var enemyFaction = factions.getFaction(zone.factionId);
        this.wars[zone.id] = {
            band: {
                id: faction.id,
                score: 0,
            },
            enemyBand: {
                id: zone.factionId,
                score: 0,
            },
            startTime: Date.now()
        };
        timer.add(() => {
            try {
                this.stopCapture(zone);
            } catch (e) {
                console.log(e);
            }
        }, this.warTime);
        mp.players.forEach(rec => {
            if (!rec.character) return;
            var factionId = rec.character.factionId;
            rec.call(`bands.bandZones.flash`, [zone.id, true]);
            if (!factionId) return;
            if (!factions.isBandFaction(factionId)) return;
            if (factionId == faction.id) {
                rec.call(`bands.capture.start`, [factionId, zone.factionId, this.warTime / 1000]);
                notifs.success(rec, `Ваша банда напала на ${enemyFaction.name}`, header);
            } else if (factionId == zone.factionId) {
                rec.call(`bands.capture.start`, [zone.factionId, faction.id, this.warTime / 1000]);
                notifs.info(rec, `На вашу территорию напала банда ${faction.name}`, header);
            }
        });
    },
    stopCapture(zone) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        if (!this.wars[zone.id]) return;

        var war = this.wars[zone.id];
        var winBandId = war.band.id;
        var loseBandId = war.enemyBand.id;
        if (war.enemyBand.score >= war.band.score) {
            winBandId = war.enemyBand.id;
            loseBandId = war.band.id;
        }

        var header = `Захват территории`;
        mp.players.forEach(rec => {
            if (!rec.character) return;
            var factionId = rec.character.factionId;
            if (!factionId) return;
            if (!factions.isBandFaction(factionId)) return;
            if (factionId == winBandId) {
                var str = (war.band.id == winBandId) ? 'attack' : 'defender';
                rec.call(`prompt.showByName`, [`capture_${str}_win`]);
                notifs.success(rec, `Ваша банда победила`, header);
            } else if (factionId == loseBandId) {
                var str = (war.band.id == loseBandId) ? 'attack' : 'defender';
                rec.call(`prompt.showByName`, [`capture_${str}_lose`]);
                notifs.error(rec, `Ваша банда проиграла`, header);
            }
        });

        this.setBandZoneOwner(zone, winBandId);
        this.lastWarTime = Date.now();
        delete this.wars[zone.id];
    },
    inWar(factionId) {
        var i = Object.values(this.wars).findIndex(x => x.band.id == factionId || x.enemyBand.id == factionId);
        return i != -1;
    },
    checkReveangeKill(player) {
        if (this.reveangeKill) return;
        if (!player.lastWarDeathTime) return;
        var diff = Date.now() - player.lastWarDeathTime;
        if (diff > this.warTime) delete player.lastWarDeathTime;
        else {
            notifs.error(player, `Reveange Kill запрещен`, `Захват территории`);
            terminal.log(`[BANDS] ${player.name} сделал Reveange Kill на капте`);
        }
    },
    giveScore(player, enemy, reason, zone) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        var war = this.wars[zone.id];
        if (!war) return;

        var bandId, score;

        if (player.character.factionId == war.band.id) {
            war.band.score++;
            bandId = war.band.id;
            score = war.band.score;
        } else if (player.character.factionId == war.enemyBand.id) {
            war.enemyBand.score++;
            bandId = war.enemyBand.id;
            score = war.enemyBand.score;
        }

        mp.players.forEach(rec => {
            if (!rec.character) return;
            var factionId = rec.character.factionId;
            if (!factionId) return;
            if (!factions.isBandFaction(factionId)) return;
            if (factionId != war.band.id && factionId != war.enemyBand.id) return;

            rec.call(`bands.capture.killList.log`, [{
                name: enemy.name,
                factionId: enemy.character.factionId
            }, {
                name: player.name,
                factionId: player.character.factionId
            }, reason.toString()]);
            rec.call(`bands.capture.score.set`, [bandId, score]);
        });
    },
    createDrugsStashMarker() {
        var pos = new mp.Vector3(2435.65, 4965.74, 42.35 - 1);

        var marker = mp.markers.new(1, pos, 0.5, {
            color: [187, 255, 0, 70]
        });
        marker.blip = mp.blips.new(140, pos, {
            color: 25,
            name: `Наркопритон`,
            shortRange: 10,
            scale: 1
        });

        var colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 1.5);
        colshape.onEnter = (player) => {
            if (player.vehicle) return;
            if (!factions.isBandFaction(player.character.factionId)) return notifs.error(player, `Вы не член группировки`, `Наркопритон`);
            player.call("selectMenu.show", [`drugsStash`]);
            player.insideDrugsStash = true;
        };
        colshape.onExit = (player) => {
            player.call("selectMenu.hide");
            delete player.insideDrugsStash;
        };
        this.drugsStashMarker = marker;
    },
    // сколько осталось для окончания капта (ms)
    haveTime(war) {
        return this.warTime - (Date.now() - war.startTime);
    },
    sendStorageInfo(player) {
        var data = {
            names: factions.getBandFactions().map(x => x.name),
            counts: [0, 0, 0, 0],
            cash: factions.getFaction(player.character.factionId).cash,
        };

        this.bandZones.forEach(zone => {
            data.counts[zone.factionId - 8]++;
        });
        player.call(`bands.storage.info.set`, [data]);
    },
    canRobVehicle(veh) {
        if (!veh.db || veh.db.key != 'faction') return false;
        return this.robVehFactionIds.includes(veh.db.owner);
    },
    giveRobVehItem(player, veh, callback) {
        var params = {
            variation: 12,
            texture: 1
        };
        // params.faction = character.factionId;
        // params.owner = character.id;

        params.health = 100;
        //params.pockets = '[2,3,1,3,1,3,6,3,3,2,4,2,2,2,2,2,4,2,3,2]';
        params.pockets = '[3,3,3,3,3,3,3,3,10,5,3,5,10,3,3,3]';
        params.sex = player.character.gender ? 0 : 1;

        inventory.addItem(player, 3, params, callback);
    },
    editZoneStatus(player, idZone, statusEdit) {
        //if (!player.statusEditBandZone) return;

        player.statusEditBandZone = statusEdit;
        player.statusEditBandZoneId = idZone;
        player.call('bands.bandZones.edit', [idZone, statusEdit]);
        if (statusEdit) sendPlayerChat(player, `Редактор зон гетто включен, ID: ${idZone} | управление: numpad 8,2,4,6 E(сохранить)`);
    },
    editZoneSave(player, zone, pos) {
        this.editZoneStatus(player, zone, false);

        if (typeof zone == 'number') zone = this.getZone(zone);

        zone.x = pos.x;
        zone.y = pos.y;
        zone.save();
        sendPlayerChat(player, `Зона гетто сохранена, ID: ${zone.id}`);
    },
    editZoneSpeed(player, speed) {
        player.call('bands.bandZones.edit.speed', [speed]);
    },
    async createZone(player, factionId, sizeZone) {
        let zone = await db.Models.BandZone.create({
            x: player.position.x,
            y: player.position.y,
            factionId: factionId,
            size: sizeZone
        });
        this.bandZones.push(zone);
        player.call(`bands.bandZones.init`, [this.convertToClientBandZones()]);
        sendPlayerChat(player, `Зона гетто создана, ID: ${zone.id} | factionId: ${factionId} | size: ${sizeZone}`);
    },
    editZoneSize(player, zone, size) {
        if (typeof zone == 'number') zone = this.getZone(zone);
        zone.size = size;
        zone.save();
        player.call(`bands.bandZones.init`, [this.convertToClientBandZones()]);
        sendPlayerChat(player, `Размер зоны гетто изменен, ID: ${zone.id} | size: ${size}`);
    }
};
