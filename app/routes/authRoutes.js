const express = require('express');
const router = express.Router();
const permit = require('../middlewares/permissions');
const {
    registerAdmin,
    verifyAdmin,
    Adminlogin,
    Adminlogout,
    Createinvestor,
    Investorlogin,
    GetAllInvestors

} = require('../controller/userController.js');


//user routes
router.post('/register', registerAdmin);
router.post('/verify', verifyAdmin);
router.post('/login', Adminlogin);
router.post('/logout', permit("admin"), Adminlogout);
router.post('/createinvestor', permit("admin"), Createinvestor);
router.post('/investorlogin', Investorlogin);
router.get('/investors', GetAllInvestors)

module.exports = router;