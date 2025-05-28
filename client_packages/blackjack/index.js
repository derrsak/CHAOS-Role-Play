/** Данные о столах */
const blackjackTables = [
    ["vw_prop_casino_blckjack_01", 1148.837, 269.747, -52.84094, -134.69],
    ["vw_prop_casino_blckjack_01", 1151.84, 266.747, -52.84094, 45.31],
    ["vw_prop_casino_blckjack_01b", 1129.406, 262.3578, -52.041, 135.31],
    ["vw_prop_casino_blckjack_01b", 1144.429, 247.3352, -52.041, 135.31],    
    ["vw_prop_casino_blckjack_01", 1146.329, 261.2543, -52.84094, 45.31],
    ["vw_prop_casino_blckjack_01", 1143.338, 264.2453, -52.84094, -134.69],    
    ["vw_prop_casino_blckjack_01b", 1133.74, 266.6947, -52.04094, -45],
    ["vw_prop_casino_blckjack_01b", 1148.74, 251.6947, -52.04094, -45]
];

/** Корректировка координат для того, чтобы персонаж садился за одно из четырех стульев */
const correctionPosCharacterForSeatInTableToBlackjack = [
	[1.55, -0.35, 1, 67],
	[0.475, -1.2, 1, 22],
	[-0.8, -1.05, 1, -22],
	[-1.55, 0.05, 1, -67]
];

const cardOffsetsDealer = [
	new mp.Vector3(0.0436, 0.21205, 0.948875),
	new mp.Vector3(-0.0636, 0.213825, 0.9496),
	new mp.Vector3(-0.0806, 0.2137, 0.950225),
	new mp.Vector3(-0.1006, 0.21125, 0.950875),
	new mp.Vector3(-0.1256, 0.21505, 0.951875),
	new mp.Vector3(-0.1416, 0.21305, 0.953),
	new mp.Vector3(-0.1656, 0.21205, 0.954025),
	new mp.Vector3(-0.1836, 0.21255, 0.95495),
	new mp.Vector3(-0.2076, 0.21105, 0.956025),
	new mp.Vector3(-0.2246, 0.21305, 0.957),
]

const cardSplitRotationOffsets = {
	1: [
	 	68.57,
	 	67.52,
	 	67.76,
	 	67.04,
	 	68.84,
	 	65.96,
	 	67.76,
    ],
	2: [
		22.11,
		22.0,
		24.44,
		21.08,
		25.96,
		26.16,
		28.76,
    ],
	3: [
		-14.04,
		-15.48,
		-16.56,
		-15.84,
		-16.92,
		-14.4,
		-14.28,
    ],
	4: [
		-67.03,
		-67.6,
		-69.4,
		-69.04,
		-68.68,
		-66.16,
		-63.28,
    ],
}

const cardSplitOffsets = {
	1: [
		new mp.Vector3(0.6083, 0.3523, 0.94795),
		new mp.Vector3(0.598475, 0.366475, 0.948925),
		new mp.Vector3(0.589525, 0.3807, 0.94975),
		new mp.Vector3(0.58045, 0.39435, 0.950375),
		new mp.Vector3(0.571975, 0.4092, 0.951075),
		new mp.Vector3(0.5614, 0.4237, 0.951775),
		new mp.Vector3(0.554325, 0.4402, 0.952525),
	],
	2: [
		new mp.Vector3(0.3431, -0.0527, 0.94855),
		new mp.Vector3(0.348575, -0.0348, 0.949425),
		new mp.Vector3(0.35465, -0.018825, 0.9502),
		new mp.Vector3(0.3581, -0.001625, 0.95115),
		new mp.Vector3(0.36515, 0.015275, 0.952075),
		new mp.Vector3(0.368525, 0.032475, 0.95335),
		new mp.Vector3(0.373275, 0.0506, 0.9543),
	],
	3: [
		new mp.Vector3(-0.116, -0.1501, 0.947875),
		new mp.Vector3(-0.102725, -0.13795, 0.948525),
		new mp.Vector3(-0.08975, -0.12665, 0.949175),
		new mp.Vector3(-0.075025, -0.1159, 0.949875),
		new mp.Vector3(-0.0614, -0.104775, 0.9507),
		new mp.Vector3(-0.046275, -0.095025, 0.9516),
		new mp.Vector3(-0.031425, -0.0846, 0.952675),
	],
	4: [
		new mp.Vector3(-0.5205, 0.1122, 0.9478),
		new mp.Vector3(-0.503175, 0.108525, 0.94865),
		new mp.Vector3(-0.485125, 0.10475, 0.949175),
		new mp.Vector3(-0.468275, 0.099175, 0.94995),
		new mp.Vector3(-0.45155, 0.09435, 0.95085),
		new mp.Vector3(-0.434475, 0.089725, 0.95145),
		new mp.Vector3(-0.415875, 0.0846, 0.9523),
    ]
}

const cardRotationOffsets = {
	1: [
		69.12,
		67.8,
		66.6,
		70.44,
		70.84,
		67.88,
		69.56,
	],
	2: [
		22.11,
		22.32,
		20.8,
		19.8,
		19.44,
		26.28,
		22.68,
	],
	3: [
		-21.43,
		-20.16,
		-16.92,
		-23.4,
		-21.24,
		-23.76,
		-19.44,
	],
	4: [
		-67.03,
		-69.12,
		-64.44,
		-67.68,
		-63.72,
		-68.4,
		-64.44,
	],
}

