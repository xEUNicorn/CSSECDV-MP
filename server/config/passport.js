const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { checkAccountLock, recordFailedLogin, recordSuccessfulLogin } = require('../middleware/loginSecurity');
const logger = require('../utils/logger');

const verifyCallback = async (req, username, password, done) => {
    try {
        console.log(req.body);
        console.log("AUTHENTICATING");

        // Check if account is locked
        const lockStatus = await checkAccountLock(username);
        if (lockStatus.locked) {
            console.log("Account is locked!");

            logger.warn({
                event: 'LOGIN_FAIL_LOCKED',
                username,
                ip: req.ip,
                path: req.originalUrl,
                until: lockStatus.lockUntil
            })
            return done(null, false, { 
                message: 'Account is locked due to too many failed login attempts. Please try again later.' 
            });
        }

        const user = await User.findOne({ username: username });
        
        if (!user) {  
            console.log("no user!");

            logger.warn({
                event: 'LOGIN_FAIL_NOUSER',
                username,
                ip: req.ip,
                path: req.originalUrl
            });

            return done(null, false, { message: 'Invalid username and/or password' });
        }
        
        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return;
            }

        if (result) {
            console.log('Passwords match! User authenticated.');
            // Record successful login
            const ipAddress = req.ip || req.connection.remoteAddress;
            await recordSuccessfulLogin(username, ipAddress);

            logger.info({
                event: 'LOGIN_SUCCESS',
                username,
                ip: ipAddress,
                path: req.OriginalUrl
            });
            return done(null, user);
        } else {
            console.log('Passwords do not match! Authentication failed.');
            // Record failed login attempt
            const ipAddress = req.ip || req.connection.remoteAddress;
            const failInfo = await recordFailedLogin(username, ipAddress);

            logger.warn({
                event: 'LOGIN_FAIL_BADPASS',
                username,
                ip: req.ip,
                path: req.originalUrl,
                attempts: failInfo ? failInfoattempts: 1
            });

            if (failInfo && failInfo.locked) {
                return done(null, false, { 
                    message: 'Too many failed login attempts. Account has been locked for 30 minutes.' 
                });
            }
            return done(null, false, { 
                message: 'Invalid username and/or password' //removed counter for security purposes
            });
        }
        });

    } catch (err) {
        console.error("Authentication error:", err);
        done(err);
    }
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
