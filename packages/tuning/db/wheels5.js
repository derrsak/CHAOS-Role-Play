module.exports = (sequelize, DataTypes) => {

	const model = sequelize.define("wheels5s", {
        name: {
			type: DataTypes.STRING(128),
			allowNull: false
        },
		wprice: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0,
			allowNull: false
        },
	}, {timestamps: false});


	return model;
};
