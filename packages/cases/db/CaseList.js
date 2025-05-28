module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("CaseList", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            defaultValue: "Название кейса",
            allowNull: false
        },
        cost: {
            type: DataTypes.INTEGER(11),
            defaultValue: 1000,
            allowNull: false
        },
        prizes: {
            type: DataTypes.STRING(512),
            defaultValue: "[]", // ids from PrizeList
            allowNull: false,

            get() {
                const val = this.getDataValue('prizes');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);
                this.setDataValue('prizes', val);
            }
        }
	}, {timestamps: false});

	return model;
};