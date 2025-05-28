let isInEateryShape = false;
let menuIsOpen = false;

let data; // данные закусочной
let priceConfig; // данные цен закусочной

mp.keys.bind(0x45, true, () => { /// E
    if (mp.game.ui.isPauseMenuActive()) return;
    if (mp.busy.includes()) return;
    if (!isInEateryShape) return;

    //let player = mp.players.local;
    //let vehicle = player.vehicle;
    //if (vehicle) return;

    mp.events.call('eatery.menu.show');
});

mp.events.add({
    "eatery.shape.enter": (tData, tPriceConfig) => {
        isInEateryShape = true;
        data = tData;
        priceConfig = tPriceConfig;

        mp.prompt.show(`Используйте <span>E</span> для того, чтобы посмотреть товары в закусочной`);
    },
    "eatery.shape.leave": () => {
        isInEateryShape = false;
        mp.events.call('eatery.menu.close');
    },
    "eatery.menu.show": () => {
        if (mp.busy.includes() || menuIsOpen) return;
        setHeaders(data.bType);
        setPrices(priceConfig, data.priceMultiplier);
        mp.events.call('selectMenu.show', 'eateryMain');
        menuIsOpen = true;
    },
    "eatery.menu.close": () => {
        if (!menuIsOpen) return;
        mp.events.call(`selectMenu.hide`);
        menuIsOpen = false;
    },
    "eatery.products.buy.ans": (ans, data) => {
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
                sendNotification(`В закусочной кончились продукты`);
                break;
            case 4:
                sendNotification(data);
                break;
        }
    }
});

function setPrices(config, multiplier) {
    for (let key in config) {
        config[key] = parseInt(config[key] * multiplier);
    }
    mp.callCEFV(`selectMenu.menus["eateryMain"].items[0].values[0] = '$${config.hamburger}'`);
    mp.callCEFV(`selectMenu.menus["eateryMain"].items[1].values[0] = '$${config.hotdog}'`);
    mp.callCEFV(`selectMenu.menus["eateryMain"].items[2].values[0] = '$${config.pizza}'`);
    mp.callCEFV(`selectMenu.menus["eateryMain"].items[3].values[0] = '$${config.chips}'`);
    mp.callCEFV(`selectMenu.menus["eateryMain"].items[4].values[0] = '$${config.cola}'`);
}

function setHeaders(type) {
    let img;
    switch (type) {
        case 0:
            img = 'bishop';
            break;
        case 1:
            img = 'burger';
            break;
        case 2:
            img = 'chihua';
            break;
        case 3:
            img = 'cluckin';
            break;
        case 4:
            img = 'hornys';
            break;
        case 5:
            img = 'taco';
            break;
        case 6:
            img = 'upnatom';
            break;
    }
    mp.callCEFV(`selectMenu.menus["eateryMain"].headerImg = '${img}.png'`);
}

function sendNotification(text) {
    mp.events.call('selectMenu.loader', `false`);
    mp.events.call('selectMenu.notification', text);
}