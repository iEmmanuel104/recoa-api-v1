const db = require("../../models");
const Property = db.Property;
const Unit = db.Unit;
const User = db.User;
const Op = require("sequelize").Op;

const getAllProperty = async (req, res) => {
    try {
        const properties = await Property.findAll({include: [Unit]});
        res.status(200).json({ properties });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({
            where: { id: id },
            include: [Unit],
        });
        if (property) {
            let sum = 0;
            property.toJSON().Units.forEach((unit) => {
                sum += unit.count
            });
            // property.dataValues.totalUnits = sum;
            return res.status(200).json({
                msg: "Property found",
                totalunits: sum,
                property});
             
        }
        res.status(404).send("Property with the specified ID does not exists");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const createProperty = async (req, res) => {
    try {
        const { name, location, status } = req.body;

        // validate request
        if (!name) {
            throw new Error("Name is required");
        }
        if (!location) {
            throw new Error("Location is required");
        }
        const PropertyAlreadyExists = await Property.findOne({
            where: { name: name },
        });
        if (PropertyAlreadyExists) {
            throw new Error("Property with the specified name already exists");
        }

        const property = await Property.create(
            {
                name,
                location,
                status,
            },
        );
        res.status(201).json({property});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, location, status } = req.body;
        if (name) {
            const NameAlreadyExists = await Property.findOne({
                where: { name: name,},
            });
            if (NameAlreadyExists) {
                throw new Error("Property with the specified name already exists");
            }
        }

        const [updated] = await Property.update(
            {
                name,
                location,
                status,
            },
            {
                where: { id: id },
            },
        );
        if (updated) {
            const updatedProperty = await Property.findOne({ where: { id: id } });
            return res.status(200).json({ property: updatedProperty });
        }
        throw new Error("Property not found");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Property.destroy({
            where: { id: id },
        });
        if (deleted) {
             res.status(200).json({ message: "Property with id: " + id + " deleted" });
        }
        throw new Error("Property not found");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const searchProperty = async (req, res) => {
    try {        
        const { name, location, numericFilters } = req.query;
        const queryobject = {};
        if (numericFilters) {
            const operatorMap = {
                ">": "$gt",
                ">=": "$gte",
                "=": "$eq",
                "<": "$lt",
                "<=": "$lte",
            };
            const regEx = /\b(<|>|>=|=|<|<=)\b/g;
            let filters = numericFilters.replace(
                regEx,
                (match) => `-${operatorMap[match]}-`
            );
            const options = ["price", "status", "units"];
            filters = filters.split(",").forEach((item) => {
                const [field, operator, value] = item.split("-");
                if (options.includes(field)) {
                    queryobject[field] = { [operator]: parseFloat(value) };
                }
            });
        }


        const property = await Property.findAll({
            where: {
                [Op.or]: [
                    // { name: { [Op.like]: `%${name}%` } },
                    { location: { [Op.like]: `%${location}%` } },
                ],
                ...queryobject,
            },
        });

        if (property) {
            return res.status(200).json({ property });
        }
        res.status(404).send("Property with the specified ID does not exists");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const joinPropertyWaitlist = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { userId } = req.body;
        const property = await Property.findOne({
            where: { id: id },
        });
        if (!property.status === "waitlist") {
            throw new Error("Property is not in waitlist, cannot join");
        }
        const user = await User.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("User does not exist");
        }
        const userAlreadyJoined = await User.findOne({
            where: { id: userId },
            include: [
                {
                    model: Property,
                    where: { id: propertyId },
                },
            ],
        });
        if (userAlreadyJoined) {
            throw new Error("User already joined waitlist");
        }
        await user.addProperty(property);
        res.status(200).json({ message: "User joined waitlist" });
    } catch (error) {
        res.status(500).send(error.message);
    }
};





module.exports = {
    getAllProperty,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperty,
    joinPropertyWaitlist,
};

