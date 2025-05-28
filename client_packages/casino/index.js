require('casino/luckywheel');
require('casino/slotmachines');
require('casino/roulette');

let isInCasinoArea = false;
removeUnnecessaryObjects();

const casinoDimension = 0;

const peds = [{
        model: "S_F_Y_Casino_01",
        position: {
            x: 1117.34,
            y: 220.00,
            z: -49.43,
            d: casinoDimension
        },
        heading: 83.14,
    },
    {
        model: "U_F_M_CasinoShop_01",
        position: {
            x: 1117.55,
            y: 221.25,
            z: -49.43,
            d: casinoDimension
        },
        heading: 65.33,
    },
    {
        model: "U_F_M_CasinoCash_01",
        position: {
            x: 1117.60,
            y: 218.67,
            z: -49.43,
            d: casinoDimension
        },
        heading: 108.19,
    },
];

const cashierMarkers = [
    [1116.36, 221.75, -49.43],
    [1115.99, 220.13, -49.43],
    [1116.42, 218.15, -49.43]
];

mp.events.add({
    "casino.area.enter": (enter) => {
        isInCasinoArea = enter;

        if (!enter) return mp.callCEFV(`interactionMenu.deleteItem('player_interaction', 'Бросить кости'`);
        const items = [{
            text: `Бросить кости`,
            icon: `dice.svg`
        }];
        mp.callCEFV(`interactionMenu.addItems('player_interaction', ${JSON.stringify(items)})`);
    },
    "casino.dice.offer.create": () => {
        const entity = mp.getCurrentInteractionEntity();
        if (!entity || entity.type != 'player') return;

        mp.callCEFV(`inputWindow.name = 'dice';
            inputWindow.header = "Игра в кости (ID: ${entity.remoteId})";
            inputWindow.description = "";
            inputWindow.hint = "Введите кол-во фишек";
            inputWindow.inputHint = "Сумма игры...";
            inputWindow.value = "";
            inputWindow.show = true;
            inputWindow.playerId = ${entity.remoteId}`
        );
    },
    "casino.dice.text.show": (data) => {
        data = JSON.parse(data);
        data.senderName = mp.chat.correctName(data.senderName);
        data.targetName = mp.chat.correctName(data.targetName);
        mp.events.call('chat.message.push',
            `!{#dd90ff}${data.senderName}[${data.senderId}] и ${data.targetName}[${data.targetId}] бросили кости. Результат: !{#fff5a6}${data.senderCount}:${data.targetCount}`);
    },
    "characterInit.done": () => {
        peds.forEach(current => mp.events.call('NPC.create', current));

        cashierMarkers.forEach(x => {
            mp.markers.new(1, new mp.Vector3(x[0], x[1], x[2] - 1.15), 0.4, {
                color: [71, 145, 255, 140],
                visible: true,
                dimension: casinoDimension
            });
        });
    },
    "casino.cashier.show": (show) => {
        if (show) mp.events.call('selectMenu.show', 'casinoCashier');
        else mp.callCEFV(`selectMenu.show = false`);
    },
    'casino.prizes.show': (prizes) => {
        const items = [];
        prizes.forEach(prize => items.push({ text: prize }));
        items.push({ text: 'Закрыть' });

        mp.callCEFV(`selectMenu.setItems('casinoPrizes', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'casinoPrizes');
    },
    'casino.prizes.use': (index) => mp.events.callRemote('casino.prizes.use', index),
    'casino.chips.menu.show': (type, price) => {
        const items = [];
        items.push({ text: `Цена ${type === 'buy' ? 'покупки' : 'продажи'}`, values: [`$${price} за 1 шт.`] });
        items.push({ text: 'Введите количество', values: [''], type: 'editable' });
        items.push({ text: type === 'buy' ? 'Купить' : 'Продать' });
        items.push({ text: 'Закрыть' });

        mp.callCEFV(`selectMenu.setItems('casinoChips', ${JSON.stringify(items)});`)
        mp.events.call('selectMenu.show', 'casinoChips');
    }
});

function removeUnnecessaryObjects() {
    ['vw_prop_casino_stool_02a', 'vw_prop_casino_3cardpoker_01',
        'vw_prop_casino_3cardpoker_01b', 'vw_prop_casino_blckjack_01',
        'vw_prop_casino_blckjack_01b'
    ].forEach(name => {
        mp.game.entity.createModelHide(1100.51, 230.36, -50.84, 100, mp.game.joaat(name), true);
    });
}