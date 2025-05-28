var timer = new Vue({
    el: "#timer",
    data: {
        // текущий таймер
        timer: null,
        // список таймеров
        timers: {
            "death": {
            }
        },
        // общее время жизни таймера
        allTime: 0,
        // оставшееся время жизни таймера
        time: 0,
        // таймер отсчета времени
        updateTimer: null,
        buttonClicked: false,
        killerName: "Неизвестно",
    },
    computed: {
        // ширина прогрессбара (от 0 до 100)
        width() {
            return this.time / this.allTime * 100;
        },
    },
    watch: {
        timer(val) {
            if (val) {
                busy.add("timer", false, true);
            } else {
                busy.remove("timer", true);
            }
        },
    },
    methods: {
        start(name, time) {
            if (!this.timers[name]) return;

            this.time = time;
            this.allTime = time;
            this.timer = this.timers[name];
            clearInterval(this.updateTimer);
            this.updateTimer = setInterval(() => {
                this.time -= 1000;
                if (this.time < 0) {
                    this.stop();
                }
            }, 1000);
        },
        stop() {
            clearInterval(this.updateTimer);
            this.timer = null;
        },
        callMedics() {
            if (this.buttonClicked) return;
            const medKnockTime = 10 * 60 * 1000;
            mp.trigger('callRemote', 'death.wait', medKnockTime);
            this.buttonClicked = true;
        },
    }
});

// for tests
// timer.start("death", 180000);
