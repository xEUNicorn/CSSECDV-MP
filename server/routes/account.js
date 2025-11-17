const express = require('express');
const path = require('path');
const router = express.Router();
const { hashPassword } = require('../middleware/loginSecurity');

const User = require('../models/User.js');

// view of the create account page
router.get('/', async (req, res) =>{
    const pathFrom = req.query.from;

    if (pathFrom) {
        req.session.from = pathFrom;
        return res.redirect('/create_account');
    }
    res.render('create_account', {layout: "account.hbs", title: "Create Account | ESMC", css:"create_account", 
                                  path: req.session.from || null});
})

// used to get the latest user id and return a new one for the new account
router.post('/generate', async (req, res) =>{
    try {
        const latest = await User.findOne().sort({userId: -1});
        var nextUserId = latest ? latest.userId + 1 : 100001;
        
        res.json({success: true, userId: nextUserId});
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send({success: false, message: "Server Error"});
    }
})

// used to check whether username is unique or not 
// NOTE: Username is case insensitive
router.post('/unique-username', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username: username });
        var isExisting = false;

        if (user) {
            isExisting = true;
        }
        
        res.json({success: true, exists: isExisting});
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send({success: false, message: "Server Error"});
    }
})

// used to add the initial information of the user to the database without the security questions
router.post('/register', async (req, res) => {
    try {
        const { userId, username, name, phoneNumber, password, securityQuestions, secAns1, secAns2, secAns3, date } = req.body;

        const hashedPass = await hashPassword(password)
        const hashedsecAns1 = await hashPassword(secAns1)
        const hashedsecAns2 = await hashPassword(secAns2)
        const hashedsecAns3 = await hashPassword(secAns3)

        // Create new user
        const newUser = new User({
            userId: userId,
            username,
            name,
            phoneNumber,
            password: hashedPass, 
            status: "Customer", // Default status
            securityQuestions,
            secAns1: hashedsecAns1,
            secAns2: hashedsecAns2,
            secAns3: hashedsecAns3,
            passwordHistory: [],
            lastChanged: date,
            failedLoginAttempts: 0,
            accountLocked: false,
            loginHistory: []
        });

        await newUser.save();
        console.log('User registered:', newUser);
        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({success: false, error: 'Server error during registration' });
    }
});


module.exports = router;