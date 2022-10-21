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
            type: DataTypes.STRING,
            defaultValue: 'waitlist',
            allowNull: false
        }

    }, {
        tableName: 'property',
        timestamps: false,
        underscored: true
    });

    Property.associate = (models) => {
        Property.hasMany(models.Unit, {
            onDelete: 'CASCADE',
        });
    };
    

    
    return Property;
    };






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
        }
    }, {
        tableName: 'unit',
        timestamps: false,
        underscored: true
    });

    Unit.associate = (models) => {
        Unit.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            // onDelete: 'CASCADE',
        });
    };

    return Unit;
}



const { DataTypes } = require('sequelize');
const db = require('../config/db.config.js');




const hooks = {
  beforeCreate(user) {
    user.password = bcryptService().hashPassword(user);
  }
};

const tableName = "users";

const User = db.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    firstname: {
        type: DataTypes.STRING
    },
    lastname: {
        type: DataTypes.STRING  
    },
    telphone: {
        type: DataTypes.STRING
    },
    organisation: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
},
  { hooks, 
    tableName,
    paranoid: true, 
}
);

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());

  delete values.password;

  return values;
};

module.exports = User;
