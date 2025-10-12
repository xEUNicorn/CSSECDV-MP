const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../models/User.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Sessions = require('../models/Sessions.js');
require('../config/passport.js')

//const User = require('../models/User.js');
const Order = require('../models/Order.js');
const Update = require('../models/Update.js');

checkAuthenticated = (req,res, next) => {
    if(req.user){
        return next();
    }
    res.redirect('/admin/login');
}

/* LOGIN */
router.get('/', async (req, res) =>{
    if(req.user){
        res.redirect('/admin/view-orders')
    }
    res.render('login', {layout: "login.hbs", title: "Login | ESMC", css:"login"});
})

router.get('/login', async (req, res) =>{
    if(req.user){
        res.redirect('/admin/view-orders')
    }
    res.render('login', {layout: "login.hbs", title: "Login | ESMC", css:"login"});
})


router.post('/login', passport.authenticate('local', { successRedirect : '/admin/view-orders', failureRedirect : '/admin/login' }), function(req, res, next){
});


/* === */


/* SUMMARY OF ORDERS */
router.get('/view-orders', checkAuthenticated, async (req, res) =>{
    try {
        const orders = await Order.find();
        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders });
    }
    catch (error)
    { 
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
})

router.post('/view-orders/more-details', checkAuthenticated, async (req, res) => {
    try {
        const { id } = req.body
        const orderDetails = await Order.findOne({ orderId: id });

        var updateDate = "";
        if (orderDetails.updates && orderDetails.updates.length > 0) {
            const lastItem = orderDetails.updates[orderDetails.updates.length - 1]; //latest update
            const findUpdate = await Update.findOne({ updateId: lastItem });
            updateDate = findUpdate.updateDate;
        }
        
        res.json({
            orderDetails: { 
                ...orderDetails.toObject(),
                date: updateDate  // Add the date part to orderDetails
            }
        });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
})

router.get('/view-orders/control-id', checkAuthenticated, async (req, res) => {
    try {
        const controlId = (req.query.controlId).toUpperCase();
        const orders = await Order.find({ "orderId": {$regex : controlId} });
        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/view-orders/hub-to-hub', checkAuthenticated, async (req, res) => {
    try {
        const originSearch = req.query.originSearch;
        const destSearch = req.query.destSearch;
        const orders = await Order.find({
            "originBranch": { $regex: originSearch },
            "destBranch": { $regex: destSearch }
        });
        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/view-orders/daily-net', checkAuthenticated, async (req, res) => {
    try {
        var tempDaySearch = req.query.daySearch;
        var year = '-' + tempDaySearch.substr(0, 4);
        tempDaySearch = tempDaySearch.replace(tempDaySearch.substr(0, 5), '') + year;
        const daySearch = tempDaySearch;
        //console.log(daySearch);

        const orders = await Order.find({
            "transDate": { $regex: daySearch }
        });

        const dailyNet = await Order.aggregate([
            {
                $match: {
                    transDate: { $regex: daySearch }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSum: { $sum: '$total' }
                }
            }
        ]);
        
        const net = dailyNet.length > 0 ? dailyNet[0].totalSum : 0; //in case date is not existing

        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders, netIndicator: true, net: net });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/view-orders/monthly-net', checkAuthenticated, async (req, res) => {
    try {
        var monthSearch = req.query.monthSearch;
        const month = monthSearch.substr(5, 7) + '-';
        const year = '-' + monthSearch.substr(0, 4);
        const monthRegex = new RegExp(month + "[0-9]*" + year);
        console.log(monthRegex);
        const orders = await Order.find({
            "transDate": { $regex: monthRegex }
        });
        const monthlyNet = await Order.aggregate([
            {
                $match: {
                    transDate: { $regex: monthRegex }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSum: { $sum: '$total' }
                }
            }
        ]);

        const net = monthlyNet.length > 0 ? monthlyNet[0].totalSum : 0; //in case date is not existing

        if(monthSearch.indexOf('-') === -1)
            console.log("test");

        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders, netIndicator: true, net: net });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/view-orders/annual-net', checkAuthenticated, async (req, res) => {
    try {
        const yearSearch = req.query.yearSearch;
        const orders = await Order.find({
            "transDate": { $regex: yearSearch }
        });
        const annualNet = await Order.aggregate([
            {
                $match: {
                    transDate: { $regex: yearSearch }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSum: { $sum: '$total' }
                }
            }
        ]);

        const net = annualNet.length > 0 ? annualNet[0].totalSum : 0; //in case date is not existing

        res.render('view_database', { layout: "admin.hbs", title: "View Orders | ESMC", css: "view_database", orders: orders, netIndicator: true, net: net });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
});

/* === */

/* ADD ORDER */
router.get('/create-order', checkAuthenticated, checkAuthenticated, async (req, res) =>{
    res.render('order_form', {layout: "admin.hbs", title: "Order Form", css:"order_form"});
})

router.post('/add-order', checkAuthenticated,    async (req, res) =>{
    try {
        var { orderId, senderName, receiverName, senderNum, receiverNum,
              itemNum, itemDesc, itemPrice, 
              transDate, originBranch, destBranch,
              initialCharge, discount, total, 
              status, arrivalDate, updates} = req.body;
        var intSenderNum = parseInt(senderNum);
        var intReceiverNum = parseInt(receiverNum);
        var floatCharge = parseFloat(initialCharge);
        var floatDiscount = parseFloat(discount);
        var floatTotal = parseFloat(total);
        var addOrder = new Order({
            orderId : orderId,
            senderName : senderName,
            receiverName : receiverName,
            senderNum : intSenderNum,
            receiverNum : intReceiverNum,

            itemDesc : itemDesc,
            itemNum : itemNum,
            itemPrice : itemPrice,
        
            transDate : transDate,
            originBranch : originBranch,
            destBranch : destBranch,

            initialCharge : floatCharge,
            discount : floatDiscount,
            total : floatTotal,

            status : status,
            arrivalDate : arrivalDate,
            updatedBy : "---",
            updates : updates  
        });

        await addOrder.save();
        console.log('Order saved:', addOrder);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
        res.json({ success: false });
    }
    
})

router.post('/validate', async (req, res) => {
    try {
        const { prefix } = req.body; // first three characters
        console.log("PREFIX", prefix);
        const matchingOrders = await Order.find(
            { orderId: { $regex: `^${prefix}` } }, 
            { orderId: 1, _id: 0 }
        );

        console.log("FOUND THE FOLLOWING:", matchingOrders);
                                        // Return the matching order IDs
        res.json({ success: true, orders: matchingOrders.map(order => order.orderId) });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
})

/* === */

/* EDIT ORDERS */
router.get('/edit-order/:orderId', async (req, res) =>{
    const order = req.params.orderId;
    const specificOrder = await Order.findOne({ orderId: order});

    var isOriginBranch = {
        Manila: specificOrder.originBranch === "Manila",
        Romblon: specificOrder.originBranch === "Romblon",
        Magdiwang: specificOrder.originBranch === "Magdiwang",
        Cajidiocan: specificOrder.originBranch === "Cajidiocan",
        Fernando: specificOrder.originBranch === "San-Fernando"
    }

    var isDestBranch = {
        Manila: specificOrder.destBranch === "Manila",
        Romblon: specificOrder.destBranch === "Romblon",
        Magdiwang: specificOrder.destBranch === "Magdiwang",
        Cajidiocan: specificOrder.destBranch === "Cajidiocan",
        Fernando: specificOrder.destBranch === "San-Fernando"
    }

    var [month, day, year] = specificOrder.transDate.split("-");
    var date = `${year}-${month}-${day}`;

    var sender = specificOrder.senderNum.toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    var receiver = specificOrder.receiverNum.toString().replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");

    var combinedItems = specificOrder.itemDesc.map((description, index) => ({
        description,
        quantity: specificOrder.itemNum[index],
        price: specificOrder.itemPrice[index]
    }));

    orderDetails = {
        orderId: order,
        senderName: specificOrder.senderName,
        receiverName: specificOrder.receiverName,
        senderNum: sender,
        receiverNum: receiver,

        items: combinedItems,

        transDate: date,
        originBranch: isOriginBranch,
        destBranch: isDestBranch,

        initialCharge: specificOrder.initialCharge,
        discount: specificOrder.discount,
        total: specificOrder.total
    }

    res.render('edit_order', { layout: "admin.hbs", title: "Edit Order | ESMC", css: "edit_order",
                               orderDetails: orderDetails});
})

router.post('/edit-order', async (req, res) =>{
    try {
        var { orderId, senderName, receiverName, senderNum, receiverNum,
                itemNum, itemDesc, itemPrice, 
                transDate, originBranch, destBranch,
                initialCharge, discount, total} = req.body;
        var intSenderNum = parseInt(senderNum);
        var intReceiverNum = parseInt(receiverNum);
        var floatCharge = parseFloat(initialCharge);
        var floatDiscount = parseFloat(discount);
        var floatTotal = parseFloat(total);

        var changes = {
            senderName : senderName,
            receiverName : receiverName,
            senderNum : intSenderNum,
            receiverNum : intReceiverNum,

            itemDesc : itemDesc,
            itemNum : itemNum,
            itemPrice : itemPrice,
        
            transDate : transDate,
            originBranch : originBranch,
            destBranch : destBranch,

            initialCharge : floatCharge,
            discount : floatDiscount,
            total : floatTotal,
        };

        const updatedOrder = await Order.findOneAndUpdate({ orderId: orderId}, changes, {new: true});

        if (!updatedOrder) {
            return res.status(404).send("Order not found");
        }

        console.log('Order saved:', updatedOrder);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
})
/* === */

/* UPDATE ORDERS */
router.post('/update-order', checkAuthenticated, checkAuthenticated, async (req, res) => {
    try {
        var { id, newStatus, newEDA, newDate, newTime, statusDesc } = req.body;
        
        //add update info first
        var newUpdateId = 0;
        try {   //obtain last updateID entry
            const lastID = await Update.findOne().sort({ updateId: -1 }).exec();
            newUpdateId = lastID ? lastID.updateId + 1 : 30001;
        } catch (err) {
            console.error("Error fetching last numberId:", err);
        }

        var addUpdate = new Update({
            updateId : newUpdateId,
            status: newStatus,
            statusDesc : statusDesc,
            updateDate : newDate,
            updateTime : newTime,
        });

        await addUpdate.save(); //add this to database

        //save these information to order database
        var changes = {
            $set: {
                status: newStatus,
                arrivalDate: newEDA,
                updatedBy: req.user.hubName
            },
            $push: { updates: newUpdateId }
        };

        console.log(changes);
        const updatedOrder = await Order.findOneAndUpdate({ orderId: id }, changes, {new: true});
        if (!updatedOrder) {
            return res.status(404).send("Order not found");
        }

        res.json({ success: true });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
})
/* === */

/* DELETE ORDERS */
router.post('/delete-order', checkAuthenticated, checkAuthenticated, async (req, res) => {
    try {
        var { id } = req.body;
        const order = await Order.findOne({ orderId: id });
        if (order && order.updates && order.updates.length > 0) {
            await Update.deleteMany({ updateId: { $in: order.updates } });
        }
        await Order.deleteOne({ orderId: id });

        res.json({ success: true });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).send("Server Error");
    }
})
/* === */

router.get('/logout', (req, res, next) => {
    req.logout((err)=> {
        if (err) {return next(err)};
        res.redirect('/admin');
    });
})

module.exports = router;