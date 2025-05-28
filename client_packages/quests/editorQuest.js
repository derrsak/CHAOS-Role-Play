let tempQuest = {};         // создаваемый/редактируемый квест
let questId = null;         // id редактируемого квеста
let tempEnterPos = {};      // временные координаты для логики 'enter_area_pos' (редактор квестов) + маркер на координатах

let areaList;               // список названий мест
let logicList;              // список названий логик

// -- quest editor main

mp.events.add('quest.init', (list) => {
    areaList = list.enterAreaList;
    logicList = list.logicList;

    mp.callCEFV(`selectMenu.menus["questAddLogicEnterArea"].items[0].values = ${JSON.stringify(areaList)};`);
    mp.callCEFV(`selectMenu.menus["questEditMenu"].items[2].values = ${JSON.stringify(mp.quests.typeQuests)};`);
});

mp.events.add('quest.editor.addQuest', () => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add('quest.editor', false)) return;
    
    clearInfoTempQuest();
    showEditor();
});

mp.events.add('quest.editor.editQuest', (quest) => {
    if (mp.busy.includes()) return;
    if (!mp.busy.add('quest.editor', false)) return;

    tempQuest = {
        name: quest.name,
        description: quest.description,
        type: quest.type,
        prize: quest.prize,
        questLogic: quest.questLogic
    };
    questId = quest.id;

    const enterPosLogic = tempQuest.questLogic.find(x => x.pos);
    if (enterPosLogic) {
        tempEnterPos.pos = enterPosLogic.pos;
        tempEnterPos.marker = mp.markers.new(1, tempEnterPos.pos, 10);
    }

    showEditor();
});

mp.events.add('quest.editor.close', () => {
    closeEditor();
});

// -- quest editor handler events --

mp.events.add('quest.editor.createQuest', (name, description, type) => {
    if (!name || !description) return notif('Введите название и описание квеста!');
    if (tempQuest.prize.length == 0 || tempQuest.questLogic.length == 0) return notif('Добавьте хотя бы один приз и одну логику!');
    if (tempQuest.prize.length > 8) return notif('Нельзя добавить больше 8 призов за квест!');

    tempQuest.name = name;
    tempQuest.description = description;
    tempQuest.type = getTypeIdByName(type);

    if (questId) mp.events.callRemote('quest.editor.editQuest', questId, JSON.stringify(tempQuest));
    else mp.events.callRemote('quest.editor.createQuest', JSON.stringify(tempQuest));

    closeEditor();
});

mp.events.add('quest.editor.deleteQuest', () => {
    if (questId) mp.events.callRemote('quest.editor.deleteQuest', questId);
    closeEditor();
});

mp.events.add('quest.editor.addPrizeItem', (itemId, count) => {
    if (!itemId || !count) return notif('Введите предмет и кол-во!');
    if (tempQuest.prize.length >= 8) return notif('Максимум 8 наград за квест!');
    
    tempQuest.prize.push({
        itemId: parseInt(itemId),
        itemParams: {
            count: parseInt(count)
        }
    });
    updatePrizeMenu();
    notif('Добавлен предмет в награду');
});

mp.events.add('quest.editor.addPrizeMoney', (count) => {
    if (!count) return notif('Введите сумму!');
    if (tempQuest.prize.length >= 8) return notif('Максимум 8 наград за квест!');

    tempQuest.prize.push({
        money: parseInt(count)
    });
    updatePrizeMenu();
    notif('Добавлены деньги в награду');
});

mp.events.add('quest.editor.addLogicEnterPos', () => {
    if (!tempEnterPos.pos) notif('Точка координат создана');
    else notif('Точка координат изменена');

    tempEnterPos.pos = mp.players.local.position;
    tempEnterPos.pos.z -= 1;
    
    if (!tempEnterPos.marker) tempEnterPos.marker = mp.markers.new(1, tempEnterPos.pos, 10);
    else tempEnterPos.marker.position = tempEnterPos.pos;
});

mp.events.add('quest.editor.tpToLogicEnterPos', () => {
    if (!tempEnterPos.pos) return notif('Точка координат еще не создана');

    mp.players.local.position = tempEnterPos.pos;
});

mp.events.add('quest.editor.saveLogicEnterPos', (logicId) => {
    if (!tempEnterPos.pos) return notif('Вы не создали точку координат!');

    tempQuest.questLogic.push({
        logicId: logicId,
        count: 1,
        pos: tempEnterPos.pos
    });
    updateLogicMenu();
    notif('Логика добавлена');
});

