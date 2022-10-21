
module.exports = (sequelize, DataTypes) => {
    const Unit = sequelize.define('Unit', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
        },
        imagename: {
            type: DataTypes.STRING,
        },
        data: {
            type: DataTypes.BLOB('long'),
        },
    }, {
        tableName: 'unit',
        timestamps: false,
        underscored: true,
        hooks: {
            beforeCreate(unit) {
                unit.name = unit.name.toLowerCase();
            }   
        }
    });

    Unit.associate = (models) => {
        Unit.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            // onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
        Unit.belongsTo(models.User, {
            foreignKey: 'userId',
            // onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
        Unit.hasMany(models.Image, {
            onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });

    };

    return Unit;
}