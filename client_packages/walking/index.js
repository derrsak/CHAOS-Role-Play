"use strict";


/*
    Модуль походок.

    created 03.10.19 by Carter Slade
*/

mp.walking = {
    async setWalkingStyle(player, style) {
        if (!style) {
            player.resetMovementClipset(0.0);
        } else {
            if (!mp.game.streaming.hasClipSetLoaded(style)) {
                mp.game.streaming.requestClipSet(style);
                while (!mp.game.streaming.hasClipSetLoaded(style)) await mp.game.waitAsync(0); // mp.game.wait(0);
            }

            player.setMovementClipset(style, 0.0);
        }
    }
};

mp.events.add({
    "entityStreamIn": (player) => {
        if (player.type != "player") return;
        mp.walking.setWalkingStyle(player, player.getVariable("walking"));
    },
});

mp.events.addDataHandler("walking", (player, value) => {
    if (player.type != "player") return;
    mp.walking.setWalkingStyle(player, player.getVariable("walking"));
});

//let isCrawling = false; // ползти

//mp.keys.bind(90, true, function () {
//    if (!isCrawling) {
//        isCrawling = true;
//        player.taskCrawl(true);
//    }
//});

//mp.keys.bind(90, false, function () {
//    if (isCrawling) {
//        isCrawling = false;
//        player.taskCrawl(false);
//    }
//});
