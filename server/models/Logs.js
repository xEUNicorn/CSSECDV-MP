const mongoose = require('mongoose')

const LogsSchema = new mongoose.Schema({
    timestamp: String,        // format: ''
    description: String,      //
    //add more if u want
})

const Logs = mongoose.model('Logs', LogsSchema)

module.exports = Logs