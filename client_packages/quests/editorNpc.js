let tempNpc = {};           // создаваемый/редактируемый npc
let npcId = null;           // id редактируемого npc

const npcAnimations = [     // доступные анимации квестовых нпц
    {
        name: 'Зависнуть на улице',
        scenario: 'WORLD_HUMAN_HANG_OUT_STREET'
    },
    {
        name: 'Курить',
        scenario: 'WORLD_HUMAN_AA_SMOKE'
    },
    {
        name: 'Пить кофе',
        scenario: 'WORLD_HUMAN_AA_COFFEE'
    }
];

// -- editor main

mp.events.add('quest.init', (list) => {
    mp.callCEFV(`selectMenu.menus["npcEditorOtherSettings"].items[1].values = ${JSON.stringify(getInfoAnimForEditor())};`);
});

mp.events.add('quest.editor.npc.addNpc', () => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add('quest.editor.npc', false)) return;
    
    clearInfoTempNpc();
    showEditor();
});

mp.events.add('quest.editor.npc.editNpc', (npc) => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add('quest.editor.npc', false)) return;

    tempNpc = {
        name: npc.name,
        greeting: npc.greeting,
        pos: new mp.Vector3(npc.x, npc.y, npc.z),
        h: npc.h,
        d: npc.d,
        quests: npc.quests,
        model: npc.model,
        scenario: npc.scenario
    };
    npcId = npc.id;

    showEditor();
});

mp.events.add('quest.editor.npc.close', () => {
    closeEditor();
});

// -- quest editor handler events --

mp.events.add('quest.editor.npc.createNpc', (name, greeting, blipCreated) => {
    if (!name || !greeting) return notif('Введите название и приветствие NPC!');
    if (!tempNpc.pos) return notif('Укажите позицию NPC!');
    if (!tempNpc.model) return notif('Укажите модель NPC!');

    tempNpc.name = name;
    tempNpc.greeting = greeting;
    tempNpc.blipCreated = blipCreated;

    if (npcId) mp.events.callRemote('quest.editor.npc.editNpc', npcId, JSON.stringify(tempNpc));
    else mp.events.callRemote('quest.editor.npc.createNpc', JSON.stringify(tempNpc));

    closeEditor();
});

mp.events.add('quest.editor.npc.deleteNpc', () => {
    if (npcId) mp.events.callRemote('quest.editor.npc.deleteNpc', npcId);
    closeEditor();
});

mp.events.add('quest.editor.npc.setPos', () => {
    if (!tempNpc.pos) notif('Позиция NPC создана');
    else notif('Позиция NPC изменена');

    tempNpc.pos = mp.players.local.position;
    tempNpc.h = mp.players.local.getHeading();
    tempNpc.d = mp.players.local.dimension;
});

mp.events.add('quest.editor.npc.tpToPos', () => {
    if (!tempNpc.pos) return notif('Позиция NPC еще не задана!');

    mp.players.local.position = tempNpc.pos;
    mp.players.local.setHeading(tempNpc.h);
    mp.players.local.dimension = tempNpc.d;
});

mp.events.add('quest.editor.npc.setOtherSettings', (model, anim) => {
    if (!model) return notif('Установите модель!');

    tempNpc.model = model;
    tempNpc.scenario = getScenarioByName(anim);

    notif('Настройки установлены');
});

mp.events.add('quest.editor.npc.addQuest', (questName) => {
    if (!questName) return notif('Выберите квест!');

    tempNpc.quests.push(
        mp.quests.getQuestIdByName(questName)
    );
    updateQuestsMenu();

    notif('Квест добавлен');
});

mp.events.add('quest.editor.npc.removeQuest', (index) => {
    tempNpc.quests.splice(index, 1);
    updateQuestsMenu();
    notif('Квест удален');
});

// -- functions npc editor

function showEditor() {
    updateQuestsMenu();

    mp.callCEFV(`selectMenu.menus["npcEditorAddQuest"].items[0].values = ${JSON.stringify(mp.quests.getAllQuestsName())};`);
    mp.callCEFV(`selectMenu.menus["npcEditorMenu"].items[0].values[0] = '${tempNpc.name}';`);
    mp.callCEFV(`selectMenu.menus["npcEditorMenu"].items[1].values[0] = '${tempNpc.greeting}';`);
    mp.callCEFV(`selectMenu.menus["npcEditorOtherSettings"].items[0].values[0] = '${tempNpc.model}';`);

    mp.callCEFV(`selectMenu.menu = selectMenu.menus["npcEditorMenu"];`);
    mp.callCEFV(`selectMenu.show = true;`);
}

function closeEditor() {
    mp.busy.remove('quest.editor.npc');
    mp.callCEFV(`selectMenu.show = false;`);
}

function updateQuestsMenu() {
    let nameList = [];

    tempNpc.quests.forEach(x => {
        nameList.push({
            text: mp.quests.getQuestNameById(x)
        });
    });
    nameList.push({ text: 'Назад'});

    mp.callCEFV(`selectMenu.menus["npcEditorRemoveQuest"].items = ${JSON.stringify(nameList)};`);
}

function notif(text) {
    return mp.callCEFV(`selectMenu.notification = '${text}';`);
}

function getScenarioByName(name) {
    const anim = npcAnimations.find(x => x.name == name);
    if (anim) return anim.scenario;
}

function getInfoAnimForEditor() {
    let animNames = [];
    npcAnimations.forEach(x => animNames.push(x.name));
    return animNames;
}

function clearInfoTempNpc() {
    tempNpc = {
        name: '',
        greeting: '',
        pos: null,
        h: 0,
        d: 0,
        quests: [],
        model: '',
        scenario: ''
    };
    npcId = null;
}