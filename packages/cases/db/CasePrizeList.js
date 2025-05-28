module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("CasePrizeList", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        chance: {
            type: DataTypes.INTEGER(11),
            defaultValue: 50,
            allowNull: false
        },
        sellPrice: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1000,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(50),
            defaultValue: "Item", // Item, Car, Money
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(50),
            defaultValue: "1", // id item, model car, amount money
            allowNull: false
        },
        itemParams: {
            type: DataTypes.STRING(100),
            defaultValue: "[]", // params item, if type == "Item"
            allowNull: false,

            get() {
                const val = this.getDataValue('itemParams');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);
                this.setDataValue('itemParams', val);
            }
        }
	}, {timestamps: false});

	return model;
};