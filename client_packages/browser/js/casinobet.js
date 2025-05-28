var casino = new Vue({
    el: '.casino-bet',
    data: {
        active: false,
        minus: 100,
        minn: 100,
        maxx: 1000,
        plus: 100,
        val: 100,
        chips: 0,
        timeToStart: 15
    },
    methods: {
        show(min, max, chips) {
            this.plus = min;
            this.minus = min;

            this.minn = min;
            this.val = min;

            this.maxx = max;

            this.chips = chips;
            this.active = true;
        },
        hide() {
            this.active = false;
        },
        minusAct() {
            if (this.val - this.minus >= this.minn) {
                this.val -= this.minus;
                this.sendBet();
            }
        },
        plusAct() {
            if (this.val + this.plus <= this.maxx) {
                this.val += this.plus;
                this.sendBet();
            }
        },
        validateAndSendBet() {
            if (this.val < this.minn) {
                this.val = this.minn;
            } else if (this.val > this.maxx) {
                this.val = this.maxx;
            }

            this.sendBet();
        },
        sendBet() {
            mp.trigger('casinoBet', this.val);
        },
        setChips(chips) {
            this.chips = chips;
        },
        setTimeToStart(time) {
            this.timeToStart = time;
        },
    }
});
