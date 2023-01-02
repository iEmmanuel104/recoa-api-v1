const db = require('../../models');
const Unit = db.Unit;
const Property = db.Property;
const Reserves = db.Reserves;
const User = db.User;
// import sequelize transactions    
const { sequelize, Sequelize } = require('../../models');
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
       await Unit.update(
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
        // return the full updated unit details
        const updatedUnitDetails = await Unit.findOne({
            where: { id: id },
        });
        res.status(200).json({ msg: "Unit updated", updatedUnitDetails });
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
        // use sequelize transaction
        const result = await sequelize.transaction(async (t) => {
            // Check if unit exists
            const unit = await Unit.findOne({
                where: { id: unitId },
            });
            if (!unit) {
                throw new Error('Unit not found');
            }
            // Check if unit is available
            if (unit.unitstatus !== 'available') {
                throw new Error('Unit is not available');
            }

            // Check if there are enough units available
            if (unit.count < unitcount) {
                throw new Error(`Only ${unit.count} units are available`);
            }

            // Check if user exists
            const user = await User.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user is an investor
            if (user.user_type !== 'investor') {
                throw new Error('Only investors can reserve a unit');
            }

            // Reserve unit
            const availableUnit = unit.count - unitcount;
            const unitcountstatus = availableUnit === 0 ? 'reserved' : 'available';
            // increment count and update unit status
            await Unit.update(
                {
                    count: availableUnit,
                    unitstatus: unitcountstatus,
                },
                {
                    where: { id: unitId },
                },
                { transaction: t }
            );

            await user.addUnit(unit);

            // Save date, unit and user id to reserved unit table and increment reserveCount

            // find most recent by reserveDate if user has reserved a unit before
            const userReservedUnitCount = await Reserves.findOne({
                where: { userId: userId, unitId: unitId },
                order: [['reserveDate', 'DESC']],
            });
            // find most recent reserveDate and increment reserveCount by unitcount as integer
            const reserveCount = userReservedUnitCount
                ? userReservedUnitCount.reserveCount + parseInt(unitcount)
                : parseInt(unitcount);
            

            // Save to reserves table by updating or creating a new record for the user and unit id combination
            const reserved = await Reserves.create(
                {
                    userId: userId,
                    unitId: unitId,
                    reserveDate: new Date(),
                    reserveCount: reserveCount,
                },
                { transaction: t }
            );

            return { msg: 'Unit reserved successfully', reserved };
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const getreservedpropertyUnit = async (req, res) => {
    try {
        const { userId } = req.query;
        const { unitId } = req.params;

        const unit = await Unit.findOne({
            where: { id: unitId },
        });
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        const user = await User.findOne({ where: { id: userId } }); 
        if (!user) {
            throw new Error('User with the specified ID does not exists');
        }
        const reservedunit = await user.getUnits({
            where: { id: unitId },
        });
        if (reservedunit.length === 0) {
            throw new Error('User has not reserved this unit');
        }
        //  check reserve count for user and unit last reserved
        const userreservedunitcount = await Reserves.findOne({
            where: { userId: userId, unitId: unitId },
            order: [['reserveDate', 'DESC']],
        });
        if (userreservedunitcount) {
            return res.status(200).json({ msg: "Unit reserved by user", reserveCount: userreservedunitcount.reserveCount });
        }
        return res.status(200).json({ msg: "Unit reserved by user", reservedunit });
    } catch (error) {
        res.status(500).send(error.message);
    }
}; 

const getusersunderunit = async (req, res) => {
    try {
        const { unitId } = req.params;
        const unit = await Unit.findOne({ where: { id: unitId } }); 
        if (!unit) {
            throw new Error('Unit with the specified ID does not exists');
        }
        const users = await unit.getUsers();     
        // check for all latest reserves for each user and return only last reserve
        const userreservedunitcount = await Reserves.findAll({
            where: { unitId: unitId },
            order: [['reserveDate', 'DESC']],
        });

        // return only only last reserve for each user
        const userreservedunitcountunique = userreservedunitcount.filter((item, index, self) => 
            index === self.findIndex((t) => ( 
                t.userId === item.userId
            ))
        )
        return res.status(200).json({ msg: "Users under unit", users, userreservedunitcountunique });
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
    getusersunderunit,
}