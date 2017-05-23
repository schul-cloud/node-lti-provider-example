/*
 * In this example we use the express framework as it provides easy routing.
 * This is not necessarily needed for LTI.
 */
const express = require('express');
const app = express();

/*
 * As described in the article we need to store the user information in a session
 * or something similar. In this example we decided to use express-session.
 * express-session provides a huge variety of storage providers. We decided to
 * use mongo as we store the oauth consumers keys in mongo as well.
 */
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lti');  // or any other mongo database

/*
 * To receive the request's post data we need to configure body-parser for express.
 * In the following we also initialize the session as described above.
 * If you want to learn more about options for the session go to:
 * https://github.com/expressjs/session
 */
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'SOMETHING VERY SECRET',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60 * 60 * 24
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

/*
 * The whole LTI logic is outsourced into lti.js
 * and is available through "/lti/....".
 */
app.use('/lti/', require('./lti'))

/*
 * Below this you can define your actual application logic.
 * The LTI user's information is available in req.session.
 */
app.get('/app/', (req, res, next) => {
    if(req.session.userId) {
        res.send('Your application' + JSON.stringify(req.session));
    } else {
        next('Session invalid. Please login via LTI to use this application.');
    }
});

/*
 * Finally we start the application.
 */
const port = 4000;
app.listen(port, function() {
    console.log(`listening on ${port}`);
});
