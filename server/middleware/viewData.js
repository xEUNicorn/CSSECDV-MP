/**
 * Middleware to pass user and notification data to all views
 */
function setViewData(req, res, next) {
    // Pass user data to views
    if (req.user) {
        res.locals.user = req.user;
    }
    
    // Pass last login attempt notification if available in session
    if (req.session && req.session.lastLoginAttemptInfo) {
        res.locals.lastLoginAttemptInfo = req.session.lastLoginAttemptInfo;
        // Clear it after first use so it only shows once
        delete req.session.lastLoginAttemptInfo;
    }
    
    next();
}

module.exports = setViewData;

