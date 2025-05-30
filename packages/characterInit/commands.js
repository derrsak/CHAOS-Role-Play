let init = require('./index.js');

module.exports = {
    '/sclothes': {
        args: '',
        description: 'Выдача стартовой одежды',
        access: 6,
        handler: (player, args) => {
            init.setStartClothes(player);
        }
    },
    '/startcuts': {
        args: '',
        description: 'Запустить катсцену',
        access: 6,
        handler: (player, args) => {
            player.call('client.intro.start', [])
        }
    },
    '/changecuts': {
        args: '',
        description: 'Сменить катсцену',
        access: 6,
        handler: (player, args) => {
            player.call('client.intro.switchScene', [])
        }
    },
    '/stopcuts': {
        args: '',
        description: 'Остановить катсцену',
        access: 6,
        handler: (player, args) => {
            player.call('client.intro.stop', [])
        }
    },
    '/savepos': {
        description: 'Сохранить спавн игрока в текущем месте',
        access: 6,
        args: '',
        handler: (player, args, out) => {
            player.character.x = player.position.x;
            player.character.y = player.position.y;
            player.character.z = player.position.z;
            player.character.save();
            out.log(`Спавн сохранен`, player);
        }
    },
}
