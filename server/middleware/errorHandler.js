const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, _next) {
  logger.error({
    event :'UNHANDLED_EXCEPTION',
    message: err.message,
    stack : err.stack,
    ip    : req.ip,
    path  : req.originalUrl,
    user  : req.user ? req.user.username : 'anonymous'
  });

  if (req.accepts('json')) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  res.status(500).render('error404', {
    layout: false,
    title : '500 – Internal Server Error | ESMC',
    css   : 'error404'
  });
};
