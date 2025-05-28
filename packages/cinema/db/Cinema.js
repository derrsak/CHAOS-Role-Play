module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Cinema", {
        id: {
			type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
			type: DataTypes.STRING(30),
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
        d: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        }
    }, { timestamps: false });
    return model;
};
