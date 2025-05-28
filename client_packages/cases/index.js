mp.events.add({
    "cases.show": (name, cost, data) => {
        mp.callCEFV(`roulette.setData('${name}', ${cost}, '${JSON.stringify(data)}')`);
        mp.callCEFV(`roulette.setState(true)`);
    },
    "cases.close": () => {
        mp.callCEFV(`roulette.setState(false)`);
    },
    "cases.open": (roll) => {
        mp.callCEFV(`roulette.spinWheel(${roll})`);
    },
    "cases.prizes.show": (prizes) => {
        const items = [];

        prizes.forEach(prize => {
            items.push({
                id: prize.id,
                text: prize.name,
            });
        });
        items.push({ text: 'Закрыть' });

        mp.callCEFV(`selectMenu.setItems("caseShowPrizes", ${JSON.stringify(items)});`)
        mp.events.call("selectMenu.show", "caseShowPrizes");
    }
});