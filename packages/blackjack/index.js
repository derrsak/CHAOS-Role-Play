const utils = call("utils");
const notifs = call("notifications");
const timer = call("timer");
const moneySystem = call("money");
const animations = call("animations");

class BJTableData {
    constructor() {
        this.Timer = null;
        this.State = 0;
        this.setState = 0;
        this.AdditionalState = 0;
        this.Value = 0;
        this.SlotIDReceive = 0;
        this.DealerFocus = null;
        this.DealerFocused = [];
        this.CardsGiven = [];
        this.StateInWork = false;
        this.CardInHand = "";
        this.CardSplitInHand = "";
        this.Count = 0;
        this.CountSplit = 0;
        this.Time = 15;
    }
}

class BlackjackDealerInfo {
    constructor() {
        this.Players = [];
        this.GamePlayers = [];
        this.Hand = [];
        this.Cards = [];
        this.Chairs = [];
        this.GameRunning = false;
    }
}

class BlackjackPlayerInfo {
    constructor(tableId, slotId) {
        this.Index = tableId;
        this.SlotId = slotId;
        this.Hand = [];
        this.SplitHand = [];
        this.Join = false;
        this.Rate = 0;
        this.Move = null;
        this.Doubled = false;
    }
}

const Log = { Write: text => console.log(`[BLACKJACK-SERVER_ERROR] ${text}`) };
const Tables = 8;
const BlackjackData = [];
const DealerData = {};
const PlayerData = {};

let DefaultDeck = [];
let BlackJackWorking = true;

module.exports = {
    init() { // +
        try {
            for (let i = 0; i !== Tables; i++) {
                BlackjackData.push(new BJTableData());
            }
            const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "jack", "queen", "king", "ace"];
            const suits = ["spd", "hrt", "dia", "club"];
            const _List = [];
            ranks.forEach((rank) => {
                suits.forEach((suit) => {
                    _List.push(`${suit}_${rank}`);
                });
            });
            DefaultDeck = _List;
        } catch (e) {
            Log.Write(`StartWork Exception: ${e.toString()}`);
        }
    },

    changeState: () => BlackJackWorking = !BlackJackWorking,

    BlackjackOpen: BlackjackOpen,
    SetBet: SetBet,
    OnPlayerDeath: OnPlayerDeath,
    Disconnect: Disconnect,
    BlackjackMove: BlackjackMove,
    BlackjackLeaveByPlayer: BlackjackLeaveByPlayer,
};

function GetDeck(index) {
    try {
        if (!DealerData.hasOwnProperty(index)) return;
        if (DefaultDeck.length === 0) {
            const ranks = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "jack", "queen", "king", "ace"];
            const suits = ["spd", "hrt", "dia", "club"];
            const _List = [];
            ranks.forEach((rank) => {
                suits.forEach((suit) => {
                    _List.push(`${suit}_${rank}`);
                });
            });
            DefaultDeck = _List;
        }
        DealerData[index].Cards = Shuffle([...DefaultDeck]);
    } catch (e) {
        Log.Write(`GetDeck Exception: ${e.toString()}`);
    }
}

function Shuffle(list) {
    try {
        let n = list.length;
        while (n > 1) {
            n--;
            const k = utils.randomInteger(0, n);
            const value = list[k];
            list[k] = list[n];
            list[n] = value;
        }
        return list;
    } catch (e) {
        Log.Write(`Shuffle Exception: ${e.toString()}`);
        return list;
    }
}

function takeCard(index) {
    try {
        if (!DealerData.hasOwnProperty(index)) return null;
        const List = DealerData[index].Cards;

        const card = List[0];
        List.shift();

        DealerData[index].Cards = List;
        return card;
    } catch (e) {
        Log.Write(`takeCard Exception: ${e.toString()}`);
        return null;
    }
}

function CardValue(card) {
    try {
        let rank = 10;
        for (let i = 2; i <= 11; i++) {
            if (card.includes(`${i}`)) {
                rank = i;
                break;
            }
        }
        if (card.includes("ace")) rank = 11;
        return rank;
    } catch (e) {
        Log.Write(`CardValue Exception: ${e.toString()}`);
        return 10;
    }
}

function handValue(List) {
    try {
        let tmpValue = 0;
        let numAces = 0;

        List.forEach((v) => {
            tmpValue += CardValue(v);
        });

        List.forEach((v) => {
            if (v.includes("ace")) numAces++;
        });

        if (tmpValue > 21) {
            for (let i = 0; i < numAces; i++) {
                tmpValue = tmpValue - 10;
            }
        }
        return tmpValue;
    } catch (e) {
        Log.Write(`handValue Exception: ${e.toString()}`);
        return 0;
    }
}

function AddDealerHand(index, card) {
    try {
        if (!DealerData.hasOwnProperty(index)) return 0;
        DealerData[index].Hand.push(card);
        return DealerData[index].Hand.length;
    } catch (e) {
        Log.Write(`AddDealerHand Exception: ${e.toString()}`);
        return 0;
    }
}

function DealerHandValue(index) {
    try {
        if (!DealerData.hasOwnProperty(index)) return 0;
        return handValue(DealerData[index].Hand);
    } catch (e) {
        Log.Write(`DealerHandValue Exception: ${e.toString()}`);
        return 0;
    }
}

function AddPlayerHand(player, card) {
    try {
        if (!player.character) return 0;
        else if (!PlayerData.hasOwnProperty(player.id)) return 0;
        PlayerData[player.id].Hand.push(card);
        return PlayerData[player.id].Hand.length;
    } catch (e) {
        Log.Write(`AddPlayerHand Exception: ${e.toString()}`);
        return 0;
    }
}

