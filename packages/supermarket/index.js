let shops;
let bizes;

let peds = [];

module.exports = {
    business: {
        type: 1,
        name: "Супермаркет",
        productName: "Продукты",
    },
    shapeRange: 1,
    showMarkers: false,
    rentPerDayMultiplier: 0.03,
    minPriceMultiplier: 1.0, // множитель наценки для владельца
    maxPriceMultiplier: 3.0,
    productPrice: 10, // цена за продукт для покупки дальнобойщику (себестоимость)
    productsConfig: { // наценка на продукт. Стоимость покупки товара = наценка * себестоимость * множитель от владельца | цена в продуктах для бизнеса
        phone: 15,
        numberChange: 12,
        water: 2,
        chocolate: 1,
        cigarettes: 2,
        canister: 10,
        rope: 5,
        bag: 7000,
        duffleBag: 30,
        healthPack: 30,
        matches: 8,
    },
    itemIds: {
        water: 34,
        chocolate: 35,
        cigarettes: 16,
        rope: 54,
        bag: 55,
        canister: 56,
        duffleBag: 13,
        healthPack: 24,
        matches: 139,
    },

    async init() {
        bizes = call('bizes');
        await this.loadSupermarketsFromDB();
    },
    async loadSupermarketsFromDB() {
        shops = await db.Models.Supermarket.findAll();
        for (var i = 0; i < shops.length; i++) {
            this.createSupermarket(shops[i]);
        }
        console.log(`[SUPERMARKET] Загружено супермаркетов: ${i}`);
    },
    createSupermarket(shop) {
        // mp.blips.new(52, new mp.Vector3(shop.x, shop.y, shop.z),
        //     {
        //         name: 'Супермаркет',
        //         color: 0,
        //         shortRange: true,
        //     });
        
        if (this.showMarkers) {
            let color = [255, 255, 255, 128]; 
            switch(shop.bType) {
                case 0: // 24/7 green
                    color = [50, 168, 82, 128];
                    break;
                case 1: // ltd blue
                    color = [69, 140, 255, 128];
                    break;
                case 2: // robs liquor
                    color = [255, 82, 69, 128];
                    break;
            }
            mp.markers.new(1, new mp.Vector3(shop.x, shop.y, shop.z - 1), this.shapeRange,
            {
                color: color,
                visible: true,
                dimension: 0
            });
        }
        
        peds.push(
            {
                position: {
                    x: shop.npcX,
                    y: shop.npcY,
                    z: shop.npcZ
                },
                heading: shop.npcH
            }
        );

        let shape = mp.colshapes.newSphere(shop.x, shop.y, shop.z, this.shapeRange);
        shape.isSupermarket = true;
        shape.supermarketId = shop.id;
    },
    loadNPC(player) {
        if (!peds.length) return;
        player.call('supermarket.npc.create', [peds]);
    },
    getRawShopData(id) {
        let shop = shops.find(x => x.id == id);
        return {
            bType: shop.bType,
            priceMultiplier: shop.priceMultiplier
        }
    },
    getBizParamsById(id) {
        let shop = shops.find(x => x.bizId == id);
        if (!shop) return;
        let params = [
            {
                key: 'priceMultiplier',
                name: 'Наценка на товары',
                max: this.maxPriceMultiplier,
                min: this.minPriceMultiplier,
                current: shop.priceMultiplier
            }
        ]
        return params;
    },
    setBizParam(id, key, value) {
        let shop = shops.find(x => x.bizId == id);
        if (!shop) return;
        shop[key] = value;
        shop.save();
    },
    getProductsAmount(id) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        let products = bizes.getProductsAmount(bizId);
        return products;
    },
    removeProducts(id, products) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        bizes.removeProducts(bizId, products);
    },
    getPriceMultiplier(id) {
        let shop = shops.find(x => x.id == id);
        return shop.priceMultiplier;
    },
    updateCashbox(id, money) {
        let shop = shops.find(x => x.id == id);
        let bizId = shop.bizId;
        bizes.bizUpdateCashBox(bizId, money);
    },
    getProductsConfig() {
        return this.productsConfig;
    },
    getPriceConfig() {
        let priceConfig = {};
        for (let key in this.productsConfig) {
            priceConfig[key] = this.productsConfig[key] * this.productPrice;
        }
        return priceConfig;
    }
}
