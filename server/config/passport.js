const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { checkAccountLock, recordFailedLogin, recordSuccessfulLogin } = require('../middleware/loginSecurity');
const logger = require('../utils/logger');

const verifyCallback = async (req, username, password, done) => {
    try {

        // Check if account is locked
        const lockStatus = await checkAccountLock(username);
        if (lockStatus.locked) {

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
                return;
            }

        if (result) {
            // Record successful login
            const ipAddress = req.ip || req.connection.remoteAddress;
            await recordSuccessfulLogin(username, ipAddress);

            return done(null, user);
        } else {
            // Record failed login attempt
            const ipAddress = req.ip || req.connection.remoteAddress;
            const failInfo = await recordFailedLogin(username, ipAddress);

            logger.warn({
                event: 'LOGIN_FAIL_BADPASS',
                username,
                ip: req.ip,
                path: req.originalUrl,
                attempts: failInfo ? failInfo.attempts: 1
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
        done(err);
    }
}

const strategy = new LocalStrategy({passReqToCallback: true},verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch((err)=> {
            done(err);
        })
})
