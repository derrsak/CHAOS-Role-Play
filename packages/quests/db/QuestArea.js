module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("QuestArea", {
        id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
			type: DataTypes.STRING(30),
			allowNull: false
        },
        ruName: {
			type: DataTypes.STRING(30),
			allowNull: false
        }
    }, { timestamps: false });
    return model;
};
