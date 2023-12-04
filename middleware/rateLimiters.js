const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMs: 60* 1000, //1 minutes time window
    max: 5,
    handler: (req, res, next) => {
        let err = new Error("too many login requests, try again later.");
        err.status = 429;
        return next(err);
    }
});