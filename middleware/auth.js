const EventModel = require('../models/event');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are already logged in')
        res.redirect('/users/profile')
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are not logged in')
        res.redirect('/users/login')
    }
};

exports.isCreator = (req, res , next) => {
    let id = req.params.id;
    EventModel.findById(id)
    .then(event => {
        if (event) {
            if (event.createdBy == req.session.user.id) {
                return next();
            } else {
        
                let err = new Error('You not authorized to modify this resource')
                err.status  = 401;
                next(err);
            }
        }
    })
    .catch(err => next(err));
}


exports.isNotCreator = (req, res , next) => {
    let id = req.params.id;
    EventModel.findById(id)
    .then(event => {
        if (event) {
            if (event.createdBy != req.session.user.id) {
                return next();
            } else {
        
                let err = new Error('You are the creator of this post');
                err.status  = 401;
                next(err);
            }
        }
    })
    .catch(err => next(err));
}