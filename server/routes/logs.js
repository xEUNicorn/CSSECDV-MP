const express = require('express');
const path = require('path');
const router = express.Router();

router.post('', async (req, res) =>{
    // usually this is where you will add the logs to the database
    //pathing is post('/logs') -> you can change this sa app.js line 106

    /*
    try {
        var { orderId, senderName, receiverName, senderNum, receiverNum,
              itemNum, itemDesc, itemPrice, 
              transDate, originBranch, destBranch,
              initialCharge, discount, total, 
              status, arrivalDate, updates} = req.body;

        if (!senderName || !receiverName) {
            logger.warn({
                event : 'VALIDATION_FAIL',
                reason: 'Missing sender/receiver name',
                ip : rep,ip
            });
        }
        var intSenderNum = parseInt(senderNum);
        var intReceiverNum = parseInt(receiverNum);
        var floatCharge = parseFloat(initialCharge);
        var floatDiscount = parseFloat(discount);
        var floatTotal = parseFloat(total);
        // placeholder til may customer accounts na tayo
        const customerID = String(intSenderNum);            
        
        var addOrder = new Order({
            userId : customerId,
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
    */
})

module.exports = router;