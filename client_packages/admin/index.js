mp.adminLevel = 0;
let showInfoCars = false;

mp.events.add({
    'characterInit.done': () => {
        mp.keys.bind(0x79, true, function() { // F10
            if (!mp.adminLevel) return;
            mp.events.call("admin.tpmark");
        });
    },
    'admin.tpmark': () => {
        const oldpos = mp.players.local.position;
        const pos = mp.utils.getWaypointCoord();
        if (!pos) return;
        if (pos.z != 0) return mp.players.local.position = new mp.Vector3(pos.x, pos.y, pos.z + 1);
        findZAndTp(10, 150, pos, oldpos);
    },
    'admin.tpf': (entity, range, height) => {
        let pos = entity.getOffsetFromInWorldCoords(0, parseFloat(range), parseFloat(height));
        entity.position = pos;
    },
    'admin.set': (level) => {
        mp.adminLevel = level;
    },
    'slap': () => {
        var veh = mp.players.local.vehicle;
        (veh) ? veh.setVelocity(0, 0, 10) : mp.players.local.setVelocity(0, 0, 10);
    },
    'entityStreamIn': (entity) => {
        if (entity.type != 'player') return;
        if (entity == mp.players.local) return;
        let isVanished = entity.getVariable('isVanished') || false;
        entity.setAlpha(isVanished ? 0 : 255);
    },

    'switchmode_infocars': () => {
        showInfoCars = !showInfoCars;
    },

    'render': () => {
        if (showInfoCars) {
            mp.vehicles.forEachInStreamRange((veh) => {
                let playerPos = mp.players.local.position;
                let vehDist = mp.game.gameplay.getDistanceBetweenCoords(
                    playerPos.x, playerPos.y, playerPos.z,
                    veh.position.x, veh.position.y, veh.position.z, true
                );

                if (vehDist > 25) return;
                const speedKmh = Math.floor(veh.getSpeed() * 3.6);
                mp.game.graphics.drawText(
                    `ID: ${veh.id} - MODEL: ${mp.game.vehicle.getDisplayNameFromVehicleModel(veh.getModel())}\n` +
                    `Speed: ${speedKmh} km/h`,
                    [veh.position.x, veh.position.y, veh.position.z],
                    {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.5, 0.5]
                    }
                );
            });
        }
        let isVanished = mp.players.local.getVariable('isVanished') || false;
        if (!isVanished) return;
        mp.game.graphics.drawText("INVISIBILITY ON", [0.93, 0.12], {
            font: 0,
            color: [252, 223, 3, 200],
            scale: [0.37, 0.37],
            outline: true
        });
    },

    'admin.stats.show': (data) => {
        data = JSON.parse(data);
        mp.callCEFV(`modal.modals["admin_stats"].header = '${data.name}'`);
        let content = '';
        let stats = {
            'Основное': {
                'Пол': `${data.gender ? 'женский' : 'мужской'}`,
                'Наличные': `$${data.cash}`,
                'Банк. счет': `$${data.bank}`,
                'Отыграно минут': `${data.minutes}`,
                'Номер телефона': `${data.phone ? data.phone : 'нет'}`,
                'Сытость': `${data.satiety}`,
                'Жажда': `${data.thirst}`,
                'Законопослушность': `${data.law}`,
                'Преступлений': `${data.crimes}`,
                'Розыск': `${data.wanted}`,
                'Причина розыска': `${data.wantedCause ? data.wantedCause : 'нет'}`,
            },
            'Лицензии': {
                'Легковые т/с': `${data.carLicense ? 'есть' : 'нет'}`,
                'Пассажирские т/с': `${data.passengerLicense ? 'есть' : 'нет'}`,
                'Мотоциклы': `${data.bikeLicense ? 'есть' : 'нет'}`,
                'Грузовые т/с': `${data.truckLicense ? 'есть' : 'нет'}`,
                'Воздушные т/с': `${data.airLicense ? 'есть' : 'нет'}`,
                'Водные т/с': `${data.boatLicense ? 'есть' : 'нет'}`,
                'Оружие': `${data.gunLicenseDate ? `до ${data.gunLicenseDate}` : 'нет'}`,
            },
            'Наказания': {
                'Количество варнов': `${data.warnNumber}`,
                'Дата окончания варна': `${data.warnDate ? data.warnDate : 'нет'}`,
                'Время ареста': `${data.arrestTime}`,
                'Тип ареста': `${data.arrestType}`,
            },
        }

        for (let category in stats) {
            content += `<h3>${category}</h3>`;
            let section = stats[category];
            for (let key in section) {
                content += `${key}: <b>${section[key]}</b><br>`;
            }
        }

        mp.callCEFV(`modal.modals["admin_stats"].content = \`${content}\``);
        mp.callCEFV('modal.showByName("admin_stats")')
    }
});

mp.events.addDataHandler('isVanished', (entity) => {
    let isVanished = entity.getVariable('isVanished');
    if (entity != mp.players.local) entity.setAlpha(isVanished ? 0 : 255);
});

function findZAndTp(maxAttempts, delay, wpos, oldpos) {
    mp.players.local.position = new mp.Vector3(wpos.x, wpos.y, 0);
    mp.players.local.freezePosition(true);

    let attempts = 1;
    let timeout = mp.timer.add(function getZ() {
        wpos.z = mp.game.gameplay.getGroundZFor3dCoord(wpos.x, wpos.y, 1000, 0, false);
        if (!wpos.z && attempts < 10) {
            attempts++;
            mp.players.local.position = new mp.Vector3(wpos.x, wpos.y, attempts * 50);
            timeout = mp.timer.add(getZ, delay);
        } 
        else if (!wpos.z && attempts == maxAttempts) {
            mp.players.local.position = oldpos;
            mp.players.local.freezePosition(false);
            mp.timer.remove(timeout);
            mp.notify.warning("Координата Z не найдена, вы будете возвращены назад");
        } 
        else {
            mp.players.local.position = new mp.Vector3(wpos.x, wpos.y, wpos.z + 1);
            mp.players.local.freezePosition(false);
            mp.timer.remove(timeout);
        }
    }, delay);
}