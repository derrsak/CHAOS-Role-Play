let isInSupermarketShape = false;
let menuIsOpen = false;

let data; // данные магазина
let priceConfig; // данные цен магазина

let pedModels = ['s_f_m_sweatshop_01', 's_f_y_sweatshop_01', 's_m_m_strvend_01', 'csb_undercover', 'mp_m_shopkeep_01'];
let npcScenario = 'WORLD_HUMAN_VALET';

mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInSupermarketShape) return;

    //let player = mp.players.local;
    //let vehicle = player.vehicle;
    //if (vehicle) return;

    mp.events.call('supermarket.menu.show');
});

mp.events.add({
    "supermarket.npc.create": (peds) => {
        peds.forEach(element => {
            element.model = pedModels[mp.utils.randomInteger(0, pedModels.length - 1)];
            element.defaultScenario = npcScenario;
            mp.events.call('NPC.create', element);
        });
    },
    "supermarket.shape.enter": (tData, tPriceConfig) => {
        isInSupermarketShape = true;
        data = tData;
        priceConfig = tPriceConfig;

        mp.prompt.show(`Используйте <span>E</span> для того, чтобы посмотреть товары в магазине`);
    },
    "supermarket.shape.leave": () => {
        isInSupermarketShape = false;
        mp.events.call('supermarket.menu.close');
    },
    "supermarket.menu.show": () => {
        if (mp.busy.includes() || menuIsOpen) return;
        setSupermarketHeaders(data.bType);
        setPrices(priceConfig, data.priceMultiplier);
        mp.events.call('selectMenu.show', 'supermarketMain');
        menuIsOpen = true;
    },
    "supermarket.menu.close": () => {
        if (!menuIsOpen) return;
        mp.events.call(`selectMenu.hide`);
        menuIsOpen = false;
    },
    "supermarket.phone.buy": () => {
        mp.events.callRemote('supermarket.phone.buy');
    },
    "supermarket.phone.buy.ans": (ans) => {
        switch (ans) {
            case 0:
                sendNotification(`У вас уже есть телефон`);
                break;
            case 1:
                mp.prompt.show(`Чтобы достать свой телефон, нажмите <span>↑</span>`);
                sendNotification(`Вы купили телефон`);
                break;
            case 2:
                sendNotification(`Недостаточно денег`);
                break;
            case 3:
                sendNotification(`В магазине кончились продукты`);
                break;
            case 4:
                sendNotification(`Ошибка покупки`);
                break;
        }
    },
    "supermarket.number.change": (number) => {
        if (number.length != 6) return sendNotification(`Номер должен содержать 6 символов`);
        if (/\D/g.test(number)) return sendNotification(`Номер содержит недопустимые символы`);
        if (number.charAt(0) == '0') return sendNotification(`Номер не может начинаться с 0`);

        mp.events.callRemote('supermarket.number.change', number);
    },
    "supermarket.number.change.ans": (ans, number) => {
        switch (ans) {
            case 0:
                sendNotification(`Некорректный номер`);
                break;
            case 1:
                sendNotification(`Ваш новый номер — ${number}`);
                break;
            case 2:
                sendNotification(`Недостаточно денег`);
                break;
            case 3:
                sendNotification(`В магазине кончились продукты`);
                break;
            case 4:
                sendNotification(`Ошибка покупки`);
                break;
            case 5:
                sendNotification(`Номер занят`);
                break;
        }
    },
    "supermarket.products.buy.ans": (ans, data) => {
        switch (ans) {
            case 0:
                sendNotification(`Ошибка покупки`);
                break;
            case 1:
                sendNotification(`Вы приобрели товар`);
                break;
            case 2:
                sendNotification(`Недостаточно денег`);
                break;
            case 3:
                sendNotification(`В магазине кончились продукты'`)
                break;
            case 4:
                sendNotification(data);
                break;
        }
    }
});

function sendNotification(text) {
    mp.events.call('selectMenu.loader', `false`);
    mp.events.call('selectMenu.notification', text);
}

function setSupermarketHeaders(type) {
    let img;
    switch (type) {
        case 0:
            img = 'supermarket.png';
            break;
        case 1:
            img = 'ltd.png';
            break;
        case 2:
            img = 'robsliquor.png';
            break;
    }
    mp.callCEFV(`selectMenu.menus["supermarketMain"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketMobile"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketNumberChange"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketFood"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketTobacco"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].headerImg = \`${img}\``);
    mp.callCEFV(`selectMenu.menus["supermarketBags"].headerImg = \`${img}\``);
}

function setPrices(config, multiplier) {
    for (let key in config) {
        config[key] *= multiplier;
    }
    mp.callCEFV(`selectMenu.menus["supermarketMobile"].items[0].values[0] = '$${config.phone}'`);
    mp.callCEFV(`selectMenu.menus["supermarketMobile"].items[1].values[0] = '$${config.numberChange}'`);
    mp.callCEFV(`selectMenu.menus["supermarketNumberChange"].items[1].values[0] = '$${config.numberChange}'`);
    mp.callCEFV(`selectMenu.menus["supermarketFood"].items[0].values[0] = '$${config.water}'`);
    mp.callCEFV(`selectMenu.menus["supermarketFood"].items[1].values[0] = '$${config.chocolate}'`);
    mp.callCEFV(`selectMenu.menus["supermarketTobacco"].items[0].values[0] = '$${config.cigarettes}'`);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].items[0].values[0] = '$${config.rope}'`);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].items[1].values[0] = '$${config.bag}'`);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].items[2].values[0] = '$${config.canister}'`);
    mp.callCEFV(`selectMenu.menus["supermarketBags"].items[0].values[0] = '$${config.duffleBag}'`);
    mp.callCEFV(`selectMenu.menus["supermarketBags"].items[1].values[0] = '$${config.duffleBag}'`);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].items[3].values[0] = '$${config.healthPack}'`);
    mp.callCEFV(`selectMenu.menus["supermarketStuff"].items[4].values[0] = '$${config.matches}'`);
}
