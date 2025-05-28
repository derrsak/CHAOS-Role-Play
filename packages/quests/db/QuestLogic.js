module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("QuestLogic", {
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
			type: DataTypes.STRING(100),
			allowNull: false
        },
        descToQuest: {
			type: DataTypes.STRING(100),
			allowNull: false
        }
    }, { timestamps: false });
    return model;
};
