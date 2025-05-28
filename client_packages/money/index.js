"use strict";

var prevCash = null,
    prevBank = null;

mp.events.add('money.change', (cash, bank) => {
    mp.events.call('hud.setData', {
        cash: cash,
        bank: bank
    });
    if (prevCash != null && prevBank != null) {
        if (prevCash < cash) {
            mp.notify.addCash(`+$${cash - prevCash}`);
        } else if (prevCash > cash) {
            mp.notify.removeCash(`-$${prevCash - cash}`);
        }
        global.soundCEF.execute(`playSound("cash_pay");`);
        if (prevBank < bank) {
            mp.notify.addMoney(`+$${bank - prevBank}`);
        } else if (prevBank > bank) {
            mp.notify.removeMoney(`-$${prevBank - bank}`);
        }
        global.soundCEF.execute(`playSound("bank_pay");`);
    }

    prevCash = cash;
    prevBank = bank;
});