mp.events.add('quest.editor.addLogicEnterArea', (logicId, area) => {
    if (!area) return notif('Выберите место!');
    tempQuest.questLogic.push({
        logicId: logicId,
        count: 1,
        areaId: getAreaIdByRuname(area)
    });
    updateLogicMenu();
    notif('Логика добавлена');
});

mp.events.add('quest.editor.addLogicTalkNPC', (logicId, npcId) => {
    if (!npcId) return notif('Введите ID NPC!');
    tempQuest.questLogic.push({
        logicId: logicId,
        count: 1,
        npcId: parseInt(npcId)
    });
    updateLogicMenu();
    notif('Логика добавлена');
});

mp.events.add('quest.editor.addLogicBuyItem', (logicId, itemId, count) => {
    if (!itemId || !count) return notif('Введите предмет и кол-во!');
    tempQuest.questLogic.push({
        logicId: logicId,
        itemId: parseInt(itemId),
        count: parseInt(count)
    });
    updateLogicMenu();
    notif('Логика добавлена');
});

mp.events.add('quest.editor.addLogicGiveItem', (logicId, itemId, count) => {
    if (!itemId || !count) return notif('Введите предмет и кол-во!');
    tempQuest.questLogic.push({
        logicId: logicId,
        itemId: parseInt(itemId),
        count: parseInt(count)
    });
    updateLogicMenu();
    notif('Логика добавлена');
});

mp.events.add('quest.editor.deletePrize', (index) => {
    tempQuest.prize.splice(index, 1);
    updatePrizeMenu();
    notif('Награда удалена');
});

mp.events.add('quest.editor.deleteLogic', (index) => {
    if (tempQuest.questLogic[index].pos) {
        if (tempEnterPos.marker) tempEnterPos.marker.destroy();
        tempEnterPos = {};
    }
    tempQuest.questLogic.splice(index, 1);
    updateLogicMenu();
    notif('Логика удалена');
});

// -- functions quest editor

function showEditor() {
    updatePrizeMenu();
    updateLogicMenu();
    
    mp.callCEFV(`selectMenu.menus["questEditMenu"].items[0].values[0] = '${tempQuest.name}';`);
    mp.callCEFV(`selectMenu.menus["questEditMenu"].items[1].values[0] = '${tempQuest.description}';`);
    
    mp.callCEFV(`selectMenu.menu = selectMenu.menus["questEditMenu"];`);
    mp.callCEFV(`selectMenu.show = true;`);
}

function closeEditor() {
    mp.busy.remove('quest.editor');
    mp.callCEFV(`selectMenu.show = false;`);

    if (tempEnterPos.marker) tempEnterPos.marker.destroy();
    tempEnterPos = {};
}

function updatePrizeMenu() {
    let prize = [];
    let text;
    tempQuest.prize.forEach(value => {
        if (value.itemId) text = `Item: ${value.itemId} | Count: ${value.itemParams.count}`;
        else if (value.money) text = `Money: ${value.money}`;
        else text = 'No prize';

        prize.push({
            text: text
        });
    });
    prize.push({ text: 'Назад'});
    mp.callCEFV(`selectMenu.menus["questDeletePrize"].items = ${JSON.stringify(prize)};`);
}

function updateLogicMenu() {
    let logic = [];
    let text;
    tempQuest.questLogic.forEach(value => {
        const nameLogic = getLogicNameById(value.logicId);
        
        if (value.areaId) text = `${nameLogic} (${getAreaNameById(value.areaId)})`;
        else if (value.npcId) text = `${nameLogic} (#${value.npcId})`;
        else if (value.itemId) text = `${nameLogic} (#${value.itemId}) | Count: ${value.count}`;
        else text = nameLogic;

        logic.push({
            text: text
        });
    });
    logic.push({ text: 'Назад'});
    mp.callCEFV(`selectMenu.menus["questDeleteLogic"].items = ${JSON.stringify(logic)};`);
}

function getLogicNameById(logicId) {
    return logicList.find(x => x.id == logicId).desc || undefined;
}

function getAreaNameById(areaId) {
    return areaList[areaId - 1];
}

function getAreaIdByRuname(name) {
    return areaList.findIndex(x => x == name) + 1;
}

function notif(text) {
    return mp.callCEFV(`selectMenu.notification = '${text}';`);
}

function getTypeIdByName(name) {
    return mp.quests.typeQuests.findIndex(x => x == name) + 1;
}

function clearInfoTempQuest() {
    tempQuest = {           
        name: '',
        description: '',
        type: 0,
        prize: [],
        questLogic: []
    };
    questId = null;
    tempEnterPos = {};
}