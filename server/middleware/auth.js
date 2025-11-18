const logger = require('../utils/logger');

function checkAuthenticated(req, res, next) {
  if (req.user) return next();
  logger.warn({ event:'ACCESS_DENIED', reason:'Unauthenticated', ip:req.ip, path:req.originalUrl });
  return res.redirect('/admin/login');
}

function checkOwner(req, res, next) {
  if (req.user && req.user.status === 'Owner') return next();
  logger.warn({ event:'ACCESS_DENIED', reason:'Not owner', user:req.user?.username, ip:req.ip,
                path:req.originalUrl });
  return res.status(403).send('Access denied. Owner privileges required.');
}

function checkEmployee(req, res, next) {
  if (req.user && req.user.status !== 'Customer') return next();
  logger.warn({ event:'ACCESS_DENIED', reason:'Customer attempted employee route',
                user:req.user?.username, ip:req.ip, path:req.originalUrl });
  return res.status(403).send('Access denied');
}

module.exports = { checkAuthenticated, checkOwner, checkEmployee };
