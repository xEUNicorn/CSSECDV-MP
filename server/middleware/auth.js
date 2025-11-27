const logger = require('../utils/logger');

const ensureAuthenticated = (req) => {
    if (typeof req.isAuthenticated === 'function') {
        return req.isAuthenticated();
    }
    return Boolean(req.user);
};

const redirectToLogin = (req, res, path) => {
    if (req.method === 'GET') {
        req.session.returnTo = req.originalUrl;
    }

    if (path == 'admin') {
        res.redirect('/admin/login');
    } else {
        res.redirect('/search_parcel/login');
    }
    
};

function requireAuth(path) {
    return function (req, res, next) {
        if (ensureAuthenticated(req)) {
            return next();
        }

        if (req.accepts('html')) {
            return redirectToLogin(req, res, path);
        }
    
        logger.warn({ event:'ACCESS_DENIED', reason:'Unauthenticated', ip:req.ip, path:req.originalUrl });

        return res.status(401).json({ error: 'Authentication required.' });
    }
}

function requireRole(...roles) {
    const allowedRoles = roles.flat();

    return (req, res, next) => {
        if (!ensureAuthenticated(req)) {
            if (req.accepts('html')) {
                return redirectToLogin(req, res);
            }
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (allowedRoles.length === 0 || allowedRoles.includes(req.user.status)) {
            return next();
        }

        if (req.accepts('html')) {
            logger.warn({ event:'ACCESS_DENIED', reason:'User is not included in the permissions list',
                user:req.user?.username, ip:req.ip, path:req.originalUrl });
            return res.status(403).render('error_generic', {
                layout: false,
                css: 'error_generic',
                title: '403 - Access Denied | ESMC',
                statusCode: 403,
                titleText: 'Access Denied',
                message: 'You do not have permission to access this resource.'
            });
        }
        
        logger.warn({ event:'ACCESS_DENIED', reason:'User is not included in the permissions list',
                user:req.user?.username, ip:req.ip, path:req.originalUrl });
        return res.status(403).json({ error: 'Access denied.' });
    };
}

module.exports = {
    requireAuth,
    requireRole
};

