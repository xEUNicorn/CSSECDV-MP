const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    //user inputs
    senderId : Number,
    receiverId : Number,
    orderId : String,
    senderName : String,
    receiverName : String,
    senderNum : Number,
    receiverNum : Number,
    itemDesc : [],
    itemNum : [],
    itemPrice : [],
    transDate : String,         //date of transport
            //format: mm-dd-yyyy
    originBranch : String,
    destBranch : String,         //destination branch
    initialCharge : Number,
    discount : Number,
    total : Number,

    //to be updated / automatic assignment
    status : {                  //dynamic based on latest update
        type: String,
        enum: ["PROCESSING", "IN TRANSIT", "READY FOR PICKUP", "DELIVERED"],
        default: "PROCESSING",
    },
    arrivalDate : String,       //estimated
    updatedBy : String,         //hub name
    updates : []                //add updateIds here
})

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order