function AddPlayerSplitHand(player, card) {
    try {
        if (!player.character) return 0;
        else if (!PlayerData.hasOwnProperty(player.id)) return 0;
        PlayerData[player.id].SplitHand.push(card);
        return PlayerData[player.id].SplitHand.length;
    } catch (e) {
        Log.Write(`AddPlayerSplitHand Exception: ${e.toString()}`);
        return 0;
    }
}

function PlayerHandValue(player) {
    try {
        if (!player.character) return 0;
        else if (!PlayerData.hasOwnProperty(player.id)) return 0;
        return handValue(PlayerData[player.id].Hand);
    } catch (e) {
        Log.Write(`PlayerHandValue Exception: ${e.toString()}`);
        return 0;
    }
}

function PlayerSplitHandValue(player) {
    try {
        if (!player.character) return 0;
        else if (!PlayerData.hasOwnProperty(player.id)) return 0;
        return handValue(PlayerData[player.id].SplitHand);
    } catch (e) {
        Log.Write(`PlayerSplitHandValue Exception: ${e.toString()}`);
        return 0;
    }
}

function BlackjackOpen(player, Index, SlotId, PosX, PosY, PosZ, Rotation) {
    try {
        if (!player.character) return;
        if (!BlackJackWorking) return notifs.error(player, `В данный момент стол закрыт для игры`, 'Стол блэкджека');

        if (!DealerData.hasOwnProperty(Index)) DealerData[Index] = new BlackjackDealerInfo();
        if (!player.inCasino || player.getVariable('knocked') || player.cuffs || DealerData[Index].Players.includes(player)) return;

        if (player.character.cash < 500) return notifs.error(player, `У вас недостаточно наличных для этого стола`, 'Стол блэкджека');
        if (DealerData[Index].Chairs.includes(SlotId)) return notifs.error(player, `Это место занято`, 'Стол блэкджека');

        DealerData[Index].Chairs.push(SlotId);
        DealerData[Index].Players.push(player);
        player.position = new mp.Vector3(PosX, PosY, PosZ);
        player.heading = Rotation;

        mp.players.callInRange(new mp.Vector3(PosX, PosY, PosZ), 250, 'blackjack.setClientRotation', [player.id, Rotation]);
        animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", 'sit_enter_left', 1, 3);
        player.call("client.blackjack.character_occupy_place", [Index, SlotId, !DealerData[Index].GameRunning ? 1 : 0, 0]);

        const characterId = player.character.id;
        timer.add(() => {
            if (!mp.players.exists(player) || !player.character) {
                if (DealerData[Index].Chairs.includes(SlotId)) DealerData[Index].Chairs.splice(DealerData[Index].Chairs.indexOf(SlotId), 1);

                let index = -1;
                DealerData[Index].Players.forEach((rec, _index) => {
                    if (rec.character.id == characterId) index = _index;
                });
                if (index != -1) DealerData[Index].Players.splice(index, 1);
                return;
            }
            animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", 'idle_a', 1, 3);
            player.call("client.blackjack.PlayDealerSpeech", [Index, "MINIGAME_DEALER_GREET"]);

            if (PlayerData.hasOwnProperty(player.id)) delete PlayerData[player.id];
            PlayerData[player.id] = new BlackjackPlayerInfo(Index, SlotId);
        }, 4000);

    } catch (e) {
        Log.Write(`BlackjackOpen Exception: ${e.toString()}`);
    }
}

function PlayDealerAnim(Index, Position, animDict, anim) {
    try {
        mp.players.callInRange(Position, 250, 'client.blackjack.PlayDealerAnim', [Index, animDict, anim]);
    } catch (e) {
        Log.Write(`PlayDealerAnim Exception: ${e.toString()}`);
    }
}

function PlayDealerSpeech(Index, Position, speech) {
    try {
        mp.players.callInRange(Position, 250, 'client.blackjack.PlayDealerSpeech', [Index, speech]);
    } catch (e) {
        Log.Write(`PlayDealerSpeech Exception: ${e.toString()}`);
    }
}

function SetBet(player, money) {
    try {
        if (!player.character) return;
        if (!money) return;
        
        money = parseInt(money);
        if (isNaN(money)) return;
        if (!PlayerData.hasOwnProperty(player.id) || money < 5000) return;
        else if (player.character.cash < money) return notifs.error(player, `Недостаточно среств ($${money})`, 'Стол блэкджека');;

        if (!BlackJackWorking) return notifs.error(player, `В данный момент стол закрыт для игры`, 'Стол блэкджека');

        const bInfo = PlayerData[player.id];
        if (DealerData[bInfo.Index].GameRunning) return notifs.warning(player, `Игра уже идет, дождитесь окончания`, 'Стол блэкджека');

        notifs.success(player, `Ваша ставка принята`, 'Стол блэкджека');

        moneySystem.removeCash(player, money, (result) => {
            if (!result) return notifs.error(player, 'Ошибка финансовой операции');
        }, 'Покупка фишек в казино');
        
        bInfo.Join = true;
        bInfo.Rate = money;

        mp.players.callInRange(player.position, 250, 'client.blackjack.PlaceBetChip', [bInfo.Index, bInfo.SlotId, money, false, false]);
        animations.playAnimation(player, "anim_casino_b@amb@casino@games@blackjack@player", 'place_bet_small', 1, 3);

        timer.add(() => {
            if (!mp.players.exists(player)) return;
            animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", 'idle_var_01', 1, 3);
        }, 1000);

        if (!BlackjackData[bInfo.Index].Timer) {
            BlackjackData[bInfo.Index] = new BJTableData();

            const mypos = player.position;
            BlackjackData[bInfo.Index].Timer = timer.addInterval(() => {
                BlackJackGame(bInfo.Index, mypos);
            }, 1000);
        }
    } catch (e) {
        Log.Write(`SetBet Exception: ${e.toString()}`);
    }
}

