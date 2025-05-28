module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("QuestNPC", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
			type: DataTypes.STRING(32),
			allowNull: false
        },
        greeting: {
			type: DataTypes.STRING(200),
			allowNull: false
        },
        x: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        y: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        z: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        h: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        d: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        quests: {
            type: DataTypes.STRING(200),
            allowNull: false,
            get() {
                var val = this.getDataValue('quests');
                return JSON.parse(val);
            },
            set(val) {
                if (typeof val == 'object') val = JSON.stringify(val);
                this.setDataValue('quests', val);
            }
        },
        model: {
			type: DataTypes.STRING(32),
			allowNull: false
        },
        scenario: {
			type: DataTypes.STRING(50),
			allowNull: false
        },
        blipCreated: {
            type: DataTypes.TINYINT(1),
            defaultValue: 1,
            allowNull: false
        },
    }, { timestamps: false });
    return model;
};
