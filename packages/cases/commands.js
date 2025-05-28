const cases = require("./index");

module.exports = {
    "/caselist": {
        access: 6,
        description: "Список кейсов",
        args: "",
        handler: (player, args, out) => {
            cases.caseList.forEach(x => {
                out.info(`ID: ${x.id} | Название: ${x.name} | Стоимость: ${x.cost}`, player);
            });
        }
    },
    "/showcase": {
        access: 6,
        description: "Показать кейс",
        args: "[ид_кейса]:n",
        handler: (player, args, out) => {
            cases.showCase(player, args[0]);
        }
    },
}