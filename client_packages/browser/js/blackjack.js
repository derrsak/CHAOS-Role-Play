var blackjack = new Vue({
    el: "#blackjack",
    data: {
        show: true,
        value: '50',
        bet: 0,
        betWin: 0,
        isBet: 1,
        isBtn: 0,
        btnDouble: false,
        btnSplit: false,
        time: 0,
        btnExit: 1,
        betMax: 25000,
    },
    methods: {
        onBet(type) {
            if (!this.isBet) return;
            switch (type) {
                case 0:
                    this.value = this.value * 2;
                    break;
                case 1:
                    this.value = this.value * 5;
                    break;
                case 2:
                    this.value = Math.round(this.value / 2);
                    break;
                case 3:
                    this.value = Math.round(this.value / 4);
                    break;
                case 4:
                    this.value = this.betMax;
                    break;
            }
            if (Number(this.value) > Number(hud.cash)) this.value = hud.cash;
            if (Number(this.value) > Number(this.betMax)) this.value = this.betMax;
        },

        onSetBet() {
            if (!this.isBet) return;
            else if (Number(this.value) > Number(hud.cash)) {
                this.value = hud.cash;
                notifications.error(`У Вас нет столько денег!`, "Блекджек");
                return;
            } else if (Number(this.value) < 50) {
                this.value = 50;
                notifications.error(`Минимальная ставка составляет $${formatMoney(50)}`, "Блекджек");
                return;
            } else if (Number(this.value) > Number(this.betMax)) {
                this.value = this.betMax;
                notifications.error(`Максимальная ставка на данном столе составляет $${formatMoney(this.betMax)}`, "Блекджек");
                return;
            }
            mp.trigger("client.blackjack.setBet", Number(this.value));
            this.isBet = false;
            this.time = 0;
            this.bet = Number(this.value);
        },

        onExit() {
            if (!this.btnExit) return;
            mp.trigger("client.blackjack.exit");
            this.isBtn = false;
            this.time = 0;
        },

        onBtn(text) {
            if (!this.isBtn) return;
            mp.trigger("client.blackjack.btn", text);
            this.isBtn = false;
            this.time = 0;
        },

        onHandleInput(text) {
            text = Math.round(text.replace(/\D+/g, ""));
            if (text < 1) text = 1;
            else if (text > 999999) text = 999999;
            this.value = text;
        },

        SetBtnInfo(_isBet, _isBtn, _btnDouble, _btnSplit) {
            this.isBet = _isBet;
            this.isBtn = _isBtn;
            this.btnDouble = _btnDouble;
            this.btnSplit = _btnSplit;
        },

        SetTime(_time) {
            this.time = _time;
        },

        SetBtnExit(type) {
            this.btnExit = type;
        },

        SetBet(value) {
            this.bet = value;
        },

        SetBetWin(value) {
            this.betWin = value;
        },

        init(data) {
            if (typeof data == 'string') data = JSON.parse(data);

            this.betMax = data.betMax;
            this.isBet = data.isBet;
            this.isBtn = data.isBtn;
            this.btnDouble = data.btnDouble;
            this.btnSplit = data.btnSplit;
        },
    },
    computed: {
        getCurrentCash() {
            return "$" + formatMoney(hud.cash);
        },
        getCurrentWin() {
            return "$" + formatMoney(this.betWin);
        },
        getCurrentBet() {
            return "$" + formatMoney(this.bet);
        },
    },
    watch: {
        show(val) {
            if (val) busy.add("blackjack", true, true);
            else busy.remove("blackjack", true);
        },
    },
});

function formatTimeToHHMM(time) {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${formattedHours}:${formattedMinutes}`;
}

function formatDateToDDMMYYYY(time) {
    const date = new Date(time);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    return `${formattedDay}.${formattedMonth}.${year}`;
}

const formatMoney = (val) => {
    val += '';
    return val.replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
}