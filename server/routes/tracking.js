const express = require('express');
const path = require('path');
const router = express.Router();

const Order = require('../models/Order.js');
const Update = require('../models/Update.js');

const passport = require('passport');
const setViewData = require('../middleware/viewData');
require('../config/passport');

// Apply view data middleware to all tracking routes
router.use(setViewData);

router.get('/', (req, res, next) => {
    if (!req.user) {
        return res.redirect('/search_parcel/login');
    }
    next();   
});

router.get('/', async (req, res) =>{
    res.render('search_parcel', {title: "Search | ESMC", css:"search_parcel", user: req.user});
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/search_parcel/login');
    });
})

router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/search_parcel');
    }
    res.render('login', {
        layout : 'login.hbs',
        title  : 'Login | ESMC',
        css    : 'login',
        path   : 'search_parcel'
    });
});

// with custom error callback to the login page
router.post('/login', async (req, res, next) => {
    passport.authenticate('local', async (error, user, info) => {
        if (error) {
            return next(error);
        }

        if (!user) { // alternative to failureRedirect but with custom message
            return res.render('login', {layout: "login.hbs", title: "Login | ESMC", css:"login", path:"search_parcel", error: info.message});
        }

        if (user.status !== 'Customer') {
            return res.render('login', {layout: "login.hbs", title: "Login | ESMC", css:"login", path:"search_parcel", error: "Invalid username or password."});
        }

        // Get last login attempt info before logging in
        const { getLastLoginAttemptInfo } = require('../middleware/loginSecurity');
        const lastAttemptInfo = await getLastLoginAttemptInfo(user.username);

        // alternative to successRedirect
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Store last login attempt info in session for notification
            if (lastAttemptInfo) {
                req.session.lastLoginAttemptInfo = lastAttemptInfo;
            }
            return res.redirect('/search_parcel');
        })
    })(req, res, next); // let the request proceed instead of just checking it
})

router.post('/', async (req, res) =>{
    try {
        const { id } = req.body;
        if(!req.user) { 
            return res.status(401).json({exists:false}); 
        }  
        const trackerId = await Order.findOne({
            orderId : id,
            userID  : req.user.employeeId
        });
        res.json({ exists: Boolean(trackerId) });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ exists: false });
    }
})

router.get('/track=:id', async (req, res) =>{
    if(!req.user) {
        return res.redirect('/search_parcel/login'); 
    }
    const id = req.params.id;
    console.log(id);
    try {
        const order = await Order.findOne({ 
            orderId : id, 
            userID : req.user.employeeId
        });
        if (!order) {
            return res.redirect('/search_parcel');
        }
        res.render('search_results', {title: "Search Results | ESMC", 
                                      css:"search_results", 
                                      trackerId: order.orderId, 
                                      status: order.status, 
                                      estDate: order.arrivalDate, 
                                      branch: order.originBranch,
                                      user: req.user});
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
})

router.get('/track=:id/more-details', async (req, res) =>{
    if(!req.user){ 
        return res.redirect('/search_parcel/login'); 
    }
    const id = req.params.id;
    try {
        const order = await Order.findOne({ 
            orderId: id,
            userID : req.user.employeeId
        });
        if (!order) {
            return res.redirect('/search_parcel');
        }

        var allUpdates = [];
        for (var i = order.updates.length - 1; i >= 0; i--) {
            const update = await Update.findOne({ updateId : order.updates[i]});
            var [month, day, year] = update.updateDate.split('-');
            var dateStr = toMonthStr(parseInt(month)) + day + ", " + year;

            const addUpdate = {
                title: update.status,
                date: dateStr,
                time: update.updateTime,
                description: update.statusDesc
            };
            allUpdates.push(addUpdate);
        }

        if (allUpdates.length === 0) {
            const addUpdate = {
                title: "ORDER SUBMITTED!",
                date: " ",
                time: " ",
                description: "Kindly wait for updates..."
            };
            allUpdates.push(addUpdate);
        }

        var orderStatus = order.status
        var progressClass = ""
        
        if(orderStatus === "PROCESSING"){
            progressClass = "progress1"
        } else if(orderStatus === "IN TRANSIT"){
            progressClass = "progress2"
        } else if(orderStatus === "READY FOR PICKUP"){
            progressClass = "progress3"
        } else if(orderStatus === "DELIVERED"){
            progressClass = "progress4"
        }

        res.render('details', {title: "Parcel Details",
                               css:"details", 
                               id: order.orderId,
                               progress: progressClass, 
                               estDate: order.arrivalDate, 
                               update: allUpdates,
                               user: req.user});
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
})

module.exports = router;

//Helper functions
function toMonthStr(number) {
    switch (number) {
        case 1:
            return "January ";
        case 2:
            return "February ";
        case 3:
            return "March ";
        case 4:
            return "April ";
        case 5:
            return "May ";
        case 6:
            return "June ";
        case 7:
            return "July ";
        case 8:
            return "August ";
        case 9:
            return "September ";
        case 10:
            return "October ";
        case 11:
            return "November ";
        case 12:
            return "December ";
        default:
            return "Error "; //unlikely but will still put
    }
}
    
