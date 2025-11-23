const Logs = require('../models/Logs');

function write(level, payload) {
  const doc = new Logs({
    timestamp: new Date().toISOString(),
    category : level,                       
    description: JSON.stringify(payload, null, 2)
  });
  doc.save().catch(console.error);

  if (level !== 'INFO') {
    console[level === 'ERROR' ? 'error' : 'warn']('[LOG]', payload);
  }
}

module.exports = {
  info : (p) => write('INFO',  p),
  warn : (p) => write('WARN',  p),
  error: (p) => write('ERROR', p)
};