const cardOffsets = {
	1: [
		new mp.Vector3(0.5737, 0.2376, 0.948025),
		new mp.Vector3(0.562975, 0.2523, 0.94875),
		new mp.Vector3(0.553875, 0.266325, 0.94955),
		new mp.Vector3(0.5459, 0.282075, 0.9501),
		new mp.Vector3(0.536125, 0.29645, 0.95085),
		new mp.Vector3(0.524975, 0.30975, 0.9516),
		new mp.Vector3(0.515775, 0.325325, 0.95235),
	],
	2: [
		new mp.Vector3(0.2325, -0.1082, 0.94805),
		new mp.Vector3(0.23645, -0.0918, 0.949),
		new mp.Vector3(0.2401, -0.074475, 0.950225),
		new mp.Vector3(0.244625, -0.057675, 0.951125),
		new mp.Vector3(0.249675, -0.041475, 0.95205),
		new mp.Vector3(0.257575, -0.0256, 0.9532),
		new mp.Vector3(0.2601, -0.008175, 0.954375),
	],
	3: [
		new mp.Vector3(-0.2359, -0.1091, 0.9483),
		new mp.Vector3(-0.221025, -0.100675, 0.949),
		new mp.Vector3(-0.20625, -0.092875, 0.949725),
		new mp.Vector3(-0.193225, -0.07985, 0.950325),
		new mp.Vector3(-0.1776, -0.072, 0.951025),
		new mp.Vector3(-0.165, -0.060025, 0.951825),
		new mp.Vector3(-0.14895, -0.05155, 0.95255),
	],
	4: [
		new mp.Vector3(-0.5765, 0.2229, 0.9482),
		new mp.Vector3(-0.558925, 0.2197, 0.949175),
		new mp.Vector3(-0.5425, 0.213025, 0.9499),
		new mp.Vector3(-0.525925, 0.21105, 0.95095),
		new mp.Vector3(-0.509475, 0.20535, 0.9519),
		new mp.Vector3(-0.491775, 0.204075, 0.952825),
		new mp.Vector3(-0.4752, 0.197525, 0.9543),
    ]
}

const chipSplitRotationOffsets = {
	1: -22.32,
	2: -64.8,
	3: -108.36,
	4: -151.92
}

const chipOffsets = {
	1: [
		new mp.Vector3(0.6931, 0.1952, 0x0),
		new mp.Vector3(0.724925, 0.26955, 0x0),
		new mp.Vector3(0.7374, 0.349625, 0x0),
		new mp.Vector3(0.76415, 0.419225, 0x0)
	],
	2: [
		new mp.Vector3(0.2827, -0.227825, 0x0),
		new mp.Vector3(0.3605, -0.1898, 0x0),
		new mp.Vector3(0.4309, -0.16365, 0x0),
		new mp.Vector3(0.49275, -0.111575, 0x0)
	],
	3: [
		new mp.Vector3(-0.279425, -0.2238, 0x0),
		new mp.Vector3(-0.200775, -0.25855, 0x0),
		new mp.Vector3(-0.125775, -0.26815, 0x0),
		new mp.Vector3(-0.05615, -0.29435, 0x0)
	],
	4: [
		new mp.Vector3(-0.685925, 0.173275, 0x0),
		new mp.Vector3(-0.6568, 0.092525, 0x0),
		new mp.Vector3(-0.612875, 0.033025, 0x0),
		new mp.Vector3(-0.58465, -0.0374, 0x0)
	]
}

const chipRotationOffsets = {
	1: 74.52,
	2: 32.04,
	3: -15.48,
	4: -57.6
}

/** Модели персонала казино */
const croupiersModels = [
    "S_M_Y_Casino_01", // Мужская модель
    "S_F_Y_Casino_01" // Женская модель
];

/** Прогрузка анимации */
const requestAnim = function requestAnim(dict) {
    new Promise((resolve, _) => {
        const interval = setInterval(() => {
            if(mp.game.streaming.hasAnimDictLoaded(dict)) {
                clearInterval(interval);
                resolve();
            }
            else {
                mp.game.streaming.requestAnimDict(dict);
            }
        }, 300);
    });
}

global.trycatchtime = {};
global.Natives = {};
global.wait = time => new Promise(resolve => setTimeout(resolve, time));
global.pInt = (value) => {
    value = Math.round(value);
    return !value ? 0 : value;
}

Natives.GET_INTERIOR_FROM_ENTITY = (entity) => mp.game.invoke('0x2107BA504071A6BB', entity);

global.loadModel = (requiredModel) => new Promise(async (resolve, reject) => {
	if (typeof requiredModel === "string") requiredModel = mp.game.joaat(requiredModel);
	if (mp.game.streaming.hasModelLoaded(requiredModel)) return resolve(true);
	mp.game.streaming.requestModel(requiredModel);
	let d = 0;
	while (!mp.game.streaming.hasModelLoaded(requiredModel)) {
		if (d > 5000) return resolve(false);
		d++;
		await global.wait(0);
	}
	return resolve(true);
});

global.IsLoadEntity = entity => new Promise(async (resolve, reject) => {
	if (entity && entity.doesExist() && entity.handle !== 0)
		return resolve(true);
	let d = 0;
	while (!entity || !entity.doesExist() || entity.handle === 0) {
		if (d > 1000) return resolve("Ошибка IsLoadEntity.");
		d++;
		await mp.game.waitAsync(10);
	}
	return resolve(true);
});

