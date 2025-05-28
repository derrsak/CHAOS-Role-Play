const timer = require('../timer');
const notifs = call('notifications');
const money = call('money');

// - Массив мест в кинотеатре, добавьте координаты места для увелечения вместимости.
const seats = [
    new mp.Vector3(-1418.052, -247.6875, 16.79762),
    new mp.Vector3(-1419.253, -247.6236, 16.79766),
    new mp.Vector3(-1421.659, -247.3815, 16.79851),
    new mp.Vector3(-1423.86, -247.2797, 16.79926),
    new mp.Vector3(-1427.273, -247.3671, 16.79961),
    new mp.Vector3(-1430.556, -247.2636, 16.79898),
    new mp.Vector3(-1432.485, -247.544, 16.79794),
    new mp.Vector3(-1432.636, -249.7136, 16.7938),
    new mp.Vector3(-1429.784, -249.8186, 16.79434),
    new mp.Vector3(-1427.626, -249.6948, 16.7951),
    new mp.Vector3(-1424.524, -249.5078, 16.79521),
    new mp.Vector3(-1422.475, -249.7936, 16.79416),
    new mp.Vector3(-1419.898, -249.7854, 16.79353),
    new mp.Vector3(-1419.298, -251.0738, 16.79095),
    new mp.Vector3(-1421.584, -250.7939, 16.79206),
    new mp.Vector3(-1423.801, -250.8243, 16.79255),
    new mp.Vector3(-1426.224, -250.7932, 16.7932),
    new mp.Vector3(-1428.242, -250.6987, 16.79305),
    new mp.Vector3(-1430.339, -250.802, 16.79233),
    new mp.Vector3(-1432.28, -251.1464, 16.79117)
];

