const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifyCallback = (req, username, password, done) => {
    console.log(req.body)
    console.log("AUTHENTICATING");
    User.findOne({ username: username })
        .then((user) => {
            console.log("INSIDE");
            if (!user) {  
                console.log("no user!") //error message
                return done(null, false) 
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return;
                }

            if (result) {
                console.log('Passwords match! User authenticated.');
                return done(null, user);
            } else {
                console.log('Passwords do not match! Authentication failed.');
                return done(null, false);
            }
            });

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

passport.deserializeUser((userId, done) => {
    console.log("Printing username: ")
    User.findById(userId)
        .then((user) => {
            console.log("found!")
            console.log(userId)
            console.log(user)
            done(null, user);
        })
        .catch((err)=> {
            console.log("not found!")
            done(err);
        })
})