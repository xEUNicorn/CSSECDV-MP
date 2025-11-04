const express = require('express');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcrypt');
//const { formatDateTime } = require('../middleware/loginSecurity');

const User = require('../models/User.js');

// view of the create account page
router.get('/', async (req, res) =>{
    res.render('create_account', {layout: "account.hbs", title: "Create Account | ESMC", css:"create_account"});
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
        const { userId, username, name, password, securityQuestions, secAns1, secAns2, secAns3 } = req.body;

        const hashedPass = await hashStrings(password)
        const hashedsecAns1 = await hashStrings(secAns1)
        const hashedsecAns2 = await hashStrings(secAns2)
        const hashedsecAns3 = await hashStrings(secAns3)

        const sample = await hashStrings("String")
        console.log(sample)

        // Create new user
        const newUser = new User({
            userId: userId,
            username,
            name,
            password: hashedPass, 
            status: "Customer", // Default status
            securityQuestions,
            secAns1: hashedsecAns1,
            secAns2: hashedsecAns2,
            secAns3: hashedsecAns3,
            passwordHistory: [],
            lastChanged: ' ',
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

async function hashStrings(toBeHashed) {
    const saltRounds = 12; //higher means better security
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(toBeHashed, salt);
        return hash;
    } catch (error) {
        console.error("Error in generating the hash:", error);
        return null;
    }
    
}