module.exports = {
    cinemaList: [],

    priceBuyVideo: 1000,
    priceEnterCinema: 500,
    sizeShape: 1,
    showMarker: true,

    async init() {
        const cinemas = await db.Models.Cinema.findAll();
        cinemas.forEach(cinema => this.create(cinema));

        console.log(`[CINEMA] Кинотеатры загружены (${cinemas.length} шт.)`);
    },

    create(cinema) {
        cinema.playing = false;
        cinema.time = 0;
        cinema.seats = [];
        cinema.urls = [];
        cinema.currentUrl = null;
        cinema.votes = 0;

        seats.forEach(x => {
            cinema.seats.push({
                pos: x,
                state: false
            });
        });

        cinema.blip = mp.blips.new(135, new mp.Vector3(cinema.x, cinema.y, cinema.z), {
            name: cinema.name,
            shortRange: true,
            color: 4
        });

        cinema.marker = mp.markers.new(1, new mp.Vector3(cinema.x, cinema.y, cinema.z - 1.2), this.sizeShape, {
            color: [67, 140, 239, 200],
            visible: this.showMarker
        });

        cinema.shape = mp.colshapes.newSphere(cinema.x, cinema.y, cinema.z, this.sizeShape);
        cinema.shape.onEnter = (player) => {
            if (player.vehicle) return;

            player.call('cinema.shape.enter', [true]);
            player.inShapeCinema = cinema;
        };
        cinema.shape.onExit = (player) => {
            player.call('cinema.shape.enter', [false]);
            player.inShapeCinema = null;
        }

        cinema.timer = timer.addInterval(() => {
            if (!cinema.playing) return;
            cinema.time++;

            if (cinema.time < cinema.currentUrl.timeEnd + 5) return;
            if (cinema.urls.length > 0) {
                this.startNextVideo(cinema);
            }
            else {
                cinema.playing = false;
                cinema.time = 0;
                cinema.currentUrl = null;
            }
            this.skipVideoToPlayers(cinema);
        }, 1000);
        
        this.cinemaList.push(cinema);
    },

    startNextVideo(cinema) {
        cinema.currentUrl = cinema.urls[0];
        cinema.time = 0;
        cinema.votes = 0;
        cinema.urls.splice(0, 1);
    },

    getCinemaById(id) {
        return this.cinemaList.find(x => x.id == id);
    },

    getFreeSeat(id) {
        const cinema = this.getCinemaById(id);
        if (!cinema) return;

        const seat = cinema.seats.find(x => x.state == false);
        if (seat) return seat;
    },

    getCountPlayersInCinema(id) {
        const cinema = this.getCinemaById(id);
        if (!cinema) return;

        let count = 0;
        cinema.seats.forEach(seat => {
            if (seat.state) count++;
        });
        
        return count;
    },

    getMaxVotes(id) {
        const allPlayers = this.getCountPlayersInCinema(id);
        if (allPlayers) return Math.round(allPlayers / 2);
    },

    enter(player) {
        if (player.vehicle || !player.inShapeCinema || !player.character) return;
        player.activeCinema = player.inShapeCinema;

        const cinema = player.activeCinema;
        const place = this.getFreeSeat(cinema.id);
        if (!place) return notifs.error(player, 'В кинотеатре нет места!', '[Кинотеатр]');

        if (player.character.cash < this.priceEnterCinema) return notifs.error(player, `Недостаточно денег для входа ($${this.priceEnterCinema})`, '[Кинотеатр]');
        money.removeCash(player, this.priceEnterCinema, () => {}, `Вход в кинотеатр`);

        place.state = true;
        player.cinemaSeat = place;
        player.dimension = cinema.d;

        let skipPlayer = false;
        if (cinema.currentUrl) skipPlayer = cinema.currentUrl.skipList.includes(player.character.name);

        player.call('cinema.enter.fadeScreen', [400]);
        setTimeout(() => {
            player.call('cinema.open', [cinema.currentUrl, 
                                        cinema.time, 
                                        cinema.urls, 
                                        skipPlayer,
                                        cinema.votes, 
                                        this.getMaxVotes(cinema.id),
                                        cinema.name
                                        ]);
            
            player.position = place.pos;
            player.heading = 180;
            player.inCinema = cinema.id;
        }, 400);
    },

    exit(player) {
        if (!player.inCinema) return;
        player.call('cinema.enter.fadeScreen', [400]);

        setTimeout(() => {
            const place = player.cinemaSeat;
            const cinema = player.activeCinema;

            place.state = false;
            player.position = new mp.Vector3(cinema.x, cinema.y, cinema.z);
            player.heading = 0;
            player.dimension = 0;

            player.inCinema = null;
            player.activeCinema = null;
            player.cinemaSeat = null;
        }, 400);
    },

    async setVideo(player, url) {
        if (!player.character) return;
        if (player.character.cash < this.priceBuyVideo) return notifs.error(player, `Недостаточно денег ($${this.priceBuyVideo})`, '[Кинотеатр]');;

        const pattern = /^https:\/\/(?:www\.)?youtube.com\/watch\?(?=v=.{11}$)(?!\S+http:\/\/)(?:\S*)$/;
        if (!pattern.test(url)) return notifs.error(player, `Неверная ссылка!`, '[Кинотеатр]');

        const cinema = player.activeCinema;
        const urlnew = url.replace('https://www.youtube.com/watch?v=', '');

        const videoInfo = await this.generateVideoInfo(urlnew);
        if (!videoInfo.videoName) return notifs.error(player, `Неверная ссылка!`, '[Кинотеатр]');

        if (cinema.urls.length == 0 && cinema.currentUrl == null) {
            cinema.currentUrl = videoInfo;
            cinema.time = 0;
            cinema.playing = true;
            notifs.success(player, 'Ваше видео запущено!', '[Кинотеатр]');

            this.skipVideoToPlayers(cinema);
        }
        else { 
            cinema.urls.push(videoInfo);
            notifs.success(player, 'Ваше видео добавлено в очередь', '[Кинотеатр]');

            mp.players.forEach(rec => {
                if (!rec.character) return;
                if (!rec.inCinema || rec.inCinema != cinema.id) return;
                rec.call('cinema.updateLine', [cinema.urls]);
            });
        }
        
        money.removeCash(player, this.priceBuyVideo, () => {}, `Покупка видео в кинотеатре`);
    },

    async generateVideoInfo(url) {
        return {
            url: url,
            skipList: [],
            timeEnd: await getVideoDuration(url),
            videoName: await getVideoName(url)
        };
    },

    skipVideoToPlayers(cinema, notif = false) {
        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (!rec.inCinema || rec.inCinema != cinema.id) return;
            rec.call('cinema.skipVideo', [cinema.time, cinema.currentUrl, cinema.urls, cinema.votes, this.getMaxVotes(cinema.id)]);
            if (notif) notifs.info(rec, 'Видео было пропущено', '[Кинотеатр]');
        });
    },

    voteSkipVideo(player) {
        if (!player.character) return;

        const cinema = player.activeCinema;
        if (cinema.urls.length == 0) return;

        const skipPlayer = cinema.currentUrl.skipList.includes(player.character.name);
        if (skipPlayer) return notifs.error(player, 'Вы уже голосовали за пропуск этого видео', '[Кинотеатр]');

        cinema.votes++;
        cinema.currentUrl.skipList.push(player.character.name);

        if (cinema.votes >= this.getMaxVotes(cinema.id)) {
            this.startNextVideo(cinema);
            this.skipVideoToPlayers(cinema, true);
        }
        mp.players.forEach(rec => {
            if (!rec.character) return;
            if (!rec.inCinema || rec.inCinema != cinema.id) return;
            rec.call('cinema.sendVote', [cinema.votes, this.getMaxVotes(cinema.id)]);
        });
    }
}

