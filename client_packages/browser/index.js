"use strict";
let browser = mp.browsers.new("package://browser/index.html");

/// Вызов событий в браузере на React
mp.callCEFR = function (eventName, args) { // showChat
    let argumentsString = '';
    let newArgs;

    args.forEach(arg => {
        switch(typeof arg) {
            case 'string': {
                argumentsString += `, \`${arg}\``;
                newArgs = arg;
                break;
            }
            case 'number': {
                argumentsString += `, ${arg}`;
                newArgs = arg;
                break;
            }
            case 'boolean': {
                argumentsString += `, ${arg}`;
                newArgs = arg;
                break;
            }
            case 'object': {
                argumentsString += `, ${JSON.stringify(arg)}`;
                newArgs = arg;
                break;
            }
        }
    });
    browser.execute(`mp.event.call(\`${eventName}\` ${argumentsString});`); //test12


    //browser.call(eventName, newArgs);
    
    //let text = `mp.trigger('${eventName}' ${argumentsString});`;

    //mp.events.callRemote('console', `REG callCEFR | ${text}`);
    //browser.execute(text);
}

/// Передача значений в браузер на VUE
mp.callCEFV = function (text) {
    browser.execute(text);
}

/// Передача значений в VUE в виде объекта
/// Example: object = {"hud.show" : true, "hud.players": 100}
mp.callCEFVN = function (object) {
    for (let objectKey in object) {
        browser.execute(`${objectKey} = ${JSON.stringify(object[objectKey])}`);
    }
}

mp.events.add({
    "callCEFR": mp.callCEFR
});
