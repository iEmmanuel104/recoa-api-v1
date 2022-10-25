module.exports = (sequelize, DataTypes) => {
    const Waitlist = sequelize.define('Waitlist', {
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
        organisation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email : { 
            type: DataTypes.STRING,
            allowNull: false
        },
        phone : {
            type: DataTypes.STRING,
            allowNull: false
        },
        location : {
            type: DataTypes.STRING,
            allowNull: false
        },
        date : {
            type: DataTypes.DATE,
            allowNull: false
        },
        budget : {
            type: DataTypes.STRING,
            allowNull: false
        },
        comments : {
            type: DataTypes.STRING,
            allowNull: true
        },

    }, {
        tableName: 'waitlist',
        timestamps: false,
        underscored: true,
        hooks: {
            beforeCreate(waitlist) {
                waitlist.userId = waitlist.userId.toLowerCase();
            }
        }
    });

    Waitlist.associate = (models) => {
        Waitlist.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
    };

    return Waitlist;
}
