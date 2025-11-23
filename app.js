require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { randomUUID } = require('crypto');
const app = express();
const bodyParser = require('body-parser');
const connectDB = require('./server/config/db');
const logger = require('./server/utils/logger'); 

const mongoose = require('mongoose');
const { sampleUsers, sampleOrders, sampleUpdates, sampleLogs } = require('./server/sample');
const User = require('./server/models/User');
const Order = require('./server/models/Order');
const Update = require('./server/models/Update');
const Logs = require('./server/models/Logs');   //just in case may samples to add

const Sessions =  require('./server/models/Sessions.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const PORT = 3000;

connectDB();

async function createSample() {
    //delete
    await User.deleteMany(); // Clear existing
    await Order.deleteMany();
    await Update.deleteMany();
    await Logs.deleteMany();

    await User.insertMany(sampleUsers);
    await Order.insertMany(sampleOrders);
    await Update.insertMany(sampleUpdates);
    await Logs.insertMany();

    //can add log samples here
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl : process.env.MONGODB_URI,
        mongoOptions: {
            useNewUrlParser: true,
        },
        cookie : {
            maxAge: (req,res) => {
                if(req.user && req.user.rememberme){
                    console.log("inside")
                    return 24 * 60 * 60 * 1000
                } else {
                    console.log("inside")
                    return null
                }
            },
            expires: false
        },
        collectionName:  'sessions'
    })
}))

createSample().catch(console.error);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.set('view cache', false);
}

app.engine('hbs', engine({
    extname : '.hbs', 
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    helpers: {
        eq: function(a, b) {
            return a === b;
        },
        formatDate: function(date) {
            if (!date) return 'Never';
            const d = new Date(date);
            return d.toLocaleString();
        },
        lastLogin: function(loginHistory) {
            if (!loginHistory || loginHistory.length === 0) return null;
            return loginHistory[loginHistory.length - 1].timestamp;
        }
    },
    cache: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'hbs');



require('./server/config/passport.js');
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./server/routes/main.js'));
app.use('/search_parcel', require('./server/routes/tracking.js'));
app.use('/admin', require('./server/routes/admin.js'));
app.use('/create_account', require('./server/routes/account.js')); // path for creating accounts
app.use('/password', require('./server/routes/password.js'));
app.use('/logs', require('./server/routes/logs.js'));       //path for doing whatever to the logs

app.use('/logs', require('./server/routes/logs.js'));

app.get('/error_generic', (_req, res) => {
  res.status(500).render('error_generic', {   
    layout: false,
    title : 'Something Went Wrong | ESMC',
    css   : 'error_generic'
  });
});

// 404 Error Handler - Must be last
app.use((req, res, next) => {
    res.status(404).render('error404', {
        layout: false,
        title: "404 - Page Not Found | ESMC",
        css: "error404"
    });
});

// Generic error handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error('Unhandled error:', err);

    const status = err.status || 500;
    const titleText = status === 500 ? 'Something Went Wrong' : 'Request Error';
    const message = status === 500
        ? 'An unexpected error occurred. Please try again later.'
        : err.publicMessage || err.message || 'An error occurred while processing your request.';
    const referenceId = randomUUID();

    if (req.accepts('html')) {
        return res.status(status).render('error_generic', {
            layout: false,
            title: `${status} Error | ESMC`,
            css: 'error_generic',
            statusCode: status,
            titleText,
            message,
            referenceId
        });
    }

    if (req.accepts('json')) {
        return res.status(status).json({
            error: message,
            referenceId
        });
    }

    return res
        .status(status)
        .type('text')
        .send(`${message} (Reference ID: ${referenceId})`);
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
})