function OnPlayerDeath(player) {
    try {
        if (!player.character) return;
        BlackjackLeave(player, false);
    } catch (e) {
        Log.Write(`OnPlayerDeath Exception: ${e.toString()}`);
    }
}

function Disconnect(player) {
    try {
        if (!player.character) return;
        BlackjackLeave(player, true);
    } catch (e) {
        Log.Write(`Disconnect Exception: ${e.toString()}`);
    }
}

function AnimationGameEnd(player, anim) {
    try {
        if (!mp.players.exists(player)) return;
        if (!player.character) return;

        const rand = utils.randomInteger(1, 4);
        animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", `reaction_${anim}_var_0${rand}`, 1, 3);

        timer.add(() => {
            if (!mp.players.exists(player)) return;
            animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", 'idle_var_01', 1, 3);
        }, 4000);
    } catch (e) {
        Log.Write(`AnimationGameEnd Exception: ${e.toString()}`);
    }
}

function BlackjackMove(player, move) {
    try {
        if (player.character && PlayerData.hasOwnProperty(player.id)) PlayerData[player.id].Move = move;
    } catch (e) {
        Log.Write(`BlackjackMove Exception: ${e.toString()}`);
    }
}

function BlackjackLeaveByPlayer(player) {
    try {
        if (player.character && PlayerData.hasOwnProperty(player.id)) {
            const bInfo = PlayerData[player.id];
            if (DealerData[bInfo.Index].GameRunning && bInfo.Rate >= 1) return;
            BlackjackLeave(player, false);
        }
    } catch (e) {
        Log.Write(`BlackjackLeave Exception: ${e.toString()}`);
    }
}

function BlackjackLeave(player, type) {
    try {
        if (!PlayerData.hasOwnProperty(player.id)) return;
        
        const bInfo = PlayerData[player.id];
        delete PlayerData[player.id];

        if (DealerData.hasOwnProperty(bInfo.Index)) {
            if (BlackjackData[bInfo.Index].DealerFocus === player) BlackjackData[bInfo.Index].DealerFocus = null;
            if (!type && !DealerData[bInfo.Index].GameRunning) moneySystem.addCash(player, bInfo.Rate, () => {}, 'Возврат фишек со стола блекджэка');
            if (DealerData[bInfo.Index].Chairs.includes(bInfo.SlotId)) DealerData[bInfo.Index].Chairs.splice(DealerData[bInfo.Index].Chairs.indexOf(bInfo.SlotId), 1);
            if (DealerData[bInfo.Index].Players.includes(player)) DealerData[bInfo.Index].Players.splice(DealerData[bInfo.Index].Players.indexOf(player), 1);
            
            mp.players.callInRange(player.position, 250, 'client.blackjack.RetrieveCards', [bInfo.Index, bInfo.SlotId]);
            if (DealerData[bInfo.Index].GamePlayers.includes(player)) DealerData[bInfo.Index].GamePlayers.splice(DealerData[bInfo.Index].GamePlayers.indexOf(player), 1);
            
            if ((DealerData[bInfo.Index].GameRunning && DealerData[bInfo.Index].GamePlayers.length === 0) || (!DealerData[bInfo.Index].GameRunning && DealerData[bInfo.Index].Players.length === 0)) {
                mp.players.callInRange(player.position, 250, 'client.blackjack.RetrieveCards', [bInfo.Index, 0]);
                
                DealerData[bInfo.Index].Hand = [];
                DealerData[bInfo.Index].Cards = [];
                DealerData[bInfo.Index].GameRunning = false;
                BlackjackData[bInfo.Index].DealerFocus = null;

                if (BlackjackData[bInfo.Index].Timer) {
                    timer.remove(BlackjackData[bInfo.Index].Timer);
                    BlackjackData[bInfo.Index].Timer = null;
                }
            }
        }

        if (!type) {
            player.call("client.blackjack.betWin", [0]);
            animations.playAnimation(player, "anim_casino_b@amb@casino@games@shared@player@", 'sit_exit_left', 1, 39);

            player.call("client.blackjack.PlayDealerSpeech", [bInfo.Index, "MINIGAME_DEALER_LEAVE_NEUTRAL_GAME"]);
            player.call("client.blackjack.successLeave");

            timer.add(() => {
                if (!mp.players.exists(player)) return;
                animations.stopAnimation(player);
            }, 4000);
        }
    } catch (e) {
        Log.Write(`BlackjackLeave Exception: ${e.toString()}`);
    }
}

function BlackJackGame(Index, Position) {
    try {
        if (Index + 1 > Tables) return;

        const Table = BlackjackData[Index];
        if (Table.StateInWork) return;

        switch (Table.State) {
            case 0: // Время после первой ставки и до начала раздачи карт
                GetTableState_0(Index, Table);
                break;
            case 1: // Раздача первых карт всем игрокам за столом
                GetTableState_1(Index, Table, Position);
                break;
            case 2: // Раздача вторых карт всем игрокам за столом
                GetTableState_2(Index, Table, Position);
                break;
            case 3: // Небольшой интерактив, если у дилера карта 10 или 11, то он проверяет свою первую карту
                GetTableState_3(Index, Table, Position);
                break;
            case 4: // Начинаем взаимодействие с игроками, фокусируемся на одном из них
                GetTableState_4(Index, Table, Position);
                break;
            case 5: // Получаем решение игрока, на котором мы фокусируемся
                GetTableState_5(Index, Table, Position);
                break;
            case 6: // Дилер работает со своими картами
                GetTableState_6(Index, Table, Position);
                break;
            case 7: // Работаем по каждому игроку, который есть за столом отдельно
                GetTableState_7(Index, Table, Position);
                break;
            case 8: // Забираем карты у игрока и выдаем выигрышь
                GetTableState_8(Index, Table, Position);
                break;
            case 9: // Работаем с первой рукой сплит-системы
                GetTableState_9(Index, Table, Position);
                break;
            case 10: // Работаем со второй рукой сплит-системы
                GetTableState_10(Index, Table, Position);
                break;
            default:
                // Not supposed to end up here. 
                break;
        }
    } catch (e) {
        Log.Write(`BlackJackGame Exception: ${e.toString()}`);
    }
}

