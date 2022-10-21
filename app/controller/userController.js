const db = require("../../models");
const Property = db.Property;
const Unit = db.Unit;
const User = db.User;
const Op = require("sequelize").Op;
const bcrypt = require("bcryptjs");
const authService = require("../middlewares/auth.service.js");
const { sendMail } = require("../middlewares/sendMail.js");
const dotenv = require("dotenv");
const generatePassword = require('../middlewares/StringGenerator.js');

const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, user_type } = req.body;
        // generate code for verification
        let usercode = Math.floor(100000 + Math.random() * 90000);
        let admincode = Math.floor(Math.random()* (999999-100000+1)) + 100000;
        const verification_code = await usercode.toString() + admincode.toString();
        console.log(verification_code);
        // check if email already exists
        const userExist = await User.findOne({ where: { email } });
        if (userExist) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // send verification code to email
        const mailOptions = {
            email: email,
            title: "RECOA Verification Code",
            message: `Your verification code is ${usercode}`,
        };
        await sendMail(mailOptions);

        const mailOptions2 = {
            email: process.env.EMAIL_RECEIVER_ADDRESS,
            title: "RECOA Admin request Verification Code",
            message: `New Admin request for ${username},
            ----------------------------------------------
                     verification code is ${admincode}`,
        };
        await sendMail(mailOptions2);

        const user = await User.create({
            username,
            email,
            password,
            user_type,
            verification_code
        });
        res.status(201).json({ 
            message: "User created, verification code sent to email, please verify" ,
            user });
        

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const verifyAdmin = async (req, res) => {
    try {
        const { email, usercode, admincode } = req.body;
        const verification_code = await usercode.toString() + admincode.toString();
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        if (user.verification_code !== verification_code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        user.user_type = "admin";
        user.verification_code = null;

        await user.save();
        res.status(200).json({ message: "User verified, You can proceed to login" });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const Adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        if (user.user_type !== "admin") {
            return res.status(400).json({ message: "User is not an admin" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const REFRESH_TOKEN = await authService().issue_RefreshToken({ 
            id: user.id,
            email: user.email,
            user_type: user.user_type,
         });
         const ACCESS_TOKEN = await authService().issue_AccessToken({
            id: user.id,
            email: user.email,
            user_type: user.user_type,
         });
        res.status(200).json({
            message: "Login successful", 
            RefreshToken: REFRESH_TOKEN,
            AccessToken: ACCESS_TOKEN 
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const Adminlogout = async (req, res) => {
    try {
        const { RefreshToken, AccessToken  } = req.body;
        const user = await User.findOne({ where: { refreshToken } });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        user.refreshToken = null;
        await user.save();
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const Createinvestor = async (req, res) => {
    try {
        const { username, user_type, email } = req.body;
        const user = await User.findOne({ where: { username } });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (user_type !== "investor") {
            return res.status(400).json({ message: "You can only create an investor" });
        }
        // generate passwrod
        const password = "RECOA" + generatePassword(8);

        console.log(password);

        const newInvestor = await User.create({
            username,
            user_type,
            email,
            password
        });

        const mailOptions = {
            email: email,
            title: "RECOA property Resesrvation Password",
            message: `Your password is ${password}`,
        };
        await sendMail(mailOptions);

        res.status(201).json({ message: "New Investor has been created, password sent to email",
        newInvestor });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const Investorlogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }
        if (user.user_type !== "investor") {
            return res.status(400).json({ message: "User is not an investor" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const REFRESH_TOKEN = await authService().issue_RefreshToken({
            id: user.id,
            username: user.username,
            user_type: user.user_type,
        });
        const ACCESS_TOKEN = await authService().issue_AccessToken({
            id: user.id,
            username: user.username,
            user_type: user.user_type,
        });
        res.status(200).json({
            message: "Login successful",
            RefreshToken: REFRESH_TOKEN,
            AccessToken: ACCESS_TOKEN
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    registerAdmin,
    verifyAdmin,
    Adminlogin,
    Adminlogout,
    Createinvestor,
    Investorlogin
}