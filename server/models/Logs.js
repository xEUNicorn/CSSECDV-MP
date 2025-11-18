const mongoose = require('mongoose')

const LogsSchema = new mongoose.Schema({
    timestamp: String,        
    category: String,         
    description: String,      
})

LogsSchema.index({ timestamp:1 }, { expireAfterSeconds: 60*60*24*90 }); // purge after 90 days

const Logs = mongoose.model('Logs', LogsSchema)

module.exports = Logs