function GetTableState_0(Index, Table) { // Время после первой ставки и до начала раздачи карт
    Table.StateInWork = true;
    if (--Table.Time > 0) {
        for (let foreachPlayer of DealerData[Index].Players) {
            if (!mp.players.exists(foreachPlayer)) continue;
            if (!foreachPlayer.character) continue;

            if (PlayerData.hasOwnProperty(foreachPlayer.id) && PlayerData[foreachPlayer.id].Join) {
                foreachPlayer.call("client.blackjack.SyncTimer", [Table.Time]);

                if (Table.Time === 1) {
                    foreachPlayer.call("client.blackjack.ExitBtn", [0]);
                    foreachPlayer.call("client.blackjack.RetrieveCards", [Index, 0]);
                }
            }
        }
    }
    else if (Table.Time === 0) {
        DealerData[Index].GamePlayers = [];

        for (let foreachPlayer of DealerData[Index].Players) {
            if (!mp.players.exists(foreachPlayer)) continue;
            if (!foreachPlayer.character) continue;

            if (PlayerData.hasOwnProperty(foreachPlayer.id)) {
                foreachPlayer.call("client.blackjack.betWin", [0]);
                foreachPlayer.call("client.blackjack.SyncTimer", [0]);
                if (PlayerData[foreachPlayer.id].Join && !DealerData[Index].GamePlayers.includes(foreachPlayer)) DealerData[Index].GamePlayers.push(foreachPlayer);
            }
        }

        if (DealerData[Index].GamePlayers.length === 0) {
            DealerData[Index].Hand = [];
            DealerData[Index].Cards = [];
            DealerData[Index].GameRunning = false;
            BlackjackData[Index].DealerFocus = null;

            if (BlackjackData[Index].Timer) {
                timer.remove(BlackjackData[Index].Timer);
                BlackjackData[Index].Timer = null;
            }
            Table.StateInWork = false;
            return;
        }

        Table.AdditionalState = 0;
        Table.State = 1;
        Table.Time = 0;
        DealerData[Index].GameRunning = true;
    }
    Table.StateInWork = false;  
}

