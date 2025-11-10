const mongoose = require('mongoose')

const LogsSchema = new mongoose.Schema({
    timestamp: String,        // format: ''
    category: String,         // like Error, Info, Account, etc 
    description: String,      //
    //add/change more if u want
    //sample lang yung nasa taas hehe
})

const Logs = mongoose.model('Logs', LogsSchema)

module.exports = Logs