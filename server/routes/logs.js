const express = require('express');
const router  = express.Router();
const Logs    = require('../models/Logs');
const { checkAuthenticated, checkOwner } = require('../middleware/auth');
const logger  = require('../utils/logger');

//ingestions
router.post('/', async (req, res) => {
  try {
    const doc = new Logs({
      timestamp : new Date().toISOString(),
      category  : req.body.category || 'INFO',
      description: JSON.stringify(req.body, null, 2)
    });
    await doc.save();
    res.json({ success:true });
  } catch (err) {
    logger.error({ event:'LOG_INGEST_FAIL', message:err.message, stack:err.stack });
    res.status(500).json({ error:'Unable to write log' });
  }
});

//owner only
router.get('/', checkAuthenticated, checkOwner, async (_req, res) => {
  const logs = await Logs.find().sort({ timestamp:-1 }).limit(1000);
  res.render('system_logs', {
    layout:'admin.hbs',
    title :'System Logs | ESMC',
    css   :'system_logs',
    logs
  });
});

module.exports = router;