class Blackjack {
    constructor() {
        this.g_blackjackData = [];
        this.dimensionDiamondInterior = 0;
        this.nearestSeat = null;
        this.nearestTable = null;
        this.selectTable = null;
        this.selectSeat = null;
        this.hand = [];
        this.splitHand = [];
        this.btnDouble = 0;
        this.btnSplit = 0;
        this.game = false;
        this.bet = false;
        this.candouble = true;
		this.epress = 0;
		
        this.invokeData = {
            NETWORK_CREATE_SYNCHRONISED_SCENE: "0x7CD6BC4C2BBDD526",
            NETWORK_ADD_PED_TO_SYNCHRONISED_SCENE: "0x742A637471BCECD9",
            NETWORK_START_SYNCHRONISED_SCENE: "0x9A1B3FCDB36C8697",
            NETWORK_STOP_SYNCHRONISED_SCENE: "0xC254481A4574CB2F",
            GET_ANIM_INITIAL_OFFSET_POSITION: "0xBE22B26DD764C040",
            GET_ANIM_INITIAL_OFFSET_ROTATION: "0x4B805E6046EE9E47",
            TASK_GO_STRAIGHT_TO_COORD: "0xD76B57B44F1E6F8B",
        
            _SET_SYNCHRONIZED_SCENE_OCCLUSION_PORTAL: "0x394B9CD12435C981",
            _PLAY_AMBIENT_SPEECH1: "0x8E04FEDD28D42462"
        }
        this.init();
        
        mp.keys.bind(0x45, true, () => {
            this.pressKeyE();
        });

		mp.keys.bind(0x14, true, () => { // Caps Lock
			if (this.selectTable == null) return;
			mp.gui.cursor.visible = !mp.gui.cursor.visible;
		});

        mp.events.add('playerEnterColshape', (shape) => {
			this.onPlayerEnterColshape(shape);
        });
        
        mp.events.add('playerExitColshape', (shape) => {
			this.onPlayerExitColshape(shape);
        });

		mp.events.add("render", () => {
			this.onRender();
		});

		mp.events.add("entityStreamIn", (entity) => {
			this.onEntityStreamIn(entity);
		});
    }

