module.exports = {
    atmsList: [],
    shapeRange: 0.7,

    async init() {
        const atms = await db.Models.Atm.findAll();

        atms.forEach(atm => this.createAtm(atm));
        console.log(`[ATMs] Банкоматы загружены (${atms.length} шт.)`);
    },

    createAtm(atm) {
        let shape = mp.colshapes.newSphere(atm.x, atm.y, atm.z, this.shapeRange);

        shape.onEnter = player => this.handlerShapeEnter(player, true);
        shape.onExit = player => this.handlerShapeEnter(player, false);

        shape.atm = atm;
        this.atmsList.push(shape);
    },

    removeAtm(id) {
        const i = this.atmsList.findIndex(x => x.atm.id == id);
        if (i == -1) return;

        this.atmsList[i].atm.destroy();
        this.atmsList[i].destroy();
        this.atmsList.splice(i, 1);
    },

    getNearAtm(player, range = this.shapeRange) {
        let minDist = Number.MAX_VALUE;
        let nearAtm;

        this.atmsList.forEach(el => {
            const atm = el.atm;
            const distance = player.dist(new mp.Vector3(atm.x, atm.y, atm.z));

            if (distance < minDist && distance < range) {
                nearAtm = el;
                minDist = distance;
            }
        });
        return nearAtm;
    },

    handlerShapeEnter(player, enable) {
        if (enable && (player.vehicle || !player.character)) return;
        player.isATM = enable;
        player.call('atms.shape.enter', [enable]);
    }
};