module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("CaseCharacterPrize", {
		id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        characterId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        prizeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
	}, {timestamps: false});

	return model;
};