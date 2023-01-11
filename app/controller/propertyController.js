const db = require("../../models");
const Property = db.Property;
const Unit = db.Unit;     
const Waitlist = db.Waitlist;
const { sequelize, Sequelize } = require('../../models');
const Op = require("sequelize").Op;
const path = require('path');
const uploadtocloudinary = require('../middlewares/cloudinary').uploadtocloudinary;

const getAllProperty = async (req, res) => {
    try {
        const properties = await Property.findAll();
        res.status(200).json({ properties });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({
            where: { id: id }
        });
        if (!property) {
            res.status(404).send("Property with the specified ID does not exists");
        }
        // sum all property unit count
        if (property.Units) {
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
        res.status(200).json({msg: "Property found", property });

    } catch (error) {
        res.status(500).send(error.message);
    }
};

const createProperty = async (req, res) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const { name, location, status, description } = req.body;

            // console.log (req.files)

            // validate request
            if (!name) {
                throw new Error("Name is required");
            }
            if (!location) {
                throw new Error("Location is required");
            }
            if (!description) {
                throw new Eror("Property Description is required");
            }
            if (!status) {
                throw new Error("Status is required");
            }
            if (!req.files) {
                throw new Error("Property Image is required");
            }
            if (!req.files.length > 5) {
                throw new Error("Maximum of 5 images allowed");
            }
        

            const PropertyAlreadyExists = await Property.findOne({
                where: { name: name },
            });
            if (!PropertyAlreadyExists) {

            var bufferarray = [];
            for (let i = 0; i < req.files.length; i++) {
                var localfilepath = req.files[i].path;
                var originalname = req.files[i].originalname;
                var uploadresult = await uploadtocloudinary(localfilepath, originalname);
                // check for success response
                if (uploadresult.message === 'error') {
                    return next(new CustomError.BadRequestError(uploadresult.message));
                }
                if (uploadresult.message === 'success') {
                    bufferarray.push(uploadresult.url);
                }
            }
            if (bufferarray.length === 0) {
                return next(new CustomError.BadRequestError("Error uploading images to cloudinary"));
            };            
                const property = await Property.create(
                    {
                        name,
                        location,
                        status,
                        description,
                        images: bufferarray
                    },
                    { transaction: t }
                );

                return res.status(201).json({property, msg: "Property created successfully"});
            }
            throw new Error("Property with specified name already exists");
            });
 
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getpropertyimages = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({
            where: { id: id },
        });
        if (!property) {
            res.status(404).send("Property with the specified ID does not exists");
        }
        if (!property.images) {
            throw new Error('No images were found for this property')
        }
        return res.status(200).json({ images: property.images });

    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

const updateProperty = async (req, res) => {
    try {
        const result = await sequelize.transaction(async (t) => {
        const { id } = req.params;
            let { name, location, status, description } = req.body;
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
                    description
                },
                {
                    where: { id: id },
                },
                { transaction: t }
            );
            if (updated) {
                const updatedProperty = await Property.findOne({ where: { id: id } });
                return res.status(200).json({ property: updatedProperty });
            }
            throw new Error("Property not found");
        });
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
                [Op.and]: [
                    { name: { [Op.like]: `%${name}%` } },
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
        const { id } = req.params;
        const { name, organisation, phone, email, location, date, budget, comments } = req.body;
        const property = await Property.findOne({
            where: { id: id },
        });
        const waitlisted = await Waitlist.findOne({
            where: { email: email },
            include: [{
                model: Property,
                as: "properties",
                where: { id: id },
            }],
        });
        if (waitlisted) {
            throw new Error("You are already in the waitlist");
        }

        if (property.status === "waitlist") {
            const waitlist = await Waitlist.create({
                name,
                organisation,
                phone,
                email,
                location,
                date,
                budget,
                comments,
            });
            await property.addWaitlist(waitlist);   
            return res.status(200).json({ waitlist });
        }
        res.status(404).send("Property is not in waitlist");
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

const getPropertyWaitlist = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({
            where: { id: id },
            include: [{
                model: Waitlist,
                as: "waitlists",
            }],

        });
        const waitlists = property.waitlists;
        if (waitlists) {
            return res.status(200).json({waitlists });
        }
        res.status(404).send("Property with the specified ID does not exists");
    } catch (error) {
        res.status(500).send(error.message);
    }
};








module.exports = {
    getAllProperty,
    getPropertyById,
    createProperty,
    getpropertyimages,
    updateProperty,
    deleteProperty,
    searchProperty,
    joinPropertyWaitlist,
    getPropertyWaitlist,
};

