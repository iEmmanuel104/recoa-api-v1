
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
        unitimage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        unitstatus: {
            type: DataTypes.ENUM('available', 'reserved'),
            defaultValue: 'available',
            allowNull: false
        }
    }, {
        tableName: 'unit',
        timestamps: false,
        // underscored: true,
        hooks: {
            beforeCreate(unit) {
                unit.name = unit.name.toLowerCase();

            }   
        }
    });

    Unit.prototype.toJSON = function() {
      const values = Object.assign({}, this.get());

      delete values.data;
      return values;
    };

    Unit.associate = (models) => {
        Unit.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            onDelete: 'CASCADE',
            onUpdate : 'CASCADE'
        });
        Unit.belongsToMany(models.User, {
            through: 'UserUnit',
            foreignKey: 'unit_Id',
            as: 'users',
            onDelete: 'CASCADE',
            onUpdate : 'CASCADE'   
        });

    };

    return Unit;
}