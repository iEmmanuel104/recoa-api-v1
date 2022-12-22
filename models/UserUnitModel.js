module.exports = (sequelize, DataTypes) => {
    const UserUnit = sequelize.define('UserUnit', {
        unitcount: {
            type: DataTypes.INTEGER,  
            allowNull: false
        },

    },
     {
        tableName: 'UserUnit',
        timestamps: false,
        underscored: true,
    }
    );

    // UserUnit.associate = (models) => {
    //     UserUnit.belongsTo(models.Unit, {
    //         foreignKey: 'unitid',
    //         onDelete: 'CASCADE',
    //         onUpdate : 'CASCADE'
    //     });
    //     UserUnit.belongsTo(models.User, {
    //         foreignKey: 'userid',
    //         onDelete: 'CASCADE',
    //         onUpdate : 'CASCADE'
    //     });
    // };

    return UserUnit;
}
