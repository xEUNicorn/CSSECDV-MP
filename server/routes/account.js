const express = require('express');
const path = require('path');
const router = express.Router();

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
router.post('/unique-username', async (req, res) =>{
    try {
        const { username } = req.body;
        const user = await User.findOne({ where: { username }});
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
router.post('/initial-user')


module.exports = router;