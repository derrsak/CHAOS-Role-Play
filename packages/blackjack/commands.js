const blackjack = require("./index");
const notifs = call("notifications");

module.exports = {
    "/blackjackclose": {
        access: 6,
        description: "Закрыть/открыть столы игры блекджек",
        args: "",
        handler: (player, args) => {
            const newState = blackjack.changeState();

            notifs.info(player, `Столы ${newState ? "открыты" : "закрыты"}`, 'Блекджек');
        }
    },
}