    DealerClothes(randomNumber, dealerPed) {
		try
		{
			if (randomNumber == 0) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 3, 0, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 3, 0, 0)
				dealerPed.setComponentVariation(3, 1, 0, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 3, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 1) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 2, 2, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 4, 0, 0)
				dealerPed.setComponentVariation(3, 0, 3, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 1, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 2) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 2, 1, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 2, 0, 0)
				dealerPed.setComponentVariation(3, 0, 3, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 1, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 3) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 2, 0, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 3, 0, 0)
				dealerPed.setComponentVariation(3, 1, 3, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 3, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 4) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 4, 2, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 3, 0, 0)
				dealerPed.setComponentVariation(3, 0, 0, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 1, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 5) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 4, 0, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 0, 0, 0)
				dealerPed.setComponentVariation(3, 0, 0, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 1, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 6) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 4, 1, 0)
				dealerPed.setComponentVariation(1, 1, 0, 0)
				dealerPed.setComponentVariation(2, 4, 0, 0)
				dealerPed.setComponentVariation(3, 1, 0, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 1, 0, 0)
				dealerPed.setComponentVariation(7, 2, 0, 0)
				dealerPed.setComponentVariation(8, 3, 0, 0)
				dealerPed.setComponentVariation(10, 1, 0, 0)
				dealerPed.setComponentVariation(11, 1, 0, 0)
			}
			else if (randomNumber == 7) {
				dealerPed.setDefaultComponentVariation()
				dealerPed.setComponentVariation(0, 1, 1, 0)
				dealerPed.setComponentVariation(1, 0, 0, 0)
				dealerPed.setComponentVariation(2, 1, 0, 0)
				dealerPed.setComponentVariation(3, 0, 3, 0)
				dealerPed.setComponentVariation(4, 0, 0, 0)
				dealerPed.setComponentVariation(6, 0, 0, 0)
				dealerPed.setComponentVariation(7, 0, 0, 0)
				dealerPed.setComponentVariation(8, 0, 0, 0)
				dealerPed.setComponentVariation(10, 0, 0, 0)
				dealerPed.setComponentVariation(11, 0, 0, 0)
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "DealerClothes", e.toString());
		}
    }

    DealerPedVoiceGroup(randomNumber, dealerPed) {
		try
		{
			if (randomNumber == 0)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_WHITE_01"))
			else if (randomNumber == 1)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_ASIAN_01"))
			else if (randomNumber == 2)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_ASIAN_02"))
			else if (randomNumber == 3)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_ASIAN_01"))
			else if (randomNumber == 4)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_WHITE_01"))
			else if (randomNumber == 5)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_WHITE_02"))
			else if (randomNumber == 6)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_M_Y_Casino_01_WHITE_01"))	
			else if (randomNumber == 7)
				mp.game.invoke("0x7CDC8C3B89F661B3", dealerPed.handle, mp.game.joaat("S_F_Y_Casino_01_ASIAN_01"))	
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "DealerPedVoiceGroup", e.toString());
		}
    }

    randomInteger(min, max) {
        return Math.round(min + Math.random() * (max - min));
    }

    init () { // todo возможно модуль казино будет удалять столы
		try
		{
			// Удаляем старые столы
			mp.game.entity.createModelHide(1149.38, 269.19, -52.02, 1, mp.game.joaat("vw_prop_casino_blckjack_01"), true);
			mp.game.entity.createModelHide(1151.28, 267.33, -51.84, 1, mp.game.joaat("vw_prop_casino_blckjack_01"), true);
			mp.game.entity.createModelHide(1128.862, 261.795, -51.0357, 1, mp.game.joaat("vw_prop_casino_blckjack_01b"), true);
			mp.game.entity.createModelHide(1143.859, 246.783, -51.035, 1, mp.game.joaat("vw_prop_casino_blckjack_01b"), true);
			mp.game.entity.createModelHide(1146.329, 261.2543, -52.84094, 1, mp.game.joaat("vw_prop_casino_3cardpoker_01"), true);
			mp.game.entity.createModelHide(1143.338, 264.2453, -52.84094, 1, mp.game.joaat("vw_prop_casino_3cardpoker_01"), true);
			mp.game.entity.createModelHide(1133.74, 266.6947, -52.04094, 1, mp.game.joaat("vw_prop_casino_3cardpoker_01b"), true);
			mp.game.entity.createModelHide(1148.74, 251.6947, -52.04094, 1, mp.game.joaat("vw_prop_casino_3cardpoker_01b"), true);
			
			let changeCroupierModel = false; // Для создания поочередно мужской и женской модели крупье
			let randomBlackShit;

			for(let i = 0; i < this.blackjackTables(); i++) {
				let blackjackData = {};

				randomBlackShit = i;

				// Создаем объект стола
				blackjackData.table = mp.objects.new(
					mp.game.joaat(blackjackTables[i][0]),
					new mp.Vector3(
						blackjackTables[i][1],
						blackjackTables[i][2],
						blackjackTables[i][3]
					),                
					{
						rotation: new mp.Vector3(
							0,
							0,
							blackjackTables[i][4])
					}
				);
				
				mp.game.invoke("0x971DA0055324D033", blackjackData.table.handle, 3);

				// Создаем персонажа (крупье)
				const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
					blackjackTables[i][1],
					blackjackTables[i][2],
					blackjackTables[i][3],
					blackjackTables[i][4],
					0,
					0.775,
					1);
				

				blackjackData.croupier = mp.peds.new(
					mp.game.joaat(randomBlackShit < 7 ? croupiersModels[0] : croupiersModels[1]),
					new mp.Vector3(
						x,
						y,
						z
					), 
					blackjackTables[i][4] - 180,
					this.dimensionDiamondInterior
				);

				blackjackData.croupier.setLodDist(100);
				this.DealerClothes(randomBlackShit, blackjackData.croupier);
				this.DealerPedVoiceGroup(randomBlackShit, blackjackData.croupier);
				blackjackData.croupier.blackjack = true;
				blackjackData.croupier.randomBlackShit = randomBlackShit;  

				// Создаём шейпы для посадки персонажа на 1 из 4 стульев    
				for (let l = 1; l < 5; l++) {
					
					const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
						blackjackTables[i][1],
						blackjackTables[i][2],
						blackjackTables[i][3],
						blackjackTables[i][4],
						correctionPosCharacterForSeatInTableToBlackjack[l - 1][0],
						correctionPosCharacterForSeatInTableToBlackjack[l - 1][1],
						correctionPosCharacterForSeatInTableToBlackjack[l - 1][2]);
					
					const shape = mp.colshapes.newSphere(
						x,
						y,
						z,
						0.5
					);

					shape.tableID = i;
					shape.seatID = l;
					shape.blackjack = true;
				}
				// Присваиваем ID стола, к которому привязан крупье
				blackjackData.croupier.tableID = i;
				
				// Создаем массивы для работы
				blackjackData.dealerHand = [];
				blackjackData.dealerHandObjs = [];
				blackjackData.handObjs = {};
				blackjackData.chips = {};
				

				this.g_blackjackData.push(blackjackData);
				// Меняем модель персонажа
				changeCroupierModel = !changeCroupierModel;
			}
			
			
			setTimeout(() => {
				requestAnim('anim_casino_b@amb@casino@games@blackjack@dealer');
				requestAnim('anim_casino_b@amb@casino@games@blackjack@dealer_female');
				requestAnim('anim_casino_b@amb@casino@games@shared@dealer@');

				this.g_blackjackData.forEach(element => {
					const animation = element.croupier.model == mp.game.joaat('S_M_Y_Casino_01') ? "anim_casino_b@amb@casino@games@roulette@dealer" : "anim_casino_b@amb@casino@games@roulette@dealer_female"
					element.croupier.taskPlayAnim(animation, "idle", 8.0, 1, -1, 1, 0.0, false, false, false);
				});
			}, 2000);
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "init", e.toString());
		}
    }
    /**
     * Получаем общее количество столов для игры в рулетку
     * @return number
     */
    blackjackTables() {
        return blackjackTables.length;
    }

    /**
     * Событие входа в стрим игрока
     * @param entity - объект
     */
    onEntityStreamIn(entity) {
		try
		{
			if (entity.blackjack) {
				requestAnim('anim_casino_b@amb@casino@games@roulette@dealer');
				requestAnim('anim_casino_b@amb@casino@games@roulette@dealer_female');
				requestAnim('anim_casino_b@amb@casino@games@roulette@table');

				if (entity.model == mp.game.joaat('S_M_Y_Casino_01')) {
					entity.taskPlayAnim("anim_casino_b@amb@casino@games@roulette@dealer", "idle", 8.0, 1, -1, 1, 0.0, false, false, false);
					//mp.game.invoke("0x7CDC8C3B89F661B3", entity.handle, mp.game.joaat("S_M_Y_Casino_01_WHITE_01"));
				}
				else {
					entity.taskPlayAnim("anim_casino_b@amb@casino@games@roulette@dealer_female", "idle", 8.0, 1, -1, 1, 0.0, false, false, false);
					//mp.game.invoke("0x7CDC8C3B89F661B3", entity.handle, mp.game.joaat("S_F_Y_Casino_01_ASIAN_01"));
				}
				
				this.DealerClothes(entity.randomBlackShit, entity);
				this.DealerPedVoiceGroup(entity.randomBlackShit, entity);
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onEntityStreamIn", e.toString());
		}
    }

    /**
     * Событие, когда игрок вошел в колшэйп
     * @param shape - объект
     */
    onPlayerEnterColshape(shape) {
		try
		{
			if (shape && shape.blackjack && shape.tableID != null && shape.seatID != null) {
				this.nearestSeat = shape.seatID;
				this.nearestTable = shape.tableID;
				mp.game.audio.playSound(-1, "BACK", "HUD_AMMO_SHOP_SOUNDSET", true, 0, true);
				mp.game.graphics.notify("~g~E~s~ сесть за стол");
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onPlayerEnterColshape", e.toString());
		}
    }

    /**
     * Событие, когда игрок вышел с колшэйпа
     * @param shape - объект
     */
    onPlayerExitColshape(shape) {
		try
		{
			if (shape && shape.blackjack && shape.tableID != null) {
				this.nearestSeat = null;
				this.nearestTable = null;
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onPlayerExitColshape", e.toString());
		}
    }
    
    /**
     * Метод при нажатии на клавишу Е
     */
    
    onRender() {
		try
		{
			if (this.selectTable != null && this.selectSeat != null) 
			{
				mp.game.graphics.drawText(`У Вас [${this.handValue(this.hand)}]${(this.splitHand.length ? ' [' + this.handValue(this.splitHand) + ']' : '')}, у дилера [${this.handValue(this.g_blackjackData[this.selectTable].dealerHand)}]`, [0.5, 0.8], {
					font: 0,
					color: [255, 255, 255, 200],
					scale: [0.35, 0.35],
					outline: true
				});
			}
		}
		catch (e) 
		{
			if (new Date().getTime() - global.trycatchtime["casino/blackjack"] < 60000) return;
			global.trycatchtime["casino/blackjack"] = new Date().getTime();
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onRender", e.toString());
		}
    }
    
    CardValue(card) {
		try
		{
			if (!card) return 0;
			let rank = 10;

			for (let i = 2; i <= 11; i++)
			{
				if (card.indexOf(`${i}`) != -1)
				{
					rank = i;
					break;
				}
			}

			if (card.indexOf("ace") != -1) rank = 11;
			return rank;
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "CardValue", e.toString());
			return 0;
		}
    }
    
    handValue(list) {
		try
		{
			if (!list.length) return 0;
			let tmpValue = 0;
			let numAces = 0;

			list.forEach (v => {
				tmpValue += this.CardValue(v);
			});

			list.forEach (v => {
				if (String(v).indexOf("ace") != -1) numAces++;
			});

			if (tmpValue > 21) {
				for (let i = 0; i < numAces; i++) tmpValue = tmpValue - 10;
			}

			return tmpValue;
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "handValue", e.toString());
			return 0;
		}
    }
    /**
     * Метод при нажатии на клавишу Е
     */
    pressKeyE() {
		try
		{
			if (mp.police.haveCuffs || mp.gui.cursor.visible) return false;
			if (mp.game.ui.isPauseMenuActive()) return false;
    		if (mp.busy.includes()) return false;

			if (this.nearestSeat != null && this.selectTable == null) { // Сесть за стол
				if (new Date().getTime() - this.epress < 5000) return;

				this.epress = new Date().getTime();
				mp.game.audio.startAudioScene("DLC_VW_Casino_Table_Games");
				
				const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
					blackjackTables[this.nearestTable][1],
					blackjackTables[this.nearestTable][2],
					blackjackTables[this.nearestTable][3],
					blackjackTables[this.nearestTable][4],
					correctionPosCharacterForSeatInTableToBlackjack[this.nearestSeat - 1][0],
					correctionPosCharacterForSeatInTableToBlackjack[this.nearestSeat - 1][1],
					correctionPosCharacterForSeatInTableToBlackjack[this.nearestSeat - 1][2]);

				mp.events.callRemote('server.blackjack.character_occupy_place', this.nearestTable, this.nearestSeat, x, y, z, correctionPosCharacterForSeatInTableToBlackjack[this.nearestSeat - 1][3] + blackjackTables[this.nearestTable][4]);
				return;
			}
			else if (this.selectTable != null) { // Условие, если игрок уже сидит за столом
				if (new Date().getTime() - this.epress < 5000) return;
				this.epress = new Date().getTime();
				this.onLeave();
				return;
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "pressKeyE", e.toString());
		}
    } 

    async onSelectTable(i, seat, isBet, isBtn) {
		try
		{
			this.g_blackjackData[i].table.setCollision(false, false);
			this.bet = true;        
			await global.wait(3500);

			this.selectTable = i;
			this.selectSeat = seat;
			this.hand = [];
			this.splitHand = [];
			this.candouble = true;
			this.bet = false;

			mp.callCEFV(`blackjack.init(${JSON.stringify({
				betMax: blackjackTables[i][0] == "vw_prop_casino_blckjack_01b" ? 100000 : 25000,
				isBet: isBet,
				isBtn: isBtn,
				btnDouble: false,
				btnSplit: false
			})})`);
			mp.callCEFV(`blackjack.show = true`);
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onSelectTable", e.toString());
		}
    }

    onLeave() {
		try
		{
			if (!this.game && this.selectTable != null) { // Условие, если игрок уже сидит за столом
				mp.events.callRemote('server.blackjack.character_leave_place');
				return;
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onLeave", e.toString());
		}
    }
	
	onSuccessLeave() {
		try
		{
			if (this.selectTable != null) {
				mp.callCEFV(`blackjack.show = false`);

				this.g_blackjackData[this.selectTable].table.setCollision(true, false);
				this.bet = true;
				this.game = false;

				setTimeout(() => {            
					this.selectTable = null;
					this.selectSeat = null;
					this.bet = false;
					mp.gui.cursor.visible = false;
				}, 3500);
				return;
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "onSuccessLeave", e.toString());
		}
	}

    async GiveCard(i, seat, handSize, card, flipped = false, split = false) {
		try
		{
			if (Natives.GET_INTERIOR_FROM_ENTITY(mp.players.local.handle) !== 275201) return;
			await global.wait(500);
			mp.game.invoke("0x469F2ECDEC046337", true);

			mp.game.audio.startAudioScene("DLC_VW_Casino_Cards_Focus_Hand");
		
			let modelName = `vw_prop_cas_card_${card}`;
			
			if (flipped) {
				this.g_blackjackData[i].realFlippedCard = card;
				modelName = `vw_prop_casino_cards_single`;
			}
			const pedInfo = this.g_blackjackData[i].croupier;
			
			await global.loadModel(modelName);
			const model = mp.objects.new(mp.game.joaat(modelName), new mp.Vector3(blackjackTables[i][1], blackjackTables[i][2], blackjackTables[i][3]));

			await global.IsLoadEntity(model);
			model.setCollision(false, false);
			model.attachTo(pedInfo.handle, pedInfo.getBoneIndex(28422), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
			
			if (seat > 0) {
				if (!this.g_blackjackData[i].handObjs[seat]) this.g_blackjackData[i].handObjs[seat] = [];
				this.g_blackjackData[i].handObjs[seat].push(model);
			}
			else {
				if (!this.g_blackjackData[i].dealerHandObjs) this.g_blackjackData[i].dealerHandObjs = [];
				this.g_blackjackData[i].dealerHandObjs.push(model);
			}
			await global.wait(!seat ? 900 : 800);

			if (!model || !mp.objects.exists(model)) return;
			model.detach(false, true);

			if (!seat) {
				const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
					blackjackTables[i][1],
					blackjackTables[i][2],
					blackjackTables[i][3],
					blackjackTables[i][4],
					cardOffsetsDealer[handSize].x,
					cardOffsetsDealer[handSize].y,
					cardOffsetsDealer[handSize].z);
				model.setCoordsNoOffset(x, y, z, false, false, false);
		
				if (flipped) model.setRotation(180, 0, blackjackTables[i][4] + cardOffsetsDealer[handSize].z, 2, true)
				else model.setRotation(0, 0, blackjackTables[i][4] + cardOffsetsDealer[handSize].z, 2, true)
			}
			else if (split) {
				const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
					blackjackTables[i][1],
					blackjackTables[i][2],
					blackjackTables[i][3],
					blackjackTables[i][4],
					cardSplitOffsets[seat][handSize].x,
					cardSplitOffsets[seat][handSize].y,
					cardSplitOffsets[seat][handSize].z);
				model.setCoordsNoOffset(x, y, z, false, false, false);
				model.setRotation(0, 0, blackjackTables[i][4] + cardSplitRotationOffsets[seat][handSize], 2, true);
			}
			else {
				const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
					blackjackTables[i][1],
					blackjackTables[i][2],
					blackjackTables[i][3],
					blackjackTables[i][4],
					cardOffsets[seat][handSize].x,
					cardOffsets[seat][handSize].y,
					cardOffsets[seat][handSize].z);
					
				model.setCoordsNoOffset(x, y, z, false, false, false);
				model.setRotation(0, 0, blackjackTables[i][4] + cardRotationOffsets[seat][handSize], 2, true);
			}
			if (!seat && !flipped) this.g_blackjackData[i].dealerHand.push(card);
			else if (this.selectSeat == seat && this.selectTable == i) {
				if (split) this.splitHand.push(card)
				else this.hand.push(card);
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "GiveCard", e.toString());
		}
    }


    async DealerTurnOverCard(i, flipover) {
		try
		{	
			if (Natives.GET_INTERIOR_FROM_ENTITY (mp.players.local.handle) !== 275201) return;
			await global.wait(500);

			const HandObjs = this.g_blackjackData[i].dealerHandObjs[0];
			if (mp.objects.exists(HandObjs)) HandObjs.destroy();

			const flipped = this.g_blackjackData[i].realFlippedCard,
				PedInfo = this.g_blackjackData[i].croupier;
		
			const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
				blackjackTables[i][1],
				blackjackTables[i][2],
				blackjackTables[i][3],
				blackjackTables[i][4],
				cardOffsetsDealer[0].x,
				cardOffsetsDealer[0].y,
				cardOffsetsDealer[0].z);
		
			await global.loadModel(flipover ? `vw_prop_cas_card_${flipped}` : `vw_prop_casino_cards_single`);
			this.g_blackjackData[i].dealerHandObjs[0] = mp.objects.new(mp.game.joaat(flipover ? `vw_prop_cas_card_${flipped}` : `vw_prop_casino_cards_single`), new mp.Vector3(x, y, z));

			await global.IsLoadEntity(this.g_blackjackData[i].dealerHandObjs[0]);
			if (mp.objects.exists(this.g_blackjackData[i].dealerHandObjs[0]))
				this.g_blackjackData[i].dealerHandObjs[0].attachTo(PedInfo.handle, PedInfo.getBoneIndex(28422), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, false, false, false, false, 2, true);
			await global.wait(1500);		
			
			if (mp.objects.exists(this.g_blackjackData[i].dealerHandObjs[0])) {
				this.g_blackjackData[i].dealerHandObjs[0].detach(false, true);
				this.g_blackjackData[i].dealerHandObjs[0].setCoordsNoOffset(x, y, z, false, false, false);
				this.g_blackjackData[i].dealerHandObjs[0].setRotation(flipover ? 0 : 180, 0, blackjackTables[i][4] + cardOffsetsDealer[0].z, 2, true);
			} else 
				await global.wait(1500);
			if (flipover) this.g_blackjackData[i].dealerHand.push(flipped);
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "DealerTurnOverCard", e.toString());
		}
    } 
    
    SplitHand(i, seat, handSize) {
		try
		{
			if (Natives.GET_INTERIOR_FROM_ENTITY (mp.players.local.handle) !== 275201) return;
			const { x, y, z } = mp.game.object.getObjectOffsetFromCoords(
				blackjackTables[i][1],
				blackjackTables[i][2],
				blackjackTables[i][3],
				blackjackTables[i][4],
				cardSplitOffsets[seat][handSize].x,
				cardSplitOffsets[seat][handSize].y,
				cardSplitOffsets[seat][handSize].z);
			
			const obj = this.g_blackjackData[i].handObjs;
		
			if (obj && obj[seat] && obj[seat][obj[seat].length - 1]) {
				obj[seat][obj[seat].length - 1].setCoordsNoOffset(x, y, z, false, false, false);
				obj[seat][obj[seat].length - 1].setRotation(0, 0, blackjackTables[i][4] + cardSplitRotationOffsets[seat][handSize], 2, true);
			}
			if (this.selectSeat == seat && this.selectTable == i) {
				this.splitHand.push(this.hand [this.hand.length - 1]);
				this.hand.splice(this.hand.length - 1, this.hand.length);
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "SplitHand", e.toString());
		}
    }

    RetrieveCards(i, seat) {
		try
		{
			if (Natives.GET_INTERIOR_FROM_ENTITY(mp.players.local.handle) !== 275201) return;
			if (!seat) {
				this.g_blackjackData[i].dealerHandObjs.forEach(model => {
					if (mp.objects.exists(model)) model.destroy();
				});
				this.g_blackjackData[i].dealerHandObjs = [];
				this.g_blackjackData[i].dealerHand = [];
			}
			else {
				if (this.g_blackjackData[i].handObjs && this.g_blackjackData[i].handObjs[seat] && this.g_blackjackData[i].handObjs[seat].length) {
					this.g_blackjackData[i].handObjs[seat].forEach(model => {
						if (mp.objects.exists(model)) model.destroy();
					});
					this.g_blackjackData[i].handObjs[seat] = [];
				}
				if (this.g_blackjackData[i].chips && this.g_blackjackData[i].chips[seat] && this.g_blackjackData[i].chips[seat].length) {
					this.g_blackjackData[i].chips[seat].forEach(model => {
						if (mp.objects.exists(model)) model.destroy();
					});
					this.g_blackjackData[i].chips[seat] = [];
				}
				if ((this.selectSeat == seat && this.selectTable == i) || (this.selectTable == null && this.selectSeat == null)) {
					this.hand = [];
					this.splitHand = [];
					this.candouble = true;
					//if (this.selectSeat == seat && this.selectTable == i) {
					//    mp.gui.emmit(`window.events.callEvent("cef.blackjack.btnExit", 1, "RetrieveCards")`);
					//    mp.gui.cursor.visible = true;
					//}
				}
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "RetrieveCards", e.toString());
		}
    }

    getChips (amount) {
		try
		{
			if (amount <= 2500)
				return { sound: "DLC_VW_CHIP_BET_SML_SINGLE", prop: "vw_prop_chip_50dollar_st" };
			else if (amount <= 10000)
				return { sound: "DLC_VW_CHIP_BET_SML_SMALL", prop: "vw_prop_chip_100dollar_st" };
			else if (amount <= 25000)
				return { sound: "DLC_VW_CHIP_BET_SML_SMALL", prop: "vw_prop_chip_500dollar_st" };
			else if (amount <= 50000)
				return { sound: "DLC_VW_CHIP_BET_SML_MEDIUM", prop: "vw_prop_chip_1kdollar_st" };
			else if (amount <= 100000)
				return { sound: "DLC_VW_CHIP_BET_SML_MEDIUM", prop: "vw_prop_chip_5kdollar_st" };
			else if (amount <= 150000)
				return { sound: "DLC_VW_CHIP_BET_SML_LARGE", prop: "vw_prop_chip_10kdollar_st" };
			else if (amount <= 200000)
				return { sound: "DLC_VW_CHIP_BET_SML_LARGE", prop: "vw_prop_plaq_5kdollar_st" };
			else
				return { sound: "DLC_VW_CHIP_BET_SML_LARGE", prop: "vw_prop_plaq_10kdollar_st" };
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "getChips", e.toString());
			return { sound: "DLC_VW_CHIP_BET_SML_LARGE", prop: "vw_prop_plaq_10kdollar_st" };
		}
        
    }
    async PlaceBetChip(i, seat, bet, double, split) {
		try
		{
			if (Natives.GET_INTERIOR_FROM_ENTITY (mp.players.local.handle) !== 275201) return;
			if (this.selectSeat == seat && this.selectTable == i) {
				mp.callCEFV(`blackjack.SetBet(${bet})`);
				this.bet = true;
				if (double == true || split == true) this.candouble = false;
			}

			let chip = this.getChips(bet);
			if (this.g_blackjackData[i].chips && this.g_blackjackData[i].chips[seat] && this.g_blackjackData[i].chips[seat].length) {
				this.g_blackjackData[i].chips[seat].forEach(model => {
					if (mp.objects.exists(model)) model.destroy();
				});
				this.g_blackjackData[i].chips[seat] = [];
			}

			let location = 0;
			if (double && !split) location = 1;
			else if (!double && split) location = 2;
			else if (double && split) location = 3;

			const model = mp.objects.new(mp.game.joaat(chip.prop), new mp.Vector3(blackjackTables[i][1], blackjackTables[i][2], blackjackTables[i][3]));
			await global.IsLoadEntity(model);
			model.setCollision(false, false);
			
			mp.game.audio.playSoundFromEntity(-1, chip.sound, model.handle, "dlc_vw_table_games_sounds", false, 0);

			const {x, y, z} = mp.game.object.getObjectOffsetFromCoords(blackjackTables[i][1], blackjackTables[i][2], blackjackTables[i][3], blackjackTables[i][4], chipOffsets[seat][location].x, chipOffsets[seat][location].y, 0.896);
			model.setCoordsNoOffset(x, y, z, false, false, false);

			if (!split) model.setRotation(0, 0, blackjackTables[i][4] + chipRotationOffsets[seat], 2, true);
			else model.setRotation(0, 0, blackjackTables[i][4] + chipSplitRotationOffsets[seat], 2, true);

			if (!this.g_blackjackData[i].chips[seat]) this.g_blackjackData[i].chips[seat] = [];
			this.g_blackjackData[i].chips[seat].push(model);
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "PlaceBetChip", e.toString());
		}
    }

    PlayDealerAnim(i, animDict, anim) {
		try
		{
			mp.game.streaming.requestAnimDict(animDict);
			const PedInfo = this.g_blackjackData[i].croupier;

			if (PedInfo.model === mp.game.joaat("S_M_Y_Casino_01")) {
				PedInfo.taskPlayAnim(animDict, anim, 4, -2, -1, 2, 0, false, false, false),
				PedInfo.playFacialAnim(anim + "_facial", animDict)
			}
			else {
				PedInfo.taskPlayAnim(animDict, "female_" + anim, 4, -2, -1, 2, 0, false, false, false),
				PedInfo.playFacialAnim("female_" + anim + "_facial", animDict)
			}
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "PlayDealerAnim", e.toString());
		}
    }

    PlayDealerSpeech(i, speech) {
		try
		{
			const PedInfo = this.g_blackjackData[i].croupier;
			mp.game.invoke(this.invokeData._PLAY_AMBIENT_SPEECH1, PedInfo.handle, speech, "SPEECH_PARAMS_FORCE_NORMAL_CLEAR");
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "PlayDealerSpeech", e.toString());
		}
    }

    CanSplitHand() {
		try
		{
			if (this.hand && this.hand.length == 2 && this.hand[0] && this.hand[1]) {
				if (this.CardValue(this.hand[0]) == this.CardValue(this.hand[1])) return true;
			}
			return false;
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "CanSplitHand", e.toString());
			return false;
		}
    }

    openBtn(isBet, isBtn) {      
		try
		{
			this.btnDouble = 0;
			this.btnSplit = 0;

			if (this.hand && this.hand.length == 2 && !this.splitHand.length && this.candouble) this.btnDouble = 1;
			if (!this.splitHand.length && this.CanSplitHand() && this.candouble) this.btnSplit = 1;
			
			mp.callCEFV(`blackjack.SetBtnInfo(${isBet}, ${isBtn}, ${this.btnDouble}, ${this.btnSplit})`);

			if (isBet || isBtn) mp.gui.cursor.visible = true;
			else mp.gui.cursor.visible = false;

			mp.callCEFV(`blackjack.SetTime(0)`);
		}
		catch (e) 
		{
			mp.events.callRemote("client_trycatch", "casino/blackjack", "openBtn", e.toString());
		}	
    }
}

