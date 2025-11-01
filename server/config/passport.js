const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const logger = require('./logger');
const verifyCallback = (req, username, password, done) => {
    console.log(req.body)
    console.log("AUTHENTICATING");
    User.findOne({ employeeId: username })
        .then((user) => {
            console.log("INSIDE");
            if (!user) {  
                logger.info({
                    event : 'AUTH_FAILURE',
                    user  :  username,
                    ip    : rep.ip
                });
                return done(null, false) }

            if(user.password === password){
                logger.info({
                    event : 'AUTH_SUCCESS',
                    user : username,
                    ip : rep,ip
                });
                return done(null, user);
            } else {
                logger.info({
                    event : 'AUTH_FAILURE',
                    user : username,
                    ip : rep.ip
                });
                return done(null, false);
            }
        })
        .catch((err) => {   
            done(err);
        });
}

const strategy = new LocalStrategy({passReqToCallback: true},verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((employeeId, done) => {
    User.findById(employeeId)
        .then((user) => {
            console.log("found!")
            console.log(employeeId)
            console.log(user)
            done(null, user);
        })
        .catch((err)=> {
            done(err);
        })
})
