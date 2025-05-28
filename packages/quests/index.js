// -- Столбец questLogic / возможные параметры / любая логика обязательно должна содержать параметры id (id логики) и параметр count (кол-во выполнений для логики) --
// 1) посещение определенного места (по координатам). Должен содержать параметр pos (vector3)
// 2) Посещение определенного места (по определенным местам, например, супермаркет). Должен содержать параметр areaName (number)
// 3) Разговор с педом. Должен содержать параметр pedId (id из таблицы questNpc, number)
// 4) Покупка предмета. Должен содержать параметр itemId (id предмета, number)
// 5) Сдача предмета. Должен содержать параметр itemId (id предмета, number)

const notifs = require('../notifications');
const money = call('money');
const inventory = call('inventory');


const MAX_ACTIVE_QUESTS = 5;                  // максимальное кол-во выполняемых квестов одновременно
const LOGIC_ENTER_AREA_POS_RANGESHAPE = 10;   // радиус шейпа для логики 'Посещение места по координатам'
const LOGICID_ENTER_AREA_POS = 1;             // id логики 'Посещение места по координатам' // TODO: можно впринципе избавиться от этой константы

// TODO: после удаление квеста не удаляется шейп с логикой 'Посещение места по координатам'
// TODO: автоматический сброс ежедневных квестов у персонажей (онлайн и оффлайн)
// TODO: доработать логику сдачи предмета
// TODO: Дополнить массив анимаций квестовых нпц

