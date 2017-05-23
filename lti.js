/*
 * In this file we configure the paths for LTI.
 */
const express = require('express');
const router = express.Router();

/*
 * Mongoose provides us an abstraction layer for the consumer
 * model in addition to the session storage as described before.
 */
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lti');
const Consumer = require('./models/consumer');

/*
 * As described in the article "ims-lti" provides us
 * validation of the LTI request and oauth signature.
 * Learn more about it here: https://github.com/omsmith/ims-lti
 */
const lti = require('ims-lti');

/*
 * The LTI client will send us a POST request including user
 * and authorization data.
 */
router.post('/', (req, res, next) => {
    const consumerKey = req.body.oauth_consumer_key;
    if (typeof consumerKey === 'undefined' || consumerKey === null) {
        next('Must specify oauth_consumer_key in request.');
    }

    /*
     * Using the oauth consumer key from the request we get the
     * matching secret from the database which is needed to validate
     * the request using the oauth signature.
     */
    Consumer.findOne({key: consumerKey}, 'secret', (err, consumer) => {
        if (err) next(err);

        const consumerSecret = (consumer || {}).secret;
        const provider = new lti.Provider(consumerKey, consumerSecret);

        /*
         * As described before "ims-lti" validates the request for us.
         * If it is valid we remove the old session data and start a
         * new blank session, which we fill with user data.
         * In this example we only take "context_id" and "userId"
         * but there are many more possible fields.
         */
        provider.valid_request(req, (err, isValid) => {
            if(isValid) {
                req.session.regenerate(err => {
                    if (err) next(err);

                    req.session.contextId = provider.context_id;
                    req.session.userId = provider.userId;

                    res.redirect(301, '/app/');
                });
            } else {
                next(err);
            }
        });
    });

});

/*
 * This route provides the generation of new consumer key pairs.
 * This is working but for a real application it should be secured
 * or only internally reachable.
 */
router.post('/consumer/', (req, res, next) => {
    const token = new Consumer();
    token.save();
    res.json(token);
});

/*
 * At the end we export the paths so our application can use them.
 */
module.exports = router;
