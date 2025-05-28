const quests = require('./index.js');

module.exports = {
    "/npclist": {
        access: 6,
        description: "Список созданных квестовых NPC",
        args: "",
        handler: (player, args, out) => {
            if (quests.questNPC.length == 0) return out.info(`Список квестовых NPC пуст`);
            quests.questNPC.forEach(x => {
                out.info(`ID: ${x.id} | Имя: ${x.name}`);
            });
        }
    },
    "/npccreate": {
        access: 6,
        description: "Создать квестового NPC",
        args: "",
        handler: (player, args, out) => {
            player.call('quest.editor.npc.addNpc');
        }
    },
    "/npcedit": {
        access: 6,
        description: "Редактировать квестового NPC",
        args: "[ид_npc]:n",
        handler: (player, args, out) => {
            const npc = quests.getNpcById(args[0]);
            if (!npc) return out.info(`Квестовый NPC #${args[0]} не найден.`);

            player.call('quest.editor.npc.editNpc', [npc]);
        }
    },
    "/quests": {
        access: 6,
        description: "Открыть список активных квестов",
        args: "",
        handler: (player, args, out) => {
            player.call('quest.showList');
        }
    },
    "/questshow": {
        access: 6,
        description: "Вывести в консоль информацию о квесте",
        args: "[ид_квеста]:n",
        handler: (player, args, out) => {
            const quest = quests.getQuestById(args[0]);
            if (!quest) return out.info(`Квест #${args[0]} не найден.`);

            player.call('quest.show', [quest.id]);
        }
    },
    "/questlist": {
        access: 6,
        description: "Показать все квесты",
        args: "[ид_квеста]:n",
        handler: (player, args, out) => {
            quests.questsList.forEach(quest => {
                out.info(`Квест #${quest.id} - ${quest.name}`);
            })
        }
    },
    "/queststart": {
        access: 6,
        description: "Начать выполнение квеста",
        args: "[ид_квеста]:n",
        handler: (player, args, out) => {
            const quest = quests.getQuestById(args[0]);
            if (!quest) return out.info(`Квест #${args[0]} не найден.`);

            quests.startQuestToPlayer(player, quest.id);
        }
    },
    "/questactive": {
        access: 6,
        description: "Посмотреть активные квесты",
        args: "",
        handler: (player, args, out) => {
            player.character.activeQuest.forEach(id => {
                const quest = quests.getQuestById(id);
                if (!quest) return;
                out.info(`Активный квест (#${quest.id}) - ${quest.name}`);
            });
        }
    },
    "/questcancel": {
        access: 6,
        description: "Отменить выполнение квеста",
        args: "[ид_квеста]:n",
        handler: (player, args, out) => {
            const quest = quests.getQuestById(args[0]);
            if (!quest) return out.info(`Квест #${args[0]} не найден.`);

            quests.cancelQuestToPlayer(player, quest.id);
        }
    },
    "/questcomplete": {
        access: 6,
        description: "Посмотреть выполненные квесты",
        args: "",
        handler: (player, args, out) => {
            player.character.completeQuest.forEach(id => {
                const quest = quests.getQuestById(id);
                if (!quest) return;
                out.info(`Выполненный квест (#${quest.id}) - ${quest.name}`);
            });
        }
    },
    "/questcreate": {
        access: 6,
        description: "Создать новый квест",
        args: "",
        handler: (player, args, out) => {
            player.call('quest.editor.addQuest');
        }
    },
    "/questedit": {
        access: 6,
        description: "Редактировать созданный квест",
        args: "[ид_квеста]:n",
        handler: (player, args, out) => {
            const quest = quests.getQuestById(args[0]);
            if (!quest) return out.info(`Квест #${args[0]} не найден.`);

            player.call('quest.editor.editQuest', [quest]);
        }
    },
}