module.exports = {
    questsList: [],     // список квестов
    logicList: [],      // список логик
    areaList: [],       // список мест для посещения
    questNPC: [],       // информация о квестовых NPC

    showMarker: true,   // видимость маркеров возле NPC
    sizeShape: 1,       // радиус шейпа и маркера у квестового NPC

    async init() {
        this.areaList = await db.Models.QuestArea.findAll();
        console.log(`[QUESTS] Места для посещения загружены (${this.areaList.length} шт.)`);

        this.logicList = await db.Models.QuestLogic.findAll();
        console.log(`[QUESTS] Логики для квестов загружены (${this.logicList.length} шт.)`);

        const quests = await db.Models.Quest.findAll();
        quests.forEach(quest => this.initQuest(quest));
        console.log(`[QUESTS] Квесты загружены (${quests.length} шт.)`);

        const questNPCs = await db.Models.QuestNPC.findAll();
        questNPCs.forEach(npc => this.initQuestNPC(npc));
        console.log(`[QUESTS] Квестовые NPC загружены (${questNPCs.length} шт.)`);
    },

    initQuest(quest) { // инициализация квеста

        const logicsEnterAreaPos = quest.questLogic.filter(x => x.logicId == LOGICID_ENTER_AREA_POS)
        logicsEnterAreaPos.forEach(current => {
            const areaPos = current.pos;
            if (!areaPos) return console.log(`Для квеста #${quest.id} была установлена логика 'Посещение места по координатам', но не установлен параметр 'pos'`);

            const shape = mp.colshapes.newSphere(areaPos.x, areaPos.y, areaPos.z, LOGIC_ENTER_AREA_POS_RANGESHAPE);
            shape.onEnter = (player) => this.processStageQuest(player, 'enter_area_pos', { pos: areaPos });
        });
        
        this.questsList.push(quest);
    },

    initQuestNPC(npc) {
        const heading = npc.h + 90;
        const markerX = npc.x + 0.8 * Math.cos(heading * Math.PI / 180.0);
        const markerY = npc.y + 0.8 * Math.sin(heading * Math.PI / 180.0);

        const marker = mp.markers.new(1, new mp.Vector3(markerX, markerY, npc.z - 1.2), this.sizeShape, {
            color: [255, 255, 125, 200],
            visible: this.showMarker,
            dimension: npc.d
        });

        let blip = null;
        if (npc.blipCreated) {
            blip = mp.blips.new(792, new mp.Vector3(npc.x, npc.y, npc.z), {
                name: `[NPC] ${npc.name}`,
                shortRange: true,
                color: 47
            });
        }
        const shape = this.createNpcShape(npc, markerX, markerY, npc.z, this.sizeShape);

        npc.npcInfo = {
            id: npc.id,
            position: {
                x: npc.x,
                y: npc.y,
                z: npc.z
            },
            dimension: npc.d,
            heading: npc.h,
            model: npc.model,
            defaultScenario: npc.scenario,
            marker: marker,
            blip: blip,
            shape: shape
        };

        this.questNPC.push(npc);
    },

    loadNpcToPlayer(player) {
        this.questNPC.forEach(el => player.call('quest.npc.createNpc', [el.npcInfo]));
    },

    createNpcShape(npc, x, y, z, size) {
        const shape = mp.colshapes.newSphere(x, y, z, size);

        shape.onEnter = (player) => {
            player.call('quest.npc.nearby', [true]);
            player.activeNPC = npc;
        };
        shape.onExit = (player) => {
            player.call('quest.npc.nearby', [false]);
            player.activeNPC = null;
        };
        // shape.idNPC = npc.id;
        return shape;
    },

    initQuestsToClient(player) {
        const listToClient = {};

        listToClient.enterAreaList = [];
        this.areaList.forEach(area => listToClient.enterAreaList.push(area.ruName));

        listToClient.logicList = [];
        this.logicList.forEach(logic => listToClient.logicList.push({ 
            id: logic.id,
            desc: logic.description,
            descQuest: logic.descToQuest
        }));

        listToClient.quests = [];
        this.questsList.forEach(quest => listToClient.quests.push(this.updateQuestToClient(player, quest.id, true)));

        player.call('quest.init', [listToClient]);
        console.log(`[QUESTS] Информация о квестах для ${player.character.name} загружена`);
    },

    updateQuestToClient(player, questId, init = false, create = false, edit = false, questDelete = false) {
        if (questDelete) return player.call('quest.updateQuest', [questId, undefined]);
        
        const quest = this.getQuestById(questId);
        if (!quest || !player.character) return;

        const questInfo = {
            questId: quest.id,
            name: quest.name,
            desc: quest.description,
            playerProgress: this.getProgressPlayer(player, quest.id),
            status: this.getQuestStatusPlayer(player, quest.id),
            type: this.getQuestTypeAtPlayer(player, quest.id, quest.type),
            tasks: this.updateTasksToClient(player, quest.id, !init),
            prizes: this.updatePrizeToClient(player, quest.id, !init)
        };

        if (init && !create && !edit && !questDelete) return questInfo;
        player.call('quest.updateQuest', [quest.id, questInfo]);
    },

    getQuestStatusPlayer(player, questId) {
        if (player.character.completePrizeQuest.includes(questId)) return 3;
        else if (player.character.completeQuest.includes(questId) && !player.character.completePrizeQuest.includes(questId)) return 1;
        else return 2;
    },

    getProgressPlayer(player, questId) {
        if (player.character.completeQuest.includes(questId) || player.character.activeQuest.includes(questId)) return true;
        return false;
    },

    getQuestTypeAtPlayer(player, questId, questType) {
        if (player.character.completeQuest.includes(questId) && player.character.completePrizeQuest.includes(questId)) return -1; // завершенное
        return questType;
    },

    updatePrizeToClient(player, questId, toClient = false) {
        const quest = this.questsList.find(x => x.id == questId);
        if (!quest) return;

        let prizes = [];

        quest.prize.forEach(prize => {
            if (prize.money) {
                prizes.push({
                    count: prize.money,
                    img: `money.png`
                });
            }
            else if (prize.itemId) {
                prizes.push({
                    count: prize.itemParams.count,
                    img: `${prize.itemId}.png`
                });
            }
        });

        if (toClient) player.call('quest.updatePrizes', [quest.id, prizes]);
        return prizes;
    },

    updateTasksToClient(player, questId, toClient = false) {
        const quest = this.questsList.find(x => x.id == questId);
        if (!quest) return;

        let playerTasks = [];

        quest.questLogic.forEach((logic, index, array) => {
            playerTasks.push({
                logicIndex: index,
                state: this.getStateTaskForPlayer(player, quest.id, index),
                name: this.getLogicTextForQuest(logic)
            });
        });

        if (toClient) player.call('quest.updatePlayerTasks', [quest.id, playerTasks]);
        return playerTasks;
    },

    //--

    getStateTaskForPlayer(player, questId, logicIndex) {
        if (!player.character) return false;
        if (player.character.completeQuest.includes(questId)) return true;

        let processQuest = [];
        player.character.processLogicQuest.forEach(process => {
            if (process.questId == questId) processQuest.push(process);
        });

        for (let i = 0; i < processQuest.length; i++) {
            if (i == logicIndex && processQuest[i].complete) return true;
        }

        return false;
    },

    getNpcById(id) {
        return this.questNPC.find(x => x.id == id);
    },

    getQuestNameById(id) {
        const quest = this.getQuestById(id);
        if (quest) return quest.name;
    },

    getQuestById(id) {
        return this.questsList.find(x => x.id == id);
    },

    getLogicQuestByParams(questId, logicId, params) {
        const quest = this.getQuestById(questId);
        if (!quest) return;
        
        if (params.name == 'pos') {
            const index = quest.questLogic.findIndex(x => x.logicId == logicId && x.pos && x.pos.x == params.param.x && x.pos.y == params.param.y && x.pos.z == params.param.z);
            const logic = quest.questLogic.find(x => x.logicId == logicId && x.pos && x.pos.x == params.param.x && x.pos.y == params.param.y && x.pos.z == params.param.z);
            logic.index = index;
            return logic;
        } 
        else {
            const index = quest.questLogic.findIndex(x => x.logicId == logicId && x[params.name] && x[params.name] == params.param);
            const logic = quest.questLogic.find(x => x.logicId == logicId && x[params.name] && x[params.name] == params.param);
            logic.index = index;
            return logic;
        }
    },

    getQuestsByLogicId(logicId) {
        let quests = [];
        this.questsList.forEach(quest => {
            const findLogic = quest.questLogic.find(x => x.logicId == logicId);
            if (findLogic) quests.push(quest);
        });
        return quests;
    },

    getLogicTextForQuest(logic) {
        let text = this.logicList.find(x => x.id == logic.logicId).descToQuest + ' ';

        if (logic.areaId) text += this.getRuNameAreaById(logic.areaId);
        if (logic.itemId) text += inventory.getName(logic.itemId) + ` (${logic.count} шт.)`;
        if (logic.npcId) text += this.getNameNPC(logic.npcId);

        return text;
    },

    getNameNPC(npcId) {
        return this.questNPC.find(x => x.id == npcId).name;
    },

    getNameAreaById(idArea) {
        return this.areaList.find(x => x.id == idArea).name || undefined;
    },

    getRuNameAreaById(idArea) {
        return this.areaList.find(x => x.id == idArea).ruName || undefined;
    },

    getAreaIdByName(nameArea) {
        return this.areaList.find(x => x.name == nameArea).id || undefined;
    },

    getLogicIdByName(nameStage) {
        return this.logicList.find(x => x.name == nameStage).id || undefined;
    },

    startQuestToPlayer(player, idQuest) {
        if (!player.character) return;
        let character = player.character;

        if (character.activeQuest.length >= MAX_ACTIVE_QUESTS) return out(player, `Достигнут предел выполняемых квестов (${MAX_ACTIVE_QUESTS})`, idQuest);

        const activeQuests = character.activeQuest.includes(idQuest);
        if (activeQuests) return out(player, 'Вы уже выполняете этот квест', idQuest);

        const completeQuests = character.completeQuest.includes(idQuest);
        if (completeQuests) return out(player, 'Вы уже выполнили этот квест', idQuest);

        const quest = this.getQuestById(idQuest);
        if (!quest) return out(player, 'Квест не найден в базе');

        addActiveQuestToPlayer(player, idQuest); 
        addProcessQuestToPlayer(player, idQuest);
        player.call('quest.setPlayerProgressQuest', [idQuest, true]);

        quest.questLogic.forEach(x => {
            addProcessLogicQuestToPlayer(player, { // продвижение этапа
                questId: idQuest, 
                idLogic: x.logicId,
                pos: x.pos ? x.pos : null,
                areaId: x.areaId ? x.areaId : null,
                npcId: x.npcId ? x.npcId : null,
                itemId: x.itemId ? x.itemId : null,
                process: 0,
                complete: false
            });
        });

        character.save();
        out(player, `Вы начали выполнение квеста`, idQuest);
    },

    cancelQuestToPlayer(player, idQuest, complete = false) {
        if (!player.character) return;
        let character = player.character;

        const activeQuests = character.activeQuest.includes(idQuest);
        if (!activeQuests) return out(player, 'Вы не выполняете этот квест', idQuest);

        // TODO: можно сделать одну функцию deleteQuestInfoToPlayer(player, idQuest);
        deleteActiveQuestToPlayer(player, idQuest); // удалить квест из массива активных квестов
        deleteProcessQuestToPlayer(player, idQuest); // удалить квест из массива процесса выполнения квестов
        deleteProcessLogicQuestToPlayer(player, idQuest); // удалить квест из массива процесса логики выполнения квестов
        
        if (!complete) { // если просто отмена квеста
            character.save();
            player.call('quest.setPlayerProgressQuest', [idQuest, false]);
            out(player, `Вы отменили выполнение квеста`, idQuest);
        }
    },

    completeQuestToPlayer(player, idQuest) {
        if (!player.character) return;
        const completeQuests = player.character.completeQuest.includes(idQuest);
        if (completeQuests) return out(player, 'Вы уже выполнили этот квест', idQuest);

        this.cancelQuestToPlayer(player, idQuest, true);
        addCompleteQuestToPlayer(player, idQuest);
        player.call('quest.setStatusQuest', [idQuest, 1]);

        player.character.save();
    },

    givePrizeToPlayer(player, idQuest) {
        if (!player.character) return;
        const quest = this.getQuestById(idQuest);
        if (!quest) return;

        if (!player.character.completeQuest.includes(idQuest)) return out(player, 'Вы еще не выполнили этот квест', idQuest);
        if (player.character.completePrizeQuest.includes(idQuest)) return out(player, 'Вы уже получили награду за этот квест', idQuest);

        player.call('quest.setTypeQuest', [idQuest, -1]);
        player.call('quest.setStatusQuest', [idQuest, 3]);
        
        addCompletePrizeQuestToPlayer(player, idQuest);
        player.character.save();

        const prizes = quest.prize;
        // TODO: не форейч, а цикл. проверка на вместимость вещи в инвентаре, если места нет - return out('Награда не выдана');
        // надо сделать отдельный массив вещей призов с параметрами, чтобы сначала проверить вмещается ли вся награда в инвентарь
        // если все вещи вмещаются, то тогда уже выдавать игроку из этого массива
        prizes.forEach(prize => {

            if (prize.itemId) {
                const params = prize.itemParams ? prize.itemParams : {};

                inventory.addItem(player, prize.itemId, params, (e) => {
                    if (e) return out(player, e, idQuest);
                });
            }

            if (prize.money) {
                money.addCash(player, prize.money, res => {
                    if (!res) return out(player, `Ошибка начисления наличных за выполненный квест`, idQuest);
                }, `Выполнение квеста ${quest.name}`);
            }
        });

        out(player, `Вы выполнили квест и получили награду.`, idQuest);
    },

    sendProcessLogicQuest(player, idQuest, idLogic, params) { // продвижение этапа
        if (!player.character || !params) return;
        let character = player.character;

        const activeQuests = character.activeQuest.includes(idQuest);
        if (!activeQuests) return;

        let paramQuest = {};
        if (params.pos) paramQuest = { name: 'pos', param: params.pos}
        if (params.areaName) paramQuest = { name: 'areaId', param: this.getAreaIdByName(params.areaName)};
        if (params.pedId) paramQuest = { name: 'npcId', param: params.pedId};
        if (params.itemId) paramQuest = { name: 'itemId', param: params.itemId};
        if (!paramQuest.name || !paramQuest.param) return;

        const processLogicQuest = character.processLogicQuest;
        const firstNotComplete = processLogicQuest.find(x => x.questId == idQuest && x.complete == false);
        const processLogicQuestIndex = processLogicQuest.findIndex(x => x.questId == idQuest && x.complete == false);

        if (!firstNotComplete) return; // этапы уже выполнены
        if (paramQuest.name == 'pos') {
            if (firstNotComplete.idLogic != idLogic || !firstNotComplete[paramQuest.name] || 
                firstNotComplete[paramQuest.name].x != paramQuest.param.x || firstNotComplete[paramQuest.name].y != paramQuest.param.y || 
                firstNotComplete[paramQuest.name].z != paramQuest.param.z) return;
        }
        else {
            if (firstNotComplete.idLogic != idLogic || !firstNotComplete[paramQuest.name] || 
                firstNotComplete[paramQuest.name] != paramQuest.param) return; // если продвигается не первый невыполненный этап в квесте
        }

        const logic = this.getLogicQuestByParams(idQuest, idLogic, paramQuest);
        if (!logic) return;

        let currentLogicQuest = processLogicQuest[processLogicQuestIndex];
        currentLogicQuest.process++; // продвигаем выполнение этапа
        character.processLogicQuest = processLogicQuest;

        if (currentLogicQuest.process >= logic.count) {
            currentLogicQuest.complete = true;
            character.processLogicQuest = processLogicQuest;
            player.call('quest.setStateTask', [idQuest, logic.index, true]);

            this.sendProcessQuest(player, idQuest);
        } 
        else { // если этап выполнен не до конца
            character.save();
        }
    },

    sendProcessQuest(player, idQuest) { // продвижение квеста
        if (!player.character) return;
        let character = player.character;

        const activeQuests = character.activeQuest.includes(idQuest);
        if (!activeQuests) return;

        const quest = this.getQuestById(idQuest);
        if (!quest) return;

        const processQuest = character.processQuest;
        const processQuestIndex = processQuest.findIndex(x => x.questId == idQuest);
        if (processQuestIndex == -1) return; // квест уже выполнен

        let currentProcessQuest = processQuest[processQuestIndex];
        currentProcessQuest.process++; // продвигаем выполнение квеста (выполнили этап/логику)
        character.processQuest = processQuest;

        if (currentProcessQuest.process >= quest.questLogic.length) {
            this.completeQuestToPlayer(player, idQuest); // если все этапы выполнены
        }
        else { // если этап выполнен не до конца
            character.save();
        }
    },

    processStageQuest(player, nameStage, params) { // отправка прогресса квеста из любых модулей
        if (!player.character || !params) return;

        const stageId = this.getLogicIdByName(nameStage);
        if (!stageId) return;
        const quests = this.getQuestsByLogicId(stageId);

        quests.forEach(quest => {
            
            quest.questLogic.forEach(logic => {
                if (logic.logicId != stageId) return;

                if (params.pos && params.pos.x == logic.pos.x && params.pos.y == logic.pos.y && params.pos.z == logic.pos.z) return this.sendProcessLogicQuest(player, quest.id, stageId, params);
                if (params.areaName && params.areaName == this.getNameAreaById(logic.areaId)) return this.sendProcessLogicQuest(player, quest.id, stageId, params);
                if (params.pedId && params.pedId == logic.npcId) return this.sendProcessLogicQuest(player, quest.id, stageId, params);
                if (params.itemId && params.itemId == logic.itemId) {
                    // цикл по params.count
                    for (let i = 0; i < params.count; i++) this.sendProcessLogicQuest(player, quest.id, stageId, params);
                    return;
                }
            });
        });
    },

    // npc --

    startDialogNPC(player) {
        if (!player.activeNPC) return;
        
        // обработка инфы перса, составление массива ответов и greeting
        let data = {
            npcId: player.activeNPC.id,
            name: player.activeNPC.name,
            text: [player.activeNPC.greeting],
            options: this.getOptionsPlayer(player, player.activeNPC.id) // получить варианты ответов от npc
        }

        player.call('quest.npc.dialog', [data]);
        this.processStageQuest(player, 'talk_ped', { pedId: data.npcId });
    },

    getOptionsPlayer(player, npcId) {
        const npcQuests = this.getNpcById(npcId).quests;
        if (!player.character) return; // !npcQuests || npcQuests.length == 0 || 

        let options = [];

        npcQuests.forEach(quest => {
            const questInfo = this.getQuestById(quest);
            if (!questInfo) return;

            if (!player.character.completeQuest.includes(quest) && !player.character.activeQuest.includes(quest)) {
                options.push({
                    id: questInfo.id,
                    text: `[Новый квест] ${questInfo.name}`
                });
            }

            if (player.character.activeQuest.includes(quest)) {
                questInfo.questLogic.forEach(logic => {
                    const logicInfo = this.logicList.find(x => x.id == logic.logicId);
                    if (!logicInfo) return;

                    const firstNotCompleted = player.character.processLogicQuest.find(x => x.questId == questInfo.id && x.complete == false);
                    if (logicInfo.name == "give_item" && firstNotCompleted.idLogic == logicInfo.id) {
                        options.push({
                            id: -questInfo.id,
                            text: `[Сдать предмет] ${inventory.getName(logic.itemId)} (${logic.count} шт.)`
                        });
                    }
                });
            }
        });

        options.push({
            id: 0,
            text: 'Уйти'
        });
        // TODO: можно добавить варианты в повседневный разговор

        return options;
    },

    showQuestDialogNPC(player, idQuest) {
        if (!player.character) return;
        if (idQuest < 0) return this.giveItemToNPC(player, -idQuest);

        if (!this.checkNearbyQuestNPC(player, idQuest)) return;
        const quest = this.getQuestById(idQuest);
        if (!quest) return;

        player.call('quest.show', [quest.id]);
    },

    giveItemToNPC(player, idQuest) {
        if (!player.character) return;
        if (!this.checkNearbyQuestNPC(player, idQuest)) return;

        const quest = this.getQuestById(idQuest);
        if (!quest) return;
        if (!player.character.activeQuest.includes(quest.id)) return;

        quest.questLogic.forEach(logic => {
            const logicInfo = this.logicList.find(x => x.id == logic.logicId);
            if (!logicInfo) return;

            const firstNotCompleted = player.character.processLogicQuest.find(x => x.questId == quest.id && x.complete == false);
            if (!firstNotCompleted || logicInfo.name != "give_item" || firstNotCompleted.idLogic != logicInfo.id) return;
            if (this.getItemCountForQuest(player, logic.itemId) < logic.count) return out(player, `Вам необходимо иметь ${inventory.getName(logic.itemId)} (${logic.count} шт.)`, idQuest);
            
            const paramQuest = {
                itemId: logic.itemId,
                count: logic.count
            };
            this.removeitemForQuest(player, paramQuest);
            this.processStageQuest(player, 'give_item', paramQuest);
        });
    },

    getItemCountForQuest(player, itemId) {
        const items = inventory.getArrayByItemId(player, itemId);
        let count = items.length;

        items.forEach(item => {
            const params = inventory.getParamsValues(item);
            if (params.count) count += params.count - 1;
        });

        return count;
    },

    removeitemForQuest(player, data) {
        let count = data.count;
        const items = inventory.getArrayByItemId(player, data.itemId);
        for (let i = 0; i < items.length; i++) {
            if (!count) break;
            const item = items[i];
            const params = inventory.getParamsValues(item);
            const del = Math.clamp(params.count || 1, 0, count);
            count -= del;
            (!params.count || params.count - del <= 0) ? inventory.deleteItem(player, item) : inventory.updateParam(player, item, 'count', params.count - del);
        }
    },

    checkNearbyQuestNPC(player, idQuest) {
        let nearby = false;

        this.questNPC.forEach(npc => {
            if (!npc.quests.includes(idQuest)) return;
            if (player.dist(npc.npcInfo.position) < 2) nearby = true;
        });

        return nearby;
    },

    // npc editor --

    async createNpc(newNpc) {
        let npc = await db.Models.QuestNPC.create({
            name: newNpc.name,
            greeting: newNpc.greeting,
            x: newNpc.pos.x,
            y: newNpc.pos.y,
            z: newNpc.pos.z,
            h: newNpc.h,
            d: newNpc.d,
            quests: newNpc.quests,
            model: newNpc.model,
            scenario: newNpc.scenario,
            blipCreated: newNpc.blipCreated
        });
        this.initQuestNPC(npc);

        mp.players.forEach(rec => {
            rec.call('quest.npc.createNpc', [npc.npcInfo]);
        });
        console.log(`[QUESTS] Создан новый квестовый NPC (#${npc.id} - ${npc.name})`);
    },

    editNpc(npcId, newNpc) {
        let npc = this.getNpcById(npcId);
        if (!npc) return;

        npc.name = newNpc.name;
        npc.greeting = newNpc.greeting;
        npc.x = newNpc.pos.x;
        npc.y = newNpc.pos.y;
        npc.z = newNpc.pos.z;
        npc.h = newNpc.h;
        npc.d = newNpc.d;
        npc.quests = newNpc.quests;
        npc.model = newNpc.model;
        npc.scenario = newNpc.scenario;
        npc.blipCreated = newNpc.blipCreated;
        npc.save();

        const heading = npc.h + 90;
        const markerX = npc.x + 0.8 * Math.cos(heading * Math.PI / 180.0);
        const markerY = npc.y + 0.8 * Math.sin(heading * Math.PI / 180.0);

        npc.npcInfo.marker.position = new mp.Vector3(markerX, markerY, newNpc.pos.z - 1.2);

        if (npc.blipCreated) { 
            if (npc.npcInfo.blip) npc.npcInfo.blip.position = newNpc.pos;
            else {
                npc.npcInfo.blip = mp.blips.new(792, new mp.Vector3(npc.x, npc.y, npc.z), {
                    name: `[NPC] ${npc.name}`,
                    shortRange: true,
                    color: 47
                });
            }
        } 
        else if (npc.npcInfo.blip) { 
            npc.npcInfo.blip.destroy();
            npc.npcInfo.blip = null;
        }

        npc.npcInfo.shape.destroy();
        const shape = this.createNpcShape(npc, markerX, markerY, newNpc.pos.z, this.sizeShape);
        npc.npcInfo.shape = shape;

        npc.npcInfo.position = newNpc.pos;
        npc.npcInfo.dimension = newNpc.d;
        npc.npcInfo.heading = newNpc.h;
        npc.npcInfo.model = newNpc.model;
        npc.npcInfo.defaultScenario = newNpc.scenario;

        mp.players.forEach(rec => {
            rec.call('quest.npc.updateNpcInfo', [npc.id, npc.npcInfo]);
        });

        console.log(`[QUESTS] Изменен квестовый NPC (#${npcId})`);
    },

    deleteNpc(npcId) {
        const npc = this.getNpcById(npcId);
        if (!npc) return;

        const npcIndex = this.questNPC.findIndex(x => x.id == npcId);
        if (npcIndex == -1) return;

        npc.npcInfo.marker.destroy();
        if (npc.npcInfo.blip) { 
            npc.npcInfo.blip.destroy();
            npc.npcInfo.blip = null;
        }
        npc.npcInfo.shape.destroy();

        mp.players.forEach(rec => {
            rec.call('quest.npc.deleteNpc', [npc.id]);
        });

        npc.destroy();
        this.questNPC.splice(npcIndex, 1);

        console.log(`[QUESTS] Удален квестовый NPC (#${npcId})`);
    },

    // quest editor --

    async createQuest(newQuest) {
        let quest = await db.Models.Quest.create({
            name: newQuest.name,
            description: newQuest.description,
            type: newQuest.type,
            prize: newQuest.prize,
            questLogic: newQuest.questLogic
        });
        
        this.initQuest(quest);

        mp.players.forEach(rec => {
            if (!rec.character) return;
            this.updateQuestToClient(rec, quest.id, true, true);
        });
        console.log(`[QUESTS] Создан новый квест (#${quest.id})`);
    },

    editQuest(idQuest, newQuest) {
        let quest = this.getQuestById(idQuest);
        if (!quest) return;

        quest.name = newQuest.name;
        quest.description = newQuest.description;
        quest.type = newQuest.type;
        quest.prize = newQuest.prize;
        quest.questLogic = newQuest.questLogic;

        quest.save();
        clearQuestFromCharacters(idQuest);

        console.log(`[QUESTS] Изменен квест (#${idQuest})`);
    },

    deleteQuest(idQuest) {
        const quest = this.getQuestById(idQuest);
        if (!quest) return;

        const questIndex = this.questsList.findIndex(x => x.id == idQuest);
        if (questIndex == -1) return;

        quest.destroy();
        this.questsList.splice(questIndex, 1);
        clearQuestFromCharacters(idQuest, true);

        console.log(`[QUESTS] Удален квест (#${idQuest})`);
    }
};