function GetTableState_1(Index, Table, Position) {
    Table.StateInWork = true;
    if (Table.Time > 0) {
        Table.Time--;
    }
    else if (Table.Time === 0) {
        switch (Table.AdditionalState) {
            case 0:
                GetDeck(Index);
                Table.CardInHand = takeCard(Index);
                Table.Count = AddDealerHand(Index, Table.CardInHand);

                mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, 0, Table.Count - 1, Table.CardInHand, (Table.Count === 1)]);
                PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "deal_card_self");

                Table.Time = 1;
                Table.AdditionalState = 1;
                break;
            default:
                let givecard = false;

                for (let foreachPlayer of DealerData[Index].GamePlayers) {
                    if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id) && !Table.CardsGiven.includes(foreachPlayer)) {
                        givecard = true;
                        Table.CardsGiven.push(foreachPlayer);

                        const bInfo = PlayerData[foreachPlayer.id];
                        Table.CardInHand = takeCard(Index);
                        Table.Count = AddPlayerHand(foreachPlayer, Table.CardInHand);

                        mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `deal_card_player_0${bInfo.SlotId}`);
                        PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerHandValue(foreachPlayer)}`);
                        Table.Time = 1;
                        break;
                    }
                }

                if (!givecard) {
                    Table.CardsGiven = [];
                    Table.State = 2;
                    Table.Time = 0;
                    Table.AdditionalState = 0;
                }
                break;
        }
    }
    Table.StateInWork = false;
}

function GetTableState_2(Index, Table, Position) {
    Table.StateInWork = true;
    if (Table.Time > 0) {
        Table.Time--;
    }
    else if (Table.Time === 0) {
        switch (Table.AdditionalState) {
            case 0:
                Table.CardInHand = takeCard(Index);
                Table.Count = AddDealerHand(Index, Table.CardInHand);

                mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, 0, Table.Count - 1, Table.CardInHand, (Table.Count === 1)]);
                PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "deal_card_self_second_card");

                if (Table.Count > 1) PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${CardValue(Table.CardInHand)}`);
                Table.Time = 1;
                Table.AdditionalState = 1;
                break;
            default:
                let givecard = false;

                for (let foreachPlayer of DealerData[Index].GamePlayers) {
                    if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id) && !Table.CardsGiven.includes(foreachPlayer)) {
                        givecard = true;
                        Table.CardsGiven.push(foreachPlayer);

                        const bInfo = PlayerData[foreachPlayer.id];
                        Table.CardInHand = takeCard(Index);
                        Table.Count = AddPlayerHand(foreachPlayer, Table.CardInHand);

                        mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `deal_card_player_0${bInfo.SlotId}`);
                        PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerHandValue(foreachPlayer)}`);
                        Table.Time = 1;
                        break;
                    }
                }

                if (!givecard) {
                    Table.CardsGiven = [];
                    Table.State = 3;
                    Table.AdditionalState = 0;
                }
                break;
        }
    }
    Table.StateInWork = false;
}

function GetTableState_3(Index, Table, Position) {
    Table.StateInWork = true;

    PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "check_card");
    mp.players.callInRange(Position, 250, 'client.blackjack.DealerTurnOverCard', [Index, false]);

    Table.Time = 1;
    Table.State = 4;
    Table.StateInWork = false;
}

function GetTableState_4(Index, Table, Position) {
    Table.StateInWork = true;
    if (Table.Time > 0) {
        Table.Time--;
    }
    else if (Table.Time === 0) {
        Table.DealerFocus = null;
        let target = null;

        for (let foreachPlayer of DealerData[Index].GamePlayers) {
            if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id) && !Table.DealerFocused.includes(foreachPlayer)) {
                if (PlayerHandValue(foreachPlayer) < 21) {
                    target = foreachPlayer;
                    break;
                }
                else if (!Table.DealerFocused.includes(foreachPlayer)) {
                    Table.DealerFocused.push(foreachPlayer);
                }
            }
        }

        if (target === null) {
            Table.DealerFocus = null;
            Table.State = 6;
            Table.StateInWork = false;
            return;
        }

        Table.DealerFocus = target;
        Table.DealerFocused.push(target);
        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `dealer_focus_player_0${PlayerData[target.id].SlotId}_idle_intro`);
        Table.Time = 1;
        Table.State = 5;
    }
    Table.StateInWork = false;
}

function GetTableState_5(Index, Table, Position) {
    Table.StateInWork = true;
    switch (Table.AdditionalState) {
        case 0:
            if (Table.DealerFocus === null || !mp.players.exists(Table.DealerFocus) || !Table.DealerFocus.character || !PlayerData.hasOwnProperty(Table.DealerFocus.id)) {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }

            PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_ANOTHER_CARD");
            Table.DealerFocus.call("client.blackjack.isBtn", [0, 1])
            Table.AdditionalState = 1;
            Table.Time = 15;
            break;
        case 1:
            if (Table.DealerFocus !== null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {

                    const bInfo = PlayerData[Table.DealerFocus.id];
                    if (bInfo.Join && bInfo.Hand.length < 5) {
                        if (bInfo.Move === null) {

                            if (Table.Time > 0) Table.Time--;
                            else if (Table.Time === 0) {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                                Table.Time = 0;
                                Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                            }
                            else if (Table.Time === 5) PlayDealerSpeech(Index, Position, "MINIGAME_DEALER_COMMENT_SLOW");
                            Table.DealerFocus.call("client.blackjack.SyncTimer", [Table.Time]);
                        }
                        else if (bInfo.Move === "stand") {
                            Table.State = 4;
                            Table.AdditionalState = 0;
                            Table.Time = 0;
                        }
                        else if (bInfo.Move === "hit") {
                            bInfo.Move = null;
                            Table.CardInHand = takeCard(Index);
                            Table.Count = AddPlayerHand(Table.DealerFocus, Table.CardInHand);

                            mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                            PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `hit_card_player_0${bInfo.SlotId}`);
                            PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerHandValue(Table.DealerFocus)}`);
                            Table.Time = 1;

                            if (bInfo.Hand.length < 5 && PlayerHandValue(Table.DealerFocus) < 21 && !bInfo.Doubled) Table.AdditionalState = 2;
                            else {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                            }
                        }
                        else if (bInfo.Move === "double") {
                            bInfo.Move = null;

                            if (Table.DealerFocus.character.cash < bInfo.Rate) {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                                Table.Time = 0;
                            }
                            else {
                                moneySystem.removeCash(Table.DealerFocus, bInfo.Rate, () => {}, "Блекджек. Ставка double");
                                bInfo.Rate = bInfo.Rate * 2;

                                mp.players.callInRange(Position, 250, 'client.blackjack.PlaceBetChip', [bInfo.Index, bInfo.SlotId, bInfo.Rate, true, false]);
                                bInfo.Doubled = true;
                                Table.CardInHand = takeCard(Index);
                                Table.Count = AddPlayerHand(Table.DealerFocus, Table.CardInHand);

                                mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                                PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `hit_card_player_0${bInfo.SlotId}`);
                                PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerHandValue(Table.DealerFocus)}`);

                                Table.Time = 1;
                                Table.State = 4;
                                Table.AdditionalState = 0;
                            }
                        }
                        else if (bInfo.Move === "split") {
                            bInfo.Move = null;

                            if (Table.DealerFocus.character.cash < bInfo.Rate) {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                                Table.Time = 0;
                            }
                            else {
                                moneySystem.removeCash(Table.DealerFocus, bInfo.Rate, () => {}, "Блекджек. Ставка split");
                                bInfo.Rate = bInfo.Rate * 2;

                                mp.players.callInRange(Position, 250, 'client.blackjack.PlaceBetChip', [bInfo.Index, bInfo.SlotId, bInfo.Rate, false, true]);
                                PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `split_card_player_0${bInfo.SlotId}`);

                                bInfo.SplitHand.push(bInfo.Hand[bInfo.Hand.length - 1]);
                                bInfo.Hand.pop();
                                Table.Time = 0;
                                Table.AdditionalState = 3;
                            }
                        }
                        else {
                            bInfo.Move = null;
                            Table.AdditionalState = 0;
                            Table.State = 4;
                            Table.Time = 0;
                            Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                        }
                    }
                    else {
                        Table.State = 4;
                        Table.Time = 0;
                        Table.StateInWork = false;
                        return;
                    }
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 2:
            if (Table.Time > 0) Table.Time--;
            else if (Table.Time === 0) Table.AdditionalState = 0;
            break;
        case 3: // Выдаем к
            if (Table.DealerFocus != null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    mp.players.callInRange(Position, 250, 'client.blackjack.SplitHand', [Index, bInfo.SlotId, bInfo.SplitHand.length - 1]);
                    Table.Time = 0;
                    Table.AdditionalState = 9;
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 4: // Пережидаем анимацию дилера
            if (Table.DealerFocus != null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    Table.CardInHand = takeCard(Index);
                    Table.Count = AddPlayerHand(Table.DealerFocus, Table.CardInHand);

                    mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                    PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "hit_card_player_0" + bInfo.SlotId);
                    PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_" + PlayerHandValue(Table.DealerFocus));
                    Table.Time = 1;
                    Table.AdditionalState = 5;
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 5: // Пережидаем анимацию дилера
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 6;
            }
            break;
        case 6: // Пережидаем анимацию дилера
            if (Table.DealerFocus != null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    Table.CardSplitInHand = takeCard(Index);
                    Table.CountSplit = AddPlayerSplitHand(Table.DealerFocus, Table.CardSplitInHand);
                    
                    mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.CountSplit - 1, Table.CardSplitInHand, false, true]);
                    PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "hit_second_card_player_0" + bInfo.SlotId);
                    PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_" + PlayerSplitHandValue(Table.DealerFocus));
                    Table.AdditionalState = 8;
                    Table.Time = 1;
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 7: // Раздали в сплит 2 карты и начинаем новое действие
            if (Table.DealerFocus != null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    Table.AdditionalState = 0;

                    if (bInfo.Hand.length < 5 && PlayerHandValue(Table.DealerFocus) < 21) {
                        PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_ANOTHER_CARD");
                        Table.State = 9; // Если меньше 5 карт и общее число меньше 21
                        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "dealer_focus_player_0" + bInfo.SlotId + "_idle");
                    }
                    else if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                        PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_ANOTHER_CARD");
                        Table.State = 10; // Если меньше 5 карт и общее число меньше 21
                        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "dealer_focus_player_0" + bInfo.SlotId + "_idle_split");
                    }
                    else {
                        Table.State = 4;
                    }
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 8:
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 7;
            }
            break;
        case 9:
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 4;
            }
            break;
        default:
            // Not supposed to end up here.
            break;
        
    }
    Table.StateInWork = false;
}

function GetTableState_6(Index, Table, Position) {
    Table.StateInWork = true;
    switch (Table.AdditionalState) {
        case 0:
            PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "turn_card");
            mp.players.callInRange(Position, 250, 'client.blackjack.DealerTurnOverCard', [Index]);
            Table.Time = 1;
            Table.AdditionalState = 1;
            break;
        case 1: // Дилер набирает карты до тех пор, пока не получит число 17 или выше
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.Value = DealerHandValue(Index);
                PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_" + Table.Value);

                if (Table.Value < 17) {
                    Table.CardInHand = takeCard(Index);
                    Table.Count = AddDealerHand(Index, Table.CardInHand);

                    mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, 0, Table.Count - 1, Table.CardInHand, Table.Count === 1]);
                    PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "deal_card_self_second_card");
                    Table.Time = 1;
                }
                else {
                    Table.AdditionalState = 0;
                    Table.State = 7;
                }
            }
            break;
        default:
            // Not supposed to end up here.
            break;
    }
    Table.StateInWork = false;
}

function GetTableState_7(Index, Table, Position) {
    Table.StateInWork = true;
    if (Table.AdditionalState === 0 && DealerHandValue(Index) > 21) {
        Table.AdditionalState = 1;
        PlayDealerSpeech(Index, Position, "MINIGAME_DEALER_BUSTS");
    }
    Table.DealerFocus = null;

    let winner = null;
    DealerData[Index].GamePlayers.forEach((foreachPlayer) => {
        if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id) && PlayerData[foreachPlayer.id].Join && Table.DealerFocused.includes(foreachPlayer)) {
            winner = foreachPlayer;
        }
    });

    if (winner === null) {
        // Все игроки за столом получили призы, очищаем стол дилера и игру
        DealerData[Index].GamePlayers.forEach((foreachPlayer) => {
            if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id)) {
                const bInfo = PlayerData[foreachPlayer.id];
                bInfo.Join = false;
                bInfo.Rate = 0;
                bInfo.Doubled = false;
                bInfo.Move = null;
                bInfo.Hand = [];
                bInfo.SplitHand = [];
                // Trigger.ClientEvent(target, "client.blackjack.ExitBtn", 1);
            }
        });
        mp.players.callInRange(Position, 250, 'client.blackjack.RetrieveCards', [Index, 0]);

        DealerData[Index].Players.forEach((foreachPlayer) => {
            if (mp.players.exists(foreachPlayer) && foreachPlayer.character && PlayerData.hasOwnProperty(foreachPlayer.id)) {
                foreachPlayer.call("client.blackjack.isBtn", [1, 0]);
                foreachPlayer.call("client.blackjack.ExitBtn", [1]);
            }
        });

        PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", "retrieve_own_cards_and_remove");
        DealerData[Index].Hand = [];
        DealerData[Index].Cards = [];
        DealerData[Index].GamePlayers = [];
        DealerData[Index].GameRunning = false;
        BlackjackData[Index].DealerFocus = null;

        if (BlackjackData[Index].Timer !== null) {
            timer.remove(BlackjackData[Index].Timer);
            BlackjackData[Index].Timer = null;
        }
        Table.StateInWork = false;
        return;
    }

    Table.DealerFocus = winner;
    Table.State = 8;
    Table.AdditionalState = 0;
    Table.StateInWork = false;
}

function GetTableState_8(Index, Table, Position) {
    Table.StateInWork = true;
    switch (Table.AdditionalState) {
        case 0:
            if (Table.DealerFocus !== null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && PlayerData[Table.DealerFocus.id].Join) {
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    let pHandValue;
                    let wincount = 0;
                    let rounded = 0;

                    if (bInfo.SplitHand.length > 0) {
                        bInfo.Rate /= 2;
                        pHandValue = PlayerSplitHandValue(Table.DealerFocus);

                        if (pHandValue <= 21) {
                            if (pHandValue === 21) {
                                if (bInfo.SplitHand.length === 2) { // BlackJack
                                    rounded = Math.round(bInfo.Rate * 2.5);
                                    wincount += rounded;
                                    moneySystem.addCash(Table.DealerFocus, rounded, () => {}, "Блекджек. Выигрыш в ставке split bj");
                                }
                                else {
                                    wincount += bInfo.Rate * 2;
                                    moneySystem.addCash(Table.DealerFocus, bInfo.Rate * 2, () => {}, "Блекджек. Выигрыш в ставке split");
                                }
                            }
                            else {
                                if (pHandValue === Table.Value) {
                                    wincount += bInfo.Rate;
                                    moneySystem.addCash(Table.DealerFocus, bInfo.Rate, () => {}, "Блекджек. Возврат в ставке split");
                                }
                                else if (pHandValue > Table.Value || Table.Value > 21) {
                                    wincount += bInfo.Rate * 2;
                                    moneySystem.addCash(Table.DealerFocus, bInfo.Rate * 2, () => {}, "Блекджек. Выигрыш в ставке split");
                                }
                            }
                        }
                    }

                    pHandValue = PlayerHandValue(Table.DealerFocus);
                    if (pHandValue <= 21) {
                        if (pHandValue === 21) {
                            if (bInfo.Hand.length === 2) { // BlackJack
                                rounded = Math.round(bInfo.Rate * 2.5);
                                wincount += rounded;
                                moneySystem.addCash(Table.DealerFocus, rounded, () => {}, "Блекджек. Выигрыш BJ");
                                AnimationGameEnd(Table.DealerFocus, "good");
                            }
                            else {
                                wincount += bInfo.Rate * 2;
                                moneySystem.addCash(Table.DealerFocus, bInfo.Rate * 2, () => {}, "Блекджек. Выигрыш BJ");
                                AnimationGameEnd(Table.DealerFocus, "impartial");
                            }
                        }
                        else {
                            if (Table.Value === 21 || (Table.Value < 21 && Table.Value > pHandValue)) {
                                AnimationGameEnd(Table.DealerFocus, "bad");
                            }
                            else if (pHandValue === Table.Value) {
                                wincount += bInfo.Rate;
                                moneySystem.addCash(Table.DealerFocus, bInfo.Rate, () => {}, "Блекджек. Возврат ставки");
                                AnimationGameEnd(Table.DealerFocus, "impartial");
                            }
                            else if (pHandValue > Table.Value || Table.Value > 21) {
                                wincount += bInfo.Rate * 2;
                                moneySystem.addCash(Table.DealerFocus, bInfo.Rate * 2, () => {}, "Блекджек. Выигрыш BJ");
                                AnimationGameEnd(Table.DealerFocus, "good");
                            }
                        }
                    }
                    else {
                        AnimationGameEnd(Table.DealerFocus, "bad");
                    }

                    bInfo.Join = false;
                    if (wincount > 0) {
                        Table.DealerFocus.call("client.blackjack.betWin", [wincount]);
                    }

                    Table.SlotIDReceive = bInfo.SlotId;
                    PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `retrieve_cards_player_0${Table.SlotIDReceive}`);
                }
                else {
                    Table.State = 7;
                    Table.AdditionalState = 1;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 7;
                Table.AdditionalState = 1;
                Table.StateInWork = false;
                return;
            }
            Table.AdditionalState = 1;
            break;
        case 1: // Забираем карты со стола игрока и переходим к следующему игроку
            mp.players.callInRange(Position, 250, 'client.blackjack.RetrieveCards', [Index, Table.SlotIDReceive]);
            Table.State = 7;
            Table.AdditionalState = 1;
            break;
        default:
            // Not supposed to end up here.
            break;
    }
    Table.StateInWork = false;
}

function GetTableState_9(Index, Table, Position) {
    Table.StateInWork = true;
    switch (Table.AdditionalState) {
        case 0: // Начинаем обработку первого решения игрока
            if (Table.DealerFocus === null || !mp.players.exists(Table.DealerFocus) || !Table.DealerFocus.character || !PlayerData.hasOwnProperty(Table.DealerFocus.id)) {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }

            PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_ANOTHER_CARD");
            Table.DealerFocus.call("client.blackjack.isBtn", [0, 1]);
            Table.AdditionalState = 1;
            Table.Time = 15;
            break;
        case 1: // Обрабатываем первое решение игрока
            if (Table.DealerFocus !== null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    if (bInfo.Join && bInfo.Hand.length < 5) {
                        if (bInfo.Move === null) {

                            if (Table.Time > 0) {
                                Table.Time--;
                            }
                            else if (Table.Time === 0) {
                                Table.AdditionalState = 0;

                                if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                                    Table.State = 10;
                                }
                                else {
                                    Table.State = 4;
                                    Table.Time = 0;
                                }

                                Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                            }
                            else if (Table.Time === 5) {
                                PlayDealerSpeech(Index, Position, "MINIGAME_DEALER_COMMENT_SLOW");
                            }

                            Table.DealerFocus.call("client.blackjack.SyncTimer", [Table.Time]);
                        }
                        else if (bInfo.Move === "stand") {
                            bInfo.Move = null;
                            Table.AdditionalState = 0;

                            if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                                Table.State = 10;
                            }
                            else {
                                Table.State = 4;
                                Table.Time = 0;
                            }

                        }
                        else if (bInfo.Move === "hit") {
                            bInfo.Move = null;
                            Table.CardInHand = takeCard(Index);
                            Table.Count = AddPlayerHand(Table.DealerFocus, Table.CardInHand);

                            mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.Count - 1, Table.CardInHand]);
                            PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `hit_card_player_0${bInfo.SlotId}`);
                            PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerHandValue(Table.DealerFocus)}`);
                            Table.Time = 1;

                            if (bInfo.Hand.length < 5 && PlayerHandValue(Table.DealerFocus) < 21) {
                                Table.AdditionalState = 2;
                            }
                            else {
                                if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                                    Table.AdditionalState = 3;
                                }
                                else {
                                    Table.AdditionalState = 0;
                                    Table.State = 4;
                                }
                            }
                        }
                        else {
                            bInfo.Move = null;
                            Table.AdditionalState = 0;

                            if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                                Table.State = 10;
                            }
                            else {
                                Table.State = 4;
                                Table.Time = 0;
                            }

                            Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                        }
                    }
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 2: // Пережидаем анимацию дилера
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 0;
            }
            break;
        case 3: // Пережидаем анимацию дилера
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 0;
                Table.State = 10;
            }
            break;
        default:
            // Not supposed to end up here.
            break;
    }
    Table.StateInWork = false;
}

