const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  errors.array().forEach(e =>
    logger.warn({
      event:'VALIDATION_FAIL',
      field:e.param,
      msg  :e.msg,
      ip   :req.ip,
      path :req.originalUrl,
      user :req.user ? req.user.username : 'anonymous'
    })
  );

  return res.status(400).json({ error: 'Invalid input' });
};