const editorQuest = require('quests/editorQuest.js');
const editorNpc = require('quests/editorNpc.js');
const npc = require('quests/npc.js');

let questsList;             // основная информация о квестах
let questGroups;            // список активных квестов

mp.quests = {
    typeQuests: [           // типы квеста
        'Основная линия',
        'Второстепенное',
        'Ежедевное'
    ],

    getQuestNameById: (id) => {
        const quest = questsList.find(x => x.questId == id);
        if (quest) return quest.name;
    },

    getQuestIdByName: (name) => {
        const quest = questsList.find(x => x.name == name);
        if (quest) return quest.questId;
    },

    getAllQuestsName: () => {
        const names = [];
        questsList.forEach(x => names.push(x.name));
        return names.length ? names : [''];
    }
}

/*
questsList = [
    {
        questId         // id квеста
        name            // название квеста
        desc            // описание квеста
        playerProgress  // выполняет/выполнил или еще не найден квест у игрока
        status          // статус квеста (1 - завершенное, но награда не получена, 2 - выполняется, 3 - выполнен, награда получена)
        type            // тип квеста
        tasks: [{
            logicIndex  // индекс логики
            state       // выполнил или нет
            name        // название задачи для cef
        }]
        prizes: [
            count       // кол-во
            img         // картинка предмета
        ]
    }
]
TODO: Добавить npc в массив выше, имя нпц выдавшего квест



questGroups = [
    {
        id: 1,
        name: "Основная линия",
        quests: [] // список квестов, где type == id
    },
    {
        id: 2,
        name: "Второстепенные",
        quests: [] // список квестов, где type == id
    },
    {
        id: 3,
        name: "Ежедневные",
        quests: [] // список квестов, где type == id
    },
    {
        id: 4,
        name: "Завершенные",
        quests: [] // список квестов, где type == -1
    }
]


*/

// TODO: подгружать в редактор квестов имена нпц, гетнпцнеймбайид и гетнпцидбайнейм, грузить список нпц на клиентку

// TODO: подгружать в редактор названия предмета

// TODO: придумать кастомные параметры для предметов в призах и логиках


// -- main quest --

mp.keys.bind(0x75, true, function() { // F6
    if (mp.busy.includes()) {
        if (mp.busy.includes("questList")) return mp.callCEFV(`quests.setState(false);`);
    } else openQuestList();
});

mp.events.add('quest.init', (list) => {
    questsList = list.quests;
    updateQuestsList();
});

mp.events.add('quest.setStateTask', (questId, logicIndex, state) => {
    setStateInTaskQuest(questId, logicIndex, state);
    updateQuestsList();
});

mp.events.add('quest.setPlayerProgressQuest', (questId, state) => {
    setPlayerProgressQuest(questId, state);
    updateQuestsList();
});

mp.events.add('quest.setTypeQuest', (questId, type) => {
    setTypeQuest(questId, type);
    updateQuestsList();
});

mp.events.add('quest.setStatusQuest', (questId, status) => {
    setStatusQuest(questId, status);
    updateQuestsList();
});

mp.events.add('quest.updatePlayerTasks', (questId, tasks) => {
    updateTasksQuest(questId, tasks);
    updateQuestsList();
});

mp.events.add('quest.updatePrizes', (questId, prizes) => {
    updateRewardsQuest(questId, prizes);
    updateQuestsList();
});

mp.events.add('quest.updateQuest', (questId, info) => {
    updateQuest(questId, info);
    updateQuestsList();
});

mp.events.add('quest.show', (questId) => {
    openQuest(questId);
});

mp.events.add('quest.showList', () => {
    openQuestList();
});

mp.events.add('quest.cef.callbacks', (event) => {
    event = JSON.parse(event);

    if (event.name == 'accept') mp.events.callRemote('quest.startQuest', event.id);
    else if (event.name == 'takePrize') return mp.events.callRemote('quest.takePrize', event.id);
    mp.callCEFV(`quest.setState(false);`);
});

// -- main functions --

function updateQuestsList() {
    questGroups = [
        {
            id: 1,
            name: "Основная линия",
            quests: getQuestsListByType(1)
        },
        {
            id: 2,
            name: "Второстепенные",
            quests: getQuestsListByType(2)
        },
        {
            id: 3,
            name: "Ежедневные",
            quests: getQuestsListByType(3)
        },
        {
            id: 4,
            name: "Завершенные",
            quests: getQuestsListByType(-1)
        }
    ];
}

function openQuestList() {
    mp.callCEFV(`quests.setData(${JSON.stringify(questGroups)});`);
    mp.callCEFV(`quests.setState(true);`);
}

function openQuest(questId) {
    const questShow = getQuestInfo(questId);

    mp.callCEFV(`quest.setQuestData('${JSON.stringify(questShow)}');`);
    mp.callCEFV(`quest.setState(true);`);
}

// -- other functions --

function getQuestsListByType(type) {
    const quests = questsList.filter(x => x.playerProgress);
    const questsType = quests.filter(x => x.type == type);

    let result = [];
    questsType.forEach(quest => {
        result.push(
            getQuestInfo(quest.questId)
        );
    });

    return result;
}

function getQuestInfo(questId) {
    const quest = questsList.find(x => x.questId == questId);
    if (!quest) return;

    return {
        id: questId,
        active: false,
        type: getTypeNameById(quest.type),
        status: quest.status,
        name: quest.name,
        description: [quest.desc],
        tasks: getTasksByQuestId(questId),
        rewards: getRewardsByQuestId(questId)
    };
}

function setPlayerProgressQuest(questId, state) {
    const quest = questsList.find(x => x.questId == questId);
    if (quest) return quest.playerProgress = state;
}

function setTypeQuest(questId, type) {
    const quest = questsList.find(x => x.questId == questId);
    if (quest) return quest.type = type;
}

function setStatusQuest(questId, status) {
    const quest = questsList.find(x => x.questId == questId);
    if (quest) return quest.status = status;
}

function setStateInTaskQuest(questId, logicIndex, state) {
    const tasks = questsList.find(x => x.questId == questId).tasks;
    if (!tasks) return;

    const logicIdx = tasks.findIndex(x => x.logicIndex == logicIndex);
    if (logicIdx != -1) tasks[logicIdx].state = state;
}

function updateRewardsQuest(questId, prizes) {
    const quest = questsList.find(x => x.questId == questId);
    if (quest) return quest.prizes = prizes;
}

function updateTasksQuest(questId, tasks) {
    const quest = questsList.find(x => x.questId == questId);
    if (quest) return quest.tasks = tasks;
}

function updateQuest(questId, info) {
    const questIndex = questsList.findIndex(x => x.questId == questId);
    if (questIndex != -1) {
        if (info) return questsList[questIndex] = info;
        return questsList.splice(questIndex, 1);
    }

    if (info) questsList.push(info);
}

function getTypeNameById(id) {
    if (id == -1) return 'Завершенное';
    return mp.quests.typeQuests[id - 1];
}

function getTasksByQuestId(questId) {
    let tasks = [];

    const quest = questsList.find(x => x.questId == questId);
    if (!quest) return [];

    quest.tasks.forEach(task => {
        tasks.push({
            active: task.state,
            text: task.name
        });
    });
    
    return tasks;
}

function getRewardsByQuestId(questId) {
    let prizesArray = [];

    const rewards = questsList.find(x => x.questId == questId);
    if (!rewards) return [];

    rewards.prizes.forEach(prize => {
        prizesArray.push({
            img: prize.img,
            count: prize.count
        });
    });

    return prizesArray;
}