let isInAmmunationShape = false;
let menuIsOpen = false;

let pedModels = ['s_m_y_ammucity_01']
let npcScenario = 'WORLD_HUMAN_VALET';

mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInAmmunationShape) return;

    //let player = mp.players.local;
    //let vehicle = player.vehicle;
    //if (vehicle) return;

    mp.events.callRemote('ammunation.entering');
});

mp.events.add({
    "ammunation.npc.create": (peds) => {
        peds.forEach(element => {
            element.model = pedModels[0];
            element.defaultScenario = npcScenario;
            mp.events.call('NPC.create', element);
        });
    },
    "ammunation.shape.enter": () => {
        isInAmmunationShape = true;
        mp.prompt.show(`Используйте <span>E</span> для того, чтобы посмотреть ассортимент`);
    },
    "ammunation.shape.leave": () => {
        isInAmmunationShape = false;
        // TODO: сброс mp.prompt ?

        if (!menuIsOpen) return;
        mp.events.call(`selectMenu.hide`);
        menuIsOpen = false;
    },

    "ammunation.enter": (data, weaponsConfig, ammoProducts, armourProducts) => {
        if (mp.busy.includes() || menuIsOpen) return;
        let items = [];
        for (let key in weaponsConfig) {
            let current = weaponsConfig[key];
            items.push({
                text: current.name,
                values: [`$${parseInt(current.products * data.productPrice * data.priceMultiplier)}`],
                weaponId: key
            });
        }
        items.push({ text: 'Назад' });
        mp.callCEFV(`selectMenu.setItems('ammunationFirearms', ${JSON.stringify(items)});`)
        let price = parseInt(data.productPrice * data.priceMultiplier);
        items = [{
            text: "Патроны - 9mm",
            values: [`12 ед. - $${12 * ammoProducts * price}`, `24 ед. - $${24 * ammoProducts * price}`, `32 ед. - $${32 * ammoProducts * price}`],
        },
        {
            text: "Патроны - 12mm",
            values: [`8 ед. - $${8 * ammoProducts * price}`, `16 ед. - $${16 * ammoProducts * price}`, `24 ед. - $${24 * ammoProducts * price}`],
        },
        {
            text: "Патроны - 5.56mm",
            values: [`12 ед. - $${12 * ammoProducts * price}`, `24 ед. - $${24 * ammoProducts * price}`, `32 ед. - $${32 * ammoProducts * price}`],
        },
        {
            text: "Патроны - 7.62mm",
            values: [`10 ед. - $${10 * ammoProducts * price}`, `20 ед. - $${20 * ammoProducts * price}`, `30 ед. - $${30 * ammoProducts * price}`],
        },
        {
            text: "Назад"
        }];
        mp.callCEFV(`selectMenu.setItems('ammunationAmmo', ${JSON.stringify(items)});`)

        let armourPrice = parseInt(armourProducts * data.productPrice * data.priceMultiplier);
        items = [{
            text: "Серый бронежилет",
            values: [`$${armourPrice}`]
        },
        {
            text: "Черный бронежилет",
            values: [`$${armourPrice}`]
        },
        {
            text: "Зеленый бронежилет",
            values: [`$${armourPrice}`]
        },
        {
            text: "Камуфляжный бронежилет",
            values: [`$${armourPrice}`]
        },
        {
            text: "Камуфляжный бронежилет №2",
            values: [`$${armourPrice}`]
        },
        {
            text: "Назад"
        }];
        mp.callCEFV(`selectMenu.setItems('ammunationArmour', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'ammunationMain');
        menuIsOpen = true;
    },
    // "ammunation.exit": () => {
    //     mp.events.call(`selectMenu.hide`);
    // },
    "ammunation.weapon.buy.ans": (ans, data) => {
        switch (ans) {
            case 0:
                sendNotification(`Недостаточно денег`);
                break;
            case 1:
                sendNotification(`В магазине кончились ресурсы`);
                break;
            case 2:
                sendNotification(data);
                break;
            case 3:
                sendNotification(`Вы приобрели ${data}`);
                break;
            case 3:
                sendNotification(`Ошибка финансовой операции`);
                break;
            case 4:
                sendNotification(`У вас нет лицензии на оружие`);
                break;
        }
    },
    "ammunation.ammo.buy.ans": (ans, data) => {
        switch (ans) {
            case 0:
                sendNotification(`Недостаточно денег`);
                break;
            case 1:
                sendNotification(`В магазине кончились ресурсы`);
                break;
            case 2:
                sendNotification(data);
                break;
            case 3:
                sendNotification(`Вы приобрели боеприпасы`);
                break;
            case 3:
                sendNotification(`Ошибка финансовой операции`);
                break;
            case 4:
                sendNotification(`У вас нет лицензии на оружие`);
                break;
        }
    },
    "ammunation.armour.buy.ans": (ans, data) => {
        switch (ans) {
            case 0:
                sendNotification(`Недостаточно денег`);
                break;
            case 1:
                sendNotification(`В магазине кончились ресурсы`);
                break;
            case 2:
                sendNotification(data);
                break;
            case 3:
                sendNotification(`Вы купили бронежилет`);
                break;
            case 3:
                sendNotification(`Ошибка финансовой операции`);
                break;
        }
    }
});

function sendNotification(text) {
    mp.events.call('selectMenu.loader', `false`);
    mp.events.call('selectMenu.notification', text);
}