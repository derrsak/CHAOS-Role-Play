const utils = call("utils");
const notify = call("notifications");
const casino = call("casino");
const timer = call("timer");

let timerProccesing = [false, false];

module.exports = {
    rouletteTableBetMin: [5, 500],
    rouletteTableBetMax: [250, 10000], 
    rouletteBets: [[], []],

    dimensionCasino: 0,                 // дименшен казино (лучше 0)

    rouletteTables: [                   // координаты столов (лучше не менять, на них много чего завязано)
        new mp.Vector3(1144.814, 268.2634, -52.8409),
        new mp.Vector3(1150.355, 262.7224, -52.8409)
    ],

    rouletteNumbers: [
        [-1, 1],
        [0, 20],
        [1, 38],
        [2, 19],
        [3, 34],
        [4, 15],
        [5, 30],
        [6, 11],
        [7, 26],
        [8, 7],
        [9, 22],
        [10, 3],
        [11, 25],
        [12, 6],
        [13, 37],
        [14, 18],
        [15, 33],
        [16, 14],
        [17, 29],
        [18, 10],
        [19, 8],
        [20, 27],
        [21, 12],
        [22, 31],
        [23, 16],
        [24, 35],
        [25, 4],
        [26, 23],
        [27, 2],
        [28, 21],
        [29, 5],
        [30, 24],
        [31, 9],
        [32, 28],
        [33, 13],
        [34, 32],
        [35, 17],
        [36, 36]
    ],

    spots: [
        [0, [0]],
        [1, [-1]],
        [2, [1]],
        [3, [2]],
        [4, [3]],
        [5, [4]],
        [6, [5]],
        [7, [6]],
        [8, [7]],
        [9, [8]],
        [10, [9]],
        [11, [10]],
        [12, [11]],
        [13, [12]],
        [14, [13]],
        [15, [14]],
        [16, [15]],
        [17, [16]],
        [18, [17]],
        [19, [18]],
        [20, [19]],
        [21, [20]],
        [22, [21]],
        [23, [22]],
        [24, [23]],
        [25, [24]],
        [26, [25]],
        [27, [26]],
        [28, [27]],
        [29, [28]],
        [30, [29]],
        [31, [30]],
        [32, [31]],
        [33, [32]],
        [34, [33]],
        [35, [34]],
        [36, [35]],
        [37, [36]],
        [38, [0, -1]],
        [39, [1, 2]],
        [40, [2, 3]],
        [41, [4, 5]],
        [42, [5, 6]],
        [43, [7, 8]],
        [44, [8, 9]],
        [45, [10, 11]],
        [46, [11, 12]],
        [47, [13, 14]],
        [48, [14, 15]],
        [49, [16, 17]],
        [50, [17, 18]],
        [51, [19, 20]],
        [52, [20, 21]],
        [53, [22, 23]],
        [54, [23, 24]],
        [55, [25, 26]],
        [56, [26, 27]],
        [57, [28, 29]],
        [58, [29, 30]],
        [59, [31, 32]],
        [60, [32, 33]],
        [61, [34, 35]],
        [62, [35, 36]],
        [63, [1, 4]],
        [64, [2, 5]],
        [65, [3, 6]],
        [66, [4, 7]],
        [67, [5, 8]],
        [68, [6, 9]],
        [69, [7, 10]],
        [70, [8, 11]],
        [71, [9, 12]],
        [72, [10, 13]],
        [73, [11, 14]],
        [74, [12, 15]],
        [75, [13, 16]],
        [76, [14, 17]],
        [77, [15, 18]],
        [78, [16, 19]],
        [79, [17, 20]],
        [80, [18, 21]],
        [81, [19, 22]],
        [82, [20, 23]],
        [83, [21, 24]],
        [84, [22, 25]],
        [85, [23, 26]],
        [86, [24, 27]],
        [87, [25, 28]],
        [88, [26, 29]],
        [89, [27, 30]],
        [90, [28, 31]],
        [91, [29, 32]],
        [92, [30, 33]],
        [93, [31, 34]],
        [94, [32, 35]],
        [95, [33, 36]],
        [96, [1, 2, 3]],
        [97, [4, 5, 6]],
        [98, [7, 8, 9]],
        [99, [10, 11, 12]],
        [100, [13, 14, 15]],
        [101, [16, 17, 18]],
        [102, [19, 20, 21]],
        [103, [22, 23, 24]],
        [104, [25, 26, 27]],
        [105, [28, 29, 30]],
        [106, [31, 32, 33]],
        [107, [34, 35, 36]],
        [108, [1, 2, 4, 5]],
        [109, [2, 3, 5, 6]],
        [110, [4, 5, 7, 8]],
        [111, [5, 6, 8, 9]],
        [112, [7, 8, 10, 11]],
        [113, [8, 9, 11, 12]],
        [114, [10, 11, 13, 14]],
        [115, [11, 12, 14, 15]],
        [116, [13, 14, 16, 17]],
        [117, [14, 15, 17, 18]],
        [118, [16, 17, 19, 20]],
        [119, [17, 18, 20, 21]],
        [120, [19, 20, 22, 23]],
        [121, [20, 21, 23, 24]],
        [122, [22, 23, 25, 26]],
        [123, [23, 24, 26, 27]],
        [124, [25, 26, 28, 29]],
        [125, [26, 27, 29, 30]],
        [126, [28, 29, 31, 32]],
        [127, [29, 30, 32, 33]],
        [128, [31, 32, 34, 35]],
        [129, [32, 33, 35, 36]],
        [130, [0, 00, 1, 2, 3]],
        [131, [1, 2, 3, 4, 5, 6]],
        [132, [4, 5, 6, 7, 8, 9]],
        [133, [7, 8, 9, 10, 11, 12]],
        [134, [10, 11, 12, 13, 14, 15]],
        [135, [13, 14, 15, 16, 17, 18]],
        [136, [16, 17, 18, 19, 20, 21]],
        [137, [19, 20, 21, 22, 23, 24]],
        [138, [22, 23, 24, 25, 26, 27]],
        [139, [25, 26, 27, 28, 29, 30]],
        [140, [28, 29, 30, 31, 32, 33]],
        [141, [31, 32, 33, 34, 35, 36]],
        [142, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
        [143, [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]],
        [144, [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]],
        [145, [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]],
        [146, [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]],
        [147, [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]],
        [148, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]],
        [149, [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]],
        [150, [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]],
        [151, [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]],
        [152, [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]],
        [153, [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]],
    ],

    rouletteBetTime: [0, 0],
    roulettePlayers: [[], []],
    rouletteStatus: [0, 0],
    rouletteNum: [0, 0],
    rouletteSeatsPlayers: [[], []],

    init() {
        this.rouletteTables.forEach((tablet, idx) => {
            const shape = mp.colshapes.newSphere(tablet.x, tablet.y, tablet.z, 2.2, this.dimensionCasino);

            shape.onEnter = (player) => {
                if (player.vehicle) return;

                player.inRouletteTablet = idx;
                player.call("roulette_enter", [true, idx]);
            }

            shape.onExit = (player) => {
                player.inRouletteTablet = null;
                player.call("roulette_enter", [false]);
            }

            timer.addInterval(() => this.tableTimers(idx), 1000);
        });

        console.log(`[CASINO] Столы с рулеткой загружены (${this.rouletteTables.length} шт.)`);
    },

    async tableTimers(table) {
        if (timerProccesing[table]) return;
        timerProccesing[table] = true;

        const sleep = (ms) => new Promise(resolve => timer.add(resolve, ms));
        const tb = parseInt(table);

        if (this.rouletteBetTime[tb] != 0) {

            if (this.rouletteSeatsPlayers[tb].length != 0) {
                for (let i = 0; i < this.rouletteSeatsPlayers[tb].length; i++) {
                    const rec = this.rouletteSeatsPlayers[tb][i];
                    if (!mp.players.exists(rec)) continue;

                    this.updateCasinoTimeGUI(rec);
                }
            }

            this.rouletteBetTime[tb] -= 1;
            await sleep(1000);
            if (this.rouletteBetTime[tb] != 0) {
                timerProccesing[tb] = false;
                return;
            }
        }

        if (this.roulettePlayers[tb].length == 0 && this.rouletteBetTime[tb] == 0) {
            this.rouletteBetTime[tb] = 10;
            await sleep(1000);
            timerProccesing[tb] = false;
            return;
        }

        for (let i = 0; i < this.rouletteSeatsPlayers[tb].length; i++) {
            const rec = this.rouletteSeatsPlayers[tb][i];
            if (!mp.players.exists(rec)) continue;

            this.updateCasinoTimeGUI(this.rouletteSeatsPlayers[tb][i]);
        }

        this.rouletteStatus[tb] = 1;
        this.spin(tb);

        for (let i = 0; i < this.roulettePlayers[tb].length; i++) {
            const rec = this.roulettePlayers[tb][i];
            if (!mp.players.exists(rec)) continue;

            rec.call("start_roulette");
        }

        await sleep(25000);

        for (let i = 0; i < this.roulettePlayers[tb].length; i++) {
            const rec = this.roulettePlayers[tb][i];
            if (!mp.players.exists(rec)) continue;

            rec.call("stop_roulette");
        }

        mp.players.callInRange(this.rouletteTables[tb], 40, "clean_chips", [tb]);

        this.rouletteBets[tb].forEach(bet => {
            if (this.spots[bet.spot][1].includes(this.rouletteNum[tb])) {
                let mnoj = 2;

                if (bet.spot <= 37)
                    mnoj = 15;
                else if (bet.spot >= 38 && bet.spot <= 95)
                    mnoj = 7;
                else if (bet.spot >= 96 && bet.spot <= 107)
                    mnoj = 4;
                else if (bet.spot >= 108 && bet.spot <= 129)
                    mnoj = 3;
                else if (bet.spot >= 130)
                    mnoj = 2;

                bet.player.rl_win += bet.amount * mnoj;
            }
        });

        for (let i = 0; i < this.roulettePlayers[tb].length; i++) {
            const rec = this.roulettePlayers[tb][i];
            if (!mp.players.exists(rec)) continue;
            if (!rec.character) return;

            let winStr = "";
            if (this.rouletteNum[tb] == -1) winStr = "00";
            else winStr = this.rouletteNum[tb];

            if (this.roulettePlayers[tb][i].rl_win <= 0) notify.info(rec, `Выпало: ${winStr}. Ваши ставки проиграли`, "Рулетка");
            else {
                const prize = rec.rl_win;
                notify.info(rec, `Выпало: ${winStr}. Вы выиграли ${prize} фишек!`, "Рулетка");

                casino.addChips(rec, prize, 'Выигрыш в рулетке');
            }

            this.updateCasinoChipsGUI(rec);
            rec.rl_win = 0;
        }

        this.rouletteBets[tb] = [];
        this.roulettePlayers[tb] = [];
        this.rouletteStatus[tb] = 0;

        timerProccesing[tb] = false;
    },

    spin(table) {
        const numRnd = utils.randomInteger(-1, 36);
        this.rouletteNum[table] = numRnd;

        const num = this.rouletteNumbers.find(x => x[0] == numRnd);

        mp.players.callInRange(this.rouletteTables[table], 50, "spin_wheel", [table, 3, `exit_${num[1]}_wheel`, `exit_${num[1]}_ball`]);
    },

    roulette(player, tb) {
        player.rl_table = tb;
        player.rl_bet = 0;
        player.rl_setbet = this.rouletteTableBetMin[tb];

        this.rouletteSeatsPlayers[tb].push(player);
    },

    makeRouletteBet(player, spot) {
        if (this.rouletteStatus[player.rl_table] != 0) return;
        this.rlBet(player, spot, player.rl_setbet);
        player.call("setBetComplete");
    },

    rlBet(player, spot, chips) {
        if (!player.character) return;
        if (player.rl_table == null) return;
        const table = player.rl_table;

        if (this.rouletteStatus[table] != 0) {
            player.call('rouletteDenyBet');
            notify.error(player, "В данный момент нельзя сделать ставку", "Рулетка");
            return;
        }
        player.rl_win = 0;

        if (player.character.casinoChips < chips) {
            player.call('rouletteDenyBet');
            notify.error(player, "У Вас недостаточно фишек", "Рулетка");
            return;
        }
        if (!this.roulettePlayers[table].includes(player)) this.roulettePlayers[table].push(player);

        casino.removeChips(player, chips, 'Ставка в рулетке');

        this.rouletteBets[table].push({ player: player, amount: chips, spot: spot });
        notify.success(player, `Вы сделали ставку в размере ${chips} фишек`, "Рулетка");

        this.updateCasinoChipsGUI(player);
        player.call("bet_roulette", [table, spot]);
    },

    setBet(player, val) {
        if (player.rl_table == null) return;

        val = parseInt(val);
        if (val < this.rouletteTableBetMin[player.rl_table] || val > this.rouletteTableBetMax[player.rl_table]) return;

        player.rl_setbet = val;
    },

    getAllChips(player) {
        if (!player.character) return;
        return player.character.casinoChips;
    },

    seatAtRoulette(player, table) {
        if (player.rl_table != null) return notify.error(player, `Вы уже сидите за столом!`, "Рулетка");

        this.roulette(player, table);

        player.call("seat_to_roulette_table", [table]);
        player.call("client_casino_bet", ["open", this.rouletteTableBetMin[table], this.rouletteTableBetMax[table], this.getAllChips(player)]);
    },

    updateCasinoTimeGUI(player) {
        if (player.rl_table == null) return;
        const tb = player.rl_table;

        player.call("updateCasinoTime", [this.rouletteBetTime[tb]]);
    },

    updateCasinoChipsGUI(player) {
        if (player.rl_table == null) return;

        player.call("updateCasinoChips", [this.getAllChips(player)]);
    },

    exitRoulette(player) {
        if (player.rl_table == null) return;

        const tb = player.rl_table;
        if (this.roulettePlayers[tb].includes(player)) return;

        const idxSeatPlayer = this.rouletteSeatsPlayers[tb].findIndex(x => x == player);
        if (idxSeatPlayer == -1) return notify.error(player, `Вы не сидите за столом`, "Рулетка");

        this.rouletteSeatsPlayers[tb].splice(idxSeatPlayer, 1);

        player.call("exit_roulette");
        player.call("client_casino_bet", ["close"]);
        player.rl_table = null;
    },
};