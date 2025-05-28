const atms = require('./index.js');

module.exports = {
    "/atmadd": {
        access: 6,
        description: "Добавить банкомат",
        args: "",
        handler: async (player, args, out) => {
            let atm = await db.Models.Atm.create({
                x: player.position.x,
                y: player.position.y,
                z: player.position.z
            });

            atms.createAtm(atm);
            out.info(`${player.name} добавил банкомат #${atm.id}`);
            console.log("[ATMs] Создан новый банкомат");
        }
    },
    "/atmdel": {
        access: 6,
        description: "Удалить банкомат",
        args: "",
        handler: (player, args, out) => {
            const atmNear = atms.getNearAtm(player);
            if (!atmNear) return out.error(`Банкомата поблизости не найдено`, player);
            const atmId = atmNear.atm.id;

            atms.removeAtm(atmId);
            atms.handlerShapeEnter(player, false);
            out.info(`${player.name} удалил банкомат #${atmId}`);
            console.log(`[ATMs] Банкомат #${atmId} был удален`);
        }
    },
}
