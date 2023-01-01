module.exports = (sequelize, DataTypes) => {
    const Reserves = sequelize .define('Reserves', {
        reserveId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        unitId: {
            type: DataTypes.UUID,
            allowNull: false, 
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
        reserveDate: { 
            type: DataTypes.DATE,
            allowNull: false
        },
        reserveCount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'Reserves',
        timestamps: false
    });         
    return Reserves;
};

