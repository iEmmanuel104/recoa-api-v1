const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
        allowNull: false,
        
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
        },
        allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
        allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM(["admin", "investor"]),
      defaultValue: "investor",
      allowNull: false
   },
   verification_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
 }, {
        tableName: 'user',
        timestamps: false,
        underscored: true,
        hooks: {
            beforeCreate(user) {
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
                user.username = user.username.toLowerCase();
            }
        }
    });

    User.prototype.toJSON = function() {
      const values = Object.assign({}, this.get());

      delete values.password;

      return values;
    };
    User.associate = (models) => {
        User.hasMany(models.Unit, {
            onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
        User.hasMany(models.Property, {
            onDelete: 'CASCADE',
            // onUpdate : 'CASCADE'
        });
    };

  return User;
};
