module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Quest", {
        id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
			type: DataTypes.STRING(30),
			allowNull: false
        },
        description: {
			type: DataTypes.STRING(128),
			allowNull: false
        },
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        availableLvl: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        availableQuest: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        prize: {
            type: DataTypes.STRING(1024),
            allowNull: false,
            get() {
                var val = this.getDataValue('prize');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);
                this.setDataValue('prize', val);
            }
        },
        questLogic: {
            type: DataTypes.STRING(1024),
            allowNull: false,
            get() {
                var val = this.getDataValue('questLogic');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);
                this.setDataValue('questLogic', val);
            }
        }
    }, { timestamps: false });
    return model;
};
