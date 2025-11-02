const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { checkAccountLock, recordFailedLogin, recordSuccessfulLogin } = require('../middleware/loginSecurity');

const verifyCallback = async (req, username, password, done) => {
    try {
        console.log(req.body);
        console.log("AUTHENTICATING");

        // Check if account is locked
        const lockStatus = await checkAccountLock(username);
        if (lockStatus.locked) {
            console.log("Account is locked!");
            return done(null, false, { 
                message: 'Account is locked due to too many failed login attempts. Please try again later.' 
            });
        }

        const user = await User.findOne({ username: username });
        
        if (!user) {  
            console.log("no user!");
            return done(null, false, { message: 'Invalid username or password' });
        }

        if (user.password === password) {
            console.log("found!");
            // Record successful login
            const ipAddress = req.ip || req.connection.remoteAddress;
            await recordSuccessfulLogin(username, ipAddress);
            return done(null, user);
        } else {
            console.log("not found!");
            // Record failed login attempt
            const failInfo = await recordFailedLogin(username);
            if (failInfo && failInfo.locked) {
                return done(null, false, { 
                    message: 'Too many failed login attempts. Account has been locked for 30 minutes.' 
                });
            }
            return done(null, false, { 
                message: `Invalid username or password. ${failInfo ? failInfo.remaining : ''} attempts remaining.` 
            });
        }
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