function out(player, text, idQuest) {
    idQuest = idQuest ? call('quests').getQuestNameById(idQuest) : '[Квест]';
    notifs.info(player, text, idQuest);
}

// потому что нельзя так явно юзать .push на player.character
function addActiveQuestToPlayer(player, idQuest) {
    const activeQuest = player.character.activeQuest;
    activeQuest.push(idQuest);
    player.character.activeQuest = activeQuest;
}

function addProcessQuestToPlayer(player, idQuest) {
    const processQuest = player.character.processQuest;
    processQuest.push({questId: idQuest, process: 0});
    player.character.processQuest = processQuest;
}

function addProcessLogicQuestToPlayer(player, info) {
    const processLogicQuest = player.character.processLogicQuest;
    processLogicQuest.push(info);
    player.character.processLogicQuest = processLogicQuest;
    call('quests').updateTasksToClient(player, info.questId, true);
}

function addCompleteQuestToPlayer(player, idQuest) {
    const completeQuest = player.character.completeQuest;
    completeQuest.push(idQuest)
    player.character.completeQuest = completeQuest;
}

function addCompletePrizeQuestToPlayer(player, idQuest) {
    const completePrizeQuest = player.character.completePrizeQuest;
    completePrizeQuest.push(idQuest)
    player.character.completePrizeQuest = completePrizeQuest;
}

