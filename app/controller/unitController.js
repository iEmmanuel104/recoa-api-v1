const db = require('../../models');
const Unit = db.Unit;
const Property = db.Property;
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
    try {
        const { unitId } = req.params;
        const { userId, unitcount } = req.body;
        const unit = await Unit.findOne({
            where: { id: unitId },
        });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        if (unit.unitstatus === 'reserved') {
            throw new Error('Unit is not available');
        }
        if (unit.count < unitcount) {
            throw new Error('Only ' + unit.count + ' units are available');
            }
                    
        const user = await User.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User with the specified ID does not exists');
        }
        if (user.user_type !== 'investor') {
            throw new Error('Only investor can reserve a unit');
        }
        const availableUnit = unit.count - unitcount;
        // const unitcountstatus = (availableUnit === 0) ? 'reserved' : 'available';
        const unitcountstatus = (availableUnit) => {
            if (availableUnit === 0) {
                return 'reserved';
            } else {
                return 'available';
            }
        };

        const statusreserved = unitcountstatus(availableUnit);

        const reservedUnit = await Unit.update(
            {
                count: availableUnit,
                userId: userId,
                unitstatus: statusreserved,
            },
            {
                where: { id: unitId },
            },
        );
        res.status(200).json({ msg: "Unit reserved", reservedUnit });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getreservedpropertyUnit = async (req, res) => {
    try {
        const { id } = req.params;
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
                    unitstatus: 'reserved',
                    userId: {
                        [Op.ne]: null,
                    },
                },
            },
        );
        const user = units.map(async (unit) => {
            const user = await User.findOne({
                where: { id: unit.userId },
            });
            return user;
        });
        const users = await Promise.all(user);
        res.status(200).json({ msg: "All reserved units for this property", units, users });
    } catch (error) {
        res.status(500).send(error.message);
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