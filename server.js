const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));



// const db = require("./app/config/db.config.js");

// Test the db connection
db.sequelize.authenticate()  
    .then(() => {
        console.log('postgres connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
    
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to RECOA application." });
    });

// routes
const propertyRoutes = require('./app/routes/propertyRoutes.js');
app.use('/api/property', propertyRoutes);
const authRoutes = require('./app/routes/authRoutes.js');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8080;

// force: true will drop the table if it already exists
db.sequelize.sync(/**{force:true}**/).then(() => {
    console.log('Dropped all tables: All models were synchronized successfully');
    // set port, listen for requests
    app.listen(PORT, () => {
        console.log("Server is running on port 8080.");
        }
    );
});