function deleteActiveQuestToPlayer(player, idQuest, inDb = false) {
    if (!inDb) player = player.character;

    const activeQuest = player.activeQuest;
    const activeQuestIndex = activeQuest.indexOf(idQuest);
    if (activeQuestIndex == -1) return;

    activeQuest.splice(activeQuestIndex, 1);
    return player.activeQuest = activeQuest;
}

function deleteProcessQuestToPlayer(player, idQuest, inDb = false) {
    if (!inDb) player = player.character;

    const processQuest = player.processQuest;
    const findQuestIndex = processQuest.findIndex(x => x.questId == idQuest);
    if (findQuestIndex == -1) return;

    processQuest.splice(findQuestIndex, 1);
    return player.processQuest = processQuest;
}

function deleteProcessLogicQuestToPlayer(player, idQuest, inDb = false) {
    if (!inDb) player = player.character;

    let processLogicQuest = player.processLogicQuest;
    const count = processLogicQuest.length;
    
    let index;
    for (let i = 0; i < count; i++) {
        index = processLogicQuest.findIndex(x => x.questId == idQuest);
        if (index != -1) processLogicQuest.splice(index, 1);
    }

    return player.processLogicQuest = processLogicQuest;
}

function deleteCompleteQuestToPlayer(player, idQuest, inDb = false) {
    if (!inDb) player = player.character;

    const completeQuest = player.completeQuest;
    const completeQuestIndex = completeQuest.indexOf(idQuest);
    if (completeQuestIndex == -1) return;

    completeQuest.splice(completeQuestIndex, 1);
    return player.completeQuest = completeQuest;
}

