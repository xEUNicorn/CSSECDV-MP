const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res) =>{
    res.render('create_account', {layout: "account.hbs", title: "Create Account | ESMC", css:"create_account"});
})

module.exports = router;