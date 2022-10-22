const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const app = express();
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const propertyRoutes = require('./app/routes/propertyRoutes.js');
const authRoutes = require('./app/routes/authRoutes.js');

// const corsOptions ={
//     origin:'http://127.0.0.1:5000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }


// app.use(cors(corsOptions));
// app.use(morgan('dev'));
// app.use(express.json());
// app.use((req, res, next) => {
//     const allowedOrigins = ["https://iemmanuel104.github.io", "http://127.0.0.1:5000"];
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }

//     res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.header('Access-Control-Allow-Credentials', true);

//     next();
// });

app.use(cors());

app.use(bodyParser.json());
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


app.get("/", (req, res) => {
    res.json({ message: "Welcome to RECOA application." });
});


app.use('/api/property', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler)


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