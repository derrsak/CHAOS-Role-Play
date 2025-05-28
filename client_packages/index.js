"use strict";
/// Подключение всех модулей на сервере

/*let api = {"chat:push": chatAPI.push, "chat:clear": chatAPI.clear, "chat:activate": chatAPI.activate, "chat:show": chatAPI.show};
for (let fn in api) {
    mp.events.add(fn, api[fn]);
}*/

// mp.events.callRemote('console', `Тест`); // вывод текста в консоль

mp.gui.cursor.show(true, false);



/// Служебные модули
require('base');
require('utils');
require('browser');

let browserLoaded = false;
let initDone = false;

mp.events.add('render', () => {
    if (!browserLoaded || !initDone) {
        mp.game.graphics.drawText("Идут тех. работы, подождите...", [0.5, 0.5], {
            font: 0,
            color: [252, 223, 3, 200],
            scale: [0.5, 0.5],
            outline: true
        });
    }
});

/// Автоподключение клиентских модулей
mp.events.add('init', (activeModules) => {
    activeModules.forEach(moduleName => {
        require(moduleName);
    });
    if (browserLoaded) {
        mp.events.callRemote('player.joined');
    }
    initDone = true;
});

mp.events.add('browserDomReady', (browser) => {
    if (initDone) {
        mp.events.callRemote('player.joined');
    }
    browserLoaded = true;
});
mp.events.callRemote('player.join');
//mp.game.invoke("0x6E9EF3A33C8899F8", true); //снег
//mp.game.invoke("0x4CC7F0FEA5283FE0", true); //снег
//mp.game.invoke("0xAEEDAD1420C65CC0", true); //снег
mp.game.gxt.set("PM_PAUSE_HDR", "CHAOS"); //название в пауз меню