function deleteCompletePrizeQuestToPlayer(player, idQuest, inDb = false) {
    if (!inDb) player = player.character;

    const completePrizeQuest = player.completePrizeQuest;
    const completePrizeQuestIndex = completePrizeQuest.indexOf(idQuest);
    if (completePrizeQuestIndex == -1) return;

    completePrizeQuest.splice(completePrizeQuestIndex, 1);
    return player.completePrizeQuest = completePrizeQuest;
}

function clearQuestFromCharacters(idQuest, deleteQuest = false) { // delete or edit quest
    mp.players.forEach(rec => {
        if (!rec.character) return;

        if (rec.character.completeQuest.includes(idQuest)) {
            deleteCompleteQuestToPlayer(rec, idQuest);
            deleteCompletePrizeQuestToPlayer(rec, idQuest);
            rec.character.save();
        }

        if (rec.character.activeQuest.includes(idQuest)) {
            deleteActiveQuestToPlayer(rec, idQuest);
            deleteProcessQuestToPlayer(rec, idQuest);
            deleteProcessLogicQuestToPlayer(rec, idQuest);
            rec.character.save();
        }

        call('quests').updateQuestToClient(rec, idQuest, true, false, !deleteQuest, deleteQuest);
        rec.call('quest.setPlayerProgressQuest', [idQuest, false]);
    });

    clearQuestInfoFromCharacters(idQuest);
}

async function clearQuestInfoFromCharacters(idQuest) {
    const characters = await db.Models.Character.findAll();

    characters.forEach(char => {
        if (char.completeQuest.includes(idQuest)) {
            char.update({
                completeQuest: deleteCompleteQuestToPlayer(char, idQuest, true),
                completePrizeQuest: deleteCompletePrizeQuestToPlayer(char, idQuest, true)
            });
        }
        if (char.activeQuest.includes(idQuest)) {
            char.update({
                activeQuest: deleteActiveQuestToPlayer(char, idQuest, true),
                processQuest: deleteProcessQuestToPlayer(char, idQuest, true),
                processLogicQuest: deleteProcessLogicQuestToPlayer(char, idQuest, true)
            });
        }
    })
}