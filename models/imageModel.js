module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        filepath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mimetype: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'image',
        timestamps: false,
        underscored: true,
        hooks: {
            beforeCreate(image) {
                image.name = image.name.toLowerCase();
            }
        }
    });
    Image.associate = (models) => {
        Image.belongsTo(models.Unit, {
            foreignKey: 'unitId',
            // onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
    };
    return Image;
}