global.blackjack = new Blackjack();

mp.events.add('client.blackjack.GiveCard', async function (i, seat, handSize, card, flipped = false, split = false) {
    global.blackjack.GiveCard(i, seat, handSize, card, flipped, split);
})

mp.events.add('client.blackjack.DealerTurnOverCard', async function (i, flipover = true) {
    global.blackjack.DealerTurnOverCard(i, flipover);
})

mp.events.add('client.blackjack.character_occupy_place', (i, seat, isBet, isBtn) => {
    global.blackjack.onSelectTable(i, seat, isBet, isBtn);
});

mp.events.add('client.blackjack.SyncTimer', function (time) {
	mp.callCEFV(`blackjack.SetTime(${time})`);
});

mp.events.add('client.blackjack.ExitBtn', function (btn) {
	mp.callCEFV(`blackjack.SetBtnExit(${btn})`);

    if (!btn) global.blackjack.game = true;
    else {
        global.blackjack.bet = false;
        global.blackjack.game = false;
    }
});

mp.events.add('client.blackjack.betWin', function (value) {
	mp.callCEFV(`blackjack.SetBetWin(${value})`);
});

mp.events.add('client.blackjack.successLeave', function () {
    global.blackjack.onSuccessLeave();
});

mp.events.add('client.blackjack.SplitHand', function (i, seat, handSize) {
    global.blackjack.SplitHand(i, seat, handSize)
});

