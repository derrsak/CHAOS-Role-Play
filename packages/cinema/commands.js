const cinema = require('./index.js');

module.exports = {
    "/cinematp": {
        access: 6,
        description: "Телепортироваться к кинотеатру",
        args: "[ид_кинотеатра]:n",
        handler: (player, args, out) => {
            const cinemaInfo = cinema.getCinemaById(parseInt(args[0]));
            if (!cinemaInfo) return out.info(`Кинотеатр #${args[0]} не найден`);

            player.position = new mp.Vector3(cinemaInfo.x, cinemaInfo.y, cinemaInfo.z);
            player.dimension = 0;
            out.info(`Вы телепортировались к кинотеатру (#${cinemaInfo.id})`);
        }
    },
    "/cinemaskip": {
        access: 6,
        description: "Скипнуть видео в кинотеатре",
        args: "",
        handler: async (player, args, out) => {
            if (!player.inShapeCinema) return out.info(`Кинотеатр рядом не найден`);
            const cinemaInfo = player.inShapeCinema;

            if (cinemaInfo.urls.length == 0) {
                const videoInfo = await cinema.generateVideoInfo('twZnbqHoGyQ');
                cinemaInfo.currentUrl = videoInfo;
            }
            else {
                cinemaInfo.currentUrl = cinemaInfo.urls[0];
                cinemaInfo.urls.splice(0, 1);
            }

            cinemaInfo.time = 0;
            cinemaInfo.votes = 0;
            cinemaInfo.playing = true;
            cinema.skipVideoToPlayers(cinemaInfo, true);
            out.info(`Вы скипнули видео в кинотеатре (#${cinemaInfo.id})`);
        }
    }
}