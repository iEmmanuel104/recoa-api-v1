const db = require("../../models");
const Property = db.Property;
const Unit = db.Unit;
const User = db.User;
const Op = require("sequelize").Op;
const asyncWrapper = require('../utils/asyncWrapper')
const { BadRequestError, NotFoundError } = require('../utils/errors')

const getAllProperty = asyncWrapper(async (req, res) => {
    const properties = await Property.findAll({ include: [Unit] });
    res.status(200).json({ properties });
});

const getPropertyById = asyncWrapper(async (req, res, next) => {
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
            property
        });
    }
    throw new NotFoundError('Property with the specified ID does not exists')
});

const createProperty = asyncWrapper(async (req, res, next) => {
    const { name, location, status } = req.body;

    // validate request
    if (!name) throw new BadRequestError('Name is required');
    if (!location) throw new BadRequestError("Location is required");

    const PropertyAlreadyExists = await Property.findOne({ where: { name: name } });
    if (PropertyAlreadyExists) throw new BadRequestError("Property with the specified name already exists");

    const property = await Property.create(
        {
            name,
            location,
            status,
        },
    );
    res.status(201).json({ property });
});

const updateProperty = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    let { name, location, status } = req.body;
    if (name) {
        const NameAlreadyExists = await Property.findOne({
            where: { name: name, },
        });
        if (NameAlreadyExists) {
            throw new BadRequestError("Property with the specified name already exists");
        }
    }

    const [updated] = await Property.update(
        { name, location, status, },
        { where: { id: id } },
    );
    if (updated) {
        const updatedProperty = await Property.findOne({ where: { id: id } });
        return res.status(200).json({ property: updatedProperty });
    }
    throw new BadRequestError("Property not found");
});

const deleteProperty = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Property.destroy({
        where: { id: id },
    });
    if (deleted) {
        res.status(200).json({ message: "Property with id: " + id + " deleted" });
    }
    throw new BadRequestError("Property not found");
});

const searchProperty = asyncWrapper(async (req, res, next) => {
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

    throw new NotFoundError('Property with the specified ID does not exists')
});

const joinPropertyWaitlist = asyncWrapper(async (req, res, next) => {
    const { propertyId } = req.params;
    const { userId } = req.body;
    const property = await Property.findOne({
        where: { id: id },
    });

    if (!property.status === "waitlist") {
        throw new BadRequestError("Property is not in waitlist, cannot join");
    }

    const user = await User.findOne({
        where: { id: userId },
    });

    if (!user) throw new BadRequestError("User does not exist");

    const userAlreadyJoined = await User.findOne({
        where: { id: userId },
        include: [
            {
                model: Property,
                where: { id: propertyId },
            },
        ],
    });
    if (userAlreadyJoined) throw new BadRequestError("User already joined waitlist");

    await user.addProperty(property);

    res.status(200).json({ message: "User joined waitlist" });
});


module.exports = {
    getAllProperty,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperty,
    joinPropertyWaitlist,
};