mp.events.add('client.blackjack.RetrieveCards', function (i, seat) {
    global.blackjack.RetrieveCards(i, seat)
});

mp.events.add('client.blackjack.PlayDealerSpeech', function (i, speech) {
    global.blackjack.PlayDealerSpeech(i, speech);
});

mp.events.add('client.blackjack.PlayDealerAnim', function (i, animDict, anim) {
    global.blackjack.PlayDealerAnim(i, animDict, anim);
});

mp.events.add('client.blackjack.PlaceBetChip', function (i, seat, bet, double = false, split = false) {
    global.blackjack.PlaceBetChip(i, seat, bet, double, split);
});

mp.events.add('client.blackjack.isBtn', function (isBet, isBtn) {
    global.blackjack.openBtn(isBet, isBtn);
});

mp.events.add('client.blackjack.setBet', function (value) {
    mp.events.callRemote('server.blackjack.setBet', global.pInt(value));
});

mp.events.add('client.blackjack.exit', function () {
    global.blackjack.onLeave();
});

mp.events.add('client.blackjack.btn', function (value) {
    mp.events.callRemote('server.blackjack.move', value);
});

mp.events.add("blackjack.setClientRotation", (remoteId, rot) => {
	const player = mp.players.atRemoteId(remoteId);
	if (mp.players.exists(player)) player.setRotation(0, 0, rot, 2, true);
});