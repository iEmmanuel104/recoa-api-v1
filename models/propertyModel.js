module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(["waitlist", "live"]),
            defaultValue: 'waitlist',
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
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
        tableName: 'property',
        timestamps: false,
        underscored: true,
        // hooks: {
        //     beforeCreate(property) {
        //         property.name = property.name.toLowerCase();
        //     }
        // }
    });

    Property.associate = (models) => {
        Property.hasMany(models.Unit, {
            onDelete: 'CASCADE',
            onUpdate : 'CASCADE'
        });
        Property.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
            onUpdate : 'CASCADE'
        });
        Property.belongsToMany(models.Waitlist, {
            through: 'WaitlistProperty',
            as: 'waitlists',
            foreignKey: 'property_id',
            onDelete: 'CASCADE',
            onUpdate : 'CASCADE'
        });
    };
    

    
    return Property;
    };


