const db = require('../../models');
const Unit = db.Unit;
const Property = db.Property;
const UserUnit = db.UserUnit;
const User = db.User;
const Op = require('sequelize').Op;
const path = require('path');

const getAllUnit = async (req, res) => {
    try {
        const units = await Unit.findAll();
        res.status(200).json({ msg: "All units", units });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const addpropertyUnit = async (req, res) => {   
    try {
        const { propertyId, name, description, price, count } = req.body;
        const { mimetype, originalname, filename } = req.file;

        if (!propertyId) {
            throw new Error('Reference Property ID is required');
        }
        if (!name) {
            throw new Error('Name is required');
        }
        if (!description) {
            throw new Error('Description is required');
        }
        if (!price) {
            throw new Error('Price is required');
        }
        if (!count) {
            throw new Error('Count is required');
        }
        if (!req.file) {
            throw new Error('unit Image is required');
        }
        if (!mimetype.startsWith('image')) {
            throw new Error('Please upload an image file');
        }
        const UnitAlreadyExists = await Unit.findOne({
            where: { name: name },    
        });
    
        if (UnitAlreadyExists) {
            throw new Error('Unit with the specified name already exists');
        }

        const property = await Property.findOne({
            where: { id: propertyId },
        });
        if (!property) {
            throw new Error('Property with the specified ID does not exists');
        }
        const unit = await Unit.create({
            propertyId,
            name,
            description,
            price,
            count,
            type: mimetype,
            imagename: originalname,
            data: filename,
    
        });
        res.status(201).json({ unit,
            msg: "Unit created, image succesfully uploaded", });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getAllpropertyUnit = async (req, res) => {
    try {
        const { propertyid } = req.params;
        const property = await Property.findOne({
            where: { id: propertyid },
        });
        if (!property) {
            throw new Error('Property with the specified ID does not exists');
        }
        const units = await Unit.findAll(
            {
                where: { propertyId: propertyid },
            },
        );
        res.status(200).json({ msg: "All units for this property", units });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getUnitById = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findOne({ where: { id: id, unitstatus: 'available' } });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        res.status(200).json({ msg: "Unit found", unit });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getunitImage = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findOne({
            where: { id: id },
        });
        if (unit) {
            const imagePath = path.join(__dirname, `../../images/${unit.data}`);
            console.log (imagePath);
            // send path to image
            return res.status(200).sendFile(imagePath);
        }
        res.status(404).send('Unit with the specified ID does not exists');
        // if (unit.data) {
        //     console.log(unit.data);
        //     const imagePath = path.join(__dirname, `../../images/${unit.data}`);

        //     return res.status(200).sendFile(path.join(__dirname, `../../images/${unit.data}`));
        // }
        // res.status(404).send('Unit with the specified ID does not exists');
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

const updatepropertyUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, count } = req.body;
        const unit = await Unit.findOne({
            where: { id: id },
        });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        const [updatedUnit] = await Unit.update(
            {
                name,
                description,
                price,
                count,
            },
            {
                where: { id: id },
            },
        );
        if (updatedUnit) {
            const updatedUnit = await Unit.findOne({ where: { id: id } });
            res.status(200).json({ unit: updatedUnit, msg: "Unit updated" });
        }
        throw new Error('Unit not found');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const deletepropertyUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findOne({
            where: { id: id },
        });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        await Unit.destroy({
            where: { id: id },
        });
        res.status(200).json({ msg: "Unit deleted" });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const searchpropertyUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.query;
        const property = await Property.findOne({
            where: { id: id },
        });
        if (!property) {
            throw new Error('Property with the specified ID does not exists');
        }
        const units = await Unit.findAll(
            {
                where: {
                    propertyId: id,
                    name: {
                        [Op.like]: `%${name}%`,
                    },
                },
            },
        );
        res.status(200).json({ msg: "All units for this property", units });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const reservepropertyUnit = async (req, res) => {
  const { unitId } = req.params;
  const { userId, unitcount } = req.body;

  try {
    // Check if unit exists
    const unit = await Unit.findOne({
      where: { id: unitId },
    });
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Check if unit is available
    if (unit.unitstatus !== 'available') {
      return res.status(400).json({ error: 'Unit is not available' });
    }

    // Check if there are enough units available
    if (unit.count < unitcount) {
      return res
        .status(400)
        .json({ error: `Only ${unit.count} units are available` });
    }

    // Check if user exists
    const user = await User.findOne({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is an investor
    if (user.user_type !== 'investor') {
      return res.status(400).json({ error: 'Only investors can reserve a unit' });
    }

    // Reserve unit
    const availableUnit = unit.count - unitcount;
    const unitcountstatus = availableUnit === 0 ? 'reserved' : 'available';
    const reservedUnit = await Unit.update(
      {
        count: availableUnit,
        unitstatus: unitcountstatus,
      },
      {
        where: { id: unitId },
      }
    );
    // append count value to unitcount in junction table UserUnit
      await user.addUnit(unit);

      const junctionuser = await UserUnit.findOne({
        where: { userId: userId, unitId: unitId },
        })

        const userreservedunitcount = junctionuser.usercount + unitcount; 

        await junctionuser.update({ usercount: userreservedunitcount });

    // Associate user and unit

    res.json({ message: `Unit reserved: ${userreservedunitcount} counts of this unit have now been reserved by you`, reservedUnit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getreservedpropertyUnit = async (req, res) => {
    try {
        const { userId } = req.body;
        const { unitId } = req.params;

        const unit = await Unit.findOne({
            where: { id: unitId },
        });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        const user = await User.findOne({
            where: { id: userId },
            include: [{
                model: Unit,
                as: 'units',
                where: { id: unitId },
            }, {
                model: UserUnit,
                as: 'userunits',  
                where: { unitId: unitId },             
            }]
        });
        if (!user) {
            throw new Error('User with the specified ID does not exists');
        }
        if (user.user_type !== 'investor') {
            throw new Error('Only investor can reserve a unit');
        }

        res.status(200).json({ msg: "All reserved units for this user", user });
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error);
    }
};      


module.exports = {
    getAllUnit,
    addpropertyUnit,
    getAllpropertyUnit,
    getUnitById,
    getunitImage,
    updatepropertyUnit,
    deletepropertyUnit,
    searchpropertyUnit,
    reservepropertyUnit,
    getreservedpropertyUnit,

}