function getJSON(options) {
    let reqHandler = +options.port === 443 ? require("https") : require("http");
    return new Promise((resolve, reject) => {
        let req = reqHandler.request(options, (res) => {
            let output = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                output += chunk;
            });
            res.on('end', () => {
                try {
                    let obj = JSON.parse(output);
                    resolve(obj);
                }
                catch (err) {
                    console.error('[http_request]:end', err);
                    reject(err);
                }
            });
        });
        req.on('error', (err) => {
            console.error('[http_request]:request', err);
            reject(err);
        });
        req.end();
    });
}

async function getVideoDuration(url) {
    const data = await getJSON({
        host: 'www.googleapis.com',
        port: 443,
        path: `/youtube/v3/videos?id=${url}&key=AIzaSyDR5pWL6JnfIMGhenJ73jDEhyvcACndgCo&part=contentDetails`,
        method: 'GET'
    });
    return parseDuration(data?.items[0]?.contentDetails?.duration);
}

async function getVideoName(url) {
    const data = await getJSON({
        host: 'www.googleapis.com',
        port: 443,
        path: `/youtube/v3/videos?id=${url}&key=AIzaSyDR5pWL6JnfIMGhenJ73jDEhyvcACndgCo&fields=items(snippet(title))&part=snippet`,
        method: 'GET'
    });
    return data?.items[0]?.snippet?.title;
}

function parseDuration(duration) {
    if (!duration) return;
    const regex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;
    const matches = duration.match(regex);

    const date = {
        weeks: matches[4] ? parseInt(matches[4]) : 0,
        day: matches[5] ? parseInt(matches[5]) : 0,
        hours: matches[6] ? parseInt(matches[6]) : 0,
        minutes: matches[7] ? parseInt(matches[7]) : 0,
        seconds: matches[8]  ? parseInt(matches[8]) : 0
    };

    let second = date.seconds;
    if (date.minutes > 0) second += date.minutes * 60;
    if (date.hours > 0) second += date.hours * 3600;
    if (date.day > 0) second += date.day * 86400;
    if (date.weeks > 0) second += date.weeks * 604800;
    return second;
}