function GetTableState_10(Index, Table, Position) {
    Table.StateInWork = true;
    switch (Table.AdditionalState) {
        case 0: // Начинаем обработку первого решения игрока
            if (Table.DealerFocus === null || !mp.players.exists(Table.DealerFocus) || !Table.DealerFocus.character || !PlayerData.hasOwnProperty(Table.DealerFocus.id)) {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }

            Table.DealerFocus.call("client.blackjack.isBtn", [0, 1]);
            PlayDealerSpeech(Index, Position, "MINIGAME_BJACK_DEALER_ANOTHER_CARD");
            PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `dealer_focus_player_0${PlayerData[Table.DealerFocus.id].SlotId}_idle_split`);
            
            Table.AdditionalState = 1;
            Table.Time = 15;
            break;
        case 1: // Обрабатываем первое решение игрока
            if (Table.DealerFocus !== null) {
                if (mp.players.exists(Table.DealerFocus) && Table.DealerFocus.character && PlayerData.hasOwnProperty(Table.DealerFocus.id) && Table.DealerFocused.includes(Table.DealerFocus)) {
                    
                    const bInfo = PlayerData[Table.DealerFocus.id];
                    if (bInfo.Join && bInfo.SplitHand.length < 5) {
                        if (bInfo.Move === null) {
                            
                            if (Table.Time > 0) {
                                Table.Time--;
                            }
                            else if (Table.Time === 0) {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                                Table.Time = 0;
                                Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                            }
                            else if (Table.Time === 5) {
                                PlayDealerSpeech(Index, Position, "MINIGAME_DEALER_COMMENT_SLOW");
                            }

                            Table.DealerFocus.call("client.blackjack.SyncTimer", [Table.Time]);
                        }
                        else if (bInfo.Move === "stand") {
                            bInfo.Move = null;
                            Table.State = 4;
                            Table.AdditionalState = 0;
                            Table.Time = 0;
                        }
                        else if (bInfo.Move === "hit") {
                            bInfo.Move = null;
                            Table.CardSplitInHand = takeCard(Index);
                            Table.CountSplit = AddPlayerSplitHand(Table.DealerFocus, Table.CardSplitInHand);
                            
                            mp.players.callInRange(Position, 250, 'client.blackjack.GiveCard', [Index, bInfo.SlotId, Table.CountSplit - 1, Table.CardSplitInHand, false, true]);
                            PlayDealerAnim(Index, Position, "anim_casino_b@amb@casino@games@blackjack@dealer", `hit_second_card_player_0${bInfo.SlotId}`);
                            PlayDealerSpeech(Index, Position, `MINIGAME_BJACK_DEALER_${PlayerSplitHandValue(Table.DealerFocus)}`);
                            Table.Time = 1;

                            if (bInfo.SplitHand.length < 5 && PlayerSplitHandValue(Table.DealerFocus) < 21) {
                                Table.AdditionalState = 2;
                            }
                            else {
                                Table.State = 4;
                                Table.AdditionalState = 0;
                            }
                        }
                        else {
                            bInfo.Move = null;
                            Table.AdditionalState = 0;
                            Table.State = 4;
                            Table.Time = 0;
                            Table.DealerFocus.call("client.blackjack.isBtn", [0, 0]);
                        }
                    }
                }
                else {
                    Table.State = 4;
                    Table.Time = 0;
                    Table.StateInWork = false;
                    return;
                }
            }
            else {
                Table.State = 4;
                Table.Time = 0;
                Table.StateInWork = false;
                return;
            }
            break;
        case 2: // Пережидаем анимацию дилера
            if (Table.Time > 0) {
                Table.Time--;
            }
            else if (Table.Time === 0) {
                Table.AdditionalState = 0;
            }
            break;
        default:
            // Not supposed to end up here.
            break;
    }
    Table.StateInWork = false;
}