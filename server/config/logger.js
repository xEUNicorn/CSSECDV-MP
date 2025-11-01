// logs json to .logs/app.log
// not console output
// tail -f logs/app.log
const {
  createLogger,
  format,
  transports } = require('winston');

const {
  combine,
  timestamp,
  json ) = format;

const logger = createLogger({
  level   : 'info',
  format  : combine(timestamp(), json()),
  transports: [
    new transports.File({ filename: 'logs/app.log', level: 'info' }) 
  ]
});

module.exports = logger;
  

