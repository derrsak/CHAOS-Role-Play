module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define("Bank", {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
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
        npcX: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        npcY: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        npcZ: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        npcH: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }, { timestamps: false });

    return model;
};
