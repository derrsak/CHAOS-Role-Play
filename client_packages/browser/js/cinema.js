var cinema = new Vue({
    el: "#cinema",
    data() {
		return {
			active: false,
			name: "",
			votes: 0,
			maxvotes: 10,
			time: 0,
			skipped: false,
			url: {},
			allUrls: [],
			timer: null,
			timerNum: 0
		}
	},
	watch: {
        active(val) {
            if (val) busy.add("cinema", true, true);
            else busy.remove("cinema", true);
        }
    },
	destroyed() {
		this.stopTimer();
	},
	methods: {
		addVideoToLine() {
			const url = this.$refs.cinemaUrl.value;
			mp.trigger('callRemote', 'cinema.setUrl', url);
		},

		updateLine(urls) {
			this.allUrls = JSON.parse(urls);
		},

		updateDuration() {
			if (!this.url) return;
			this.timerNum++;
			if (this.timerNum < this.url.timeEnd) return;
			this.stopTimer();
		},

		setVote(vote, votesm) {
			this.votes = vote;
			this.maxvotes = votesm;
		},

		openCinema(url, time, urls, skipped, vote, votes, name) {
			url = JSON.parse(url);
			urls = JSON.parse(urls);

			this.url = url;
			this.time = time;
			this.allUrls = urls;
			this.skipped = skipped;
			this.votes = vote;
			this.maxvotes = votes;
			this.name = name;
			this.startTimer(time);
		},

		exitCinema() {
			this.stopTimer();
			mp.trigger('cinema.close');
			this.url = null;
			this.active = false;
		},

		skipVideo(time, url, urls, vote, votesm) {
			url = JSON.parse(url);
			urls = JSON.parse(urls);

			this.url = url;
			this.time = time;
			this.allUrls = urls;
			this.votes = vote;
			this.maxvotes = votesm;
			this.skipped = false;
			this.startTimer(time);
		},

		voteSkip() {
			if (this.allUrls.length == 0 || this.skipped) return;
			this.skipped = true;
			mp.trigger('callRemote', 'cinema.voteSkip');
		},

		startTimer(time) {
			this.timerNum = time;
			if (!this.timer) this.timer = setInterval(this.updateDuration, 1000);
		},

		stopTimer() {
			if (this.timer) clearTimeout(this.timer);
			this.timer = null;
		},

		secToDate(seconds) {
			const normalize = time => time < 10 ? `0${time}` : time;
		
			seconds = Number(seconds);
			const d = Math.floor(seconds / (3600*24));
			const h = Math.floor(seconds % (3600*24) / 3600);
			const m = Math.floor(seconds % 3600 / 60);
			const s = Math.floor(seconds % 60);
		
			const dd = d > 0 ? `${normalize(d)}:` : '';
			const hh = h > 0 ? `${normalize(h)}:` : '00:';
			const mm = m > 0 ? `${normalize(m)}:` : '00:';
			const ss = s > 0 ? normalize(s) : '00';
			return dd+hh+mm+ss;
		}
	}
});

