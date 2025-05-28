const quests = require('./index.js');
const notifs = require('../notifications');

const ACCESS_TO_EDITOR = 6;

module.exports = {
    'init': async () => {
        await quests.init();
        inited(__dirname);
    },
    "characterInit.done": (player) => {
        quests.initQuestsToClient(player);
        quests.loadNpcToPlayer(player);
    },
    "quest.editor.createQuest": async (player, newQuest) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        await quests.createQuest(JSON.parse(newQuest));
        
        notifs.success(player, 'Квест успешно создан', 'Редактор квестов');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] создал квест.`);
    },
    "quest.editor.editQuest": (player, idQuest, newQuest) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        quests.editQuest(idQuest, JSON.parse(newQuest));

        notifs.success(player, 'Квест успешно отредактирован', 'Редактор квестов');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] отредактировал квест (#${idQuest}).`);
        mp.events.call('admin.notify.all', `!{#db5e4a}У всех игроков очищена история выполнения этого квеста.`);
    },
    "quest.editor.deleteQuest": (player, idQuest) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        quests.deleteQuest(idQuest);

        notifs.success(player, 'Квест успешно удален', 'Редактор квестов');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] удалил квест (#${idQuest}).`);
        mp.events.call('admin.notify.all', `!{#db5e4a}У всех игроков очищена история выполнения этого квеста.`);
    },
    "quest.npc.startDialog": (player) => {
        quests.startDialogNPC(player);
    },
    "quest.npc.dialog.SendQuest": (player, idQuest) => {
        quests.showQuestDialogNPC(player, idQuest);
    },
    "quest.startQuest": (player, idQuest) => {
        quests.startQuestToPlayer(player, idQuest);
    },
    "quest.takePrize": (player, idQuest) => {
        quests.givePrizeToPlayer(player, idQuest);
    },
    "quest.editor.npc.createNpc": async (player, newNpc) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        await quests.createNpc(JSON.parse(newNpc));

        notifs.success(player, 'Квестовый NPC успешно создан', 'Редактор NPC');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] создал квестового NPC.`);
    },
    "quest.editor.npc.editNpc": (player, npcId, newNpc) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        quests.editNpc(npcId, JSON.parse(newNpc));

        notifs.success(player, 'Квестовый NPC успешно отредактирован', 'Редактор NPC');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] отредактировал квестогового NPC (#${npcId}).`);
    },
    "quest.editor.npc.deleteNpc": (player, npcId) => {
        if (player.character.admin < ACCESS_TO_EDITOR) return;
        quests.deleteNpc(npcId);

        notifs.success(player, 'Квестовый NPC успешно удален', 'Редактор NPC');
        mp.events.call('admin.notify.all', `!{#db5e4a}Администратор ${player.name}[${player.id}] удалил квестового NPC (#${npcId}).`);
    }
}