const UserModel = require('../models/user');
const Event = require('../models/event');
const flash = require('connect-flash');


exports.new = (req, res, next) => {
    res.render('./users/new')
}

exports.profile = (req, res, next) => {
    let id = req.session.user.id;
    Promise.all([UserModel.findById(id), Event.find({createdBy: id})])
    .then(results => {
        const [user, events] = results;
        res.render('./users/profile', {user: user, events, events});
    })
    .catch(err => next(err));
}

   
    

exports.create = (req, res, next) => {
    let user = new UserModel(req.body);
    user.save()
    .then(user => {
        req.flash('success', 'Signed up Successfully')
        res.redirect('./users/login')
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
    
            req.flash('error', err.message)
            return res.redirect('back')
        }

        if (err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('back');
        }
   
        next(err)

    });
;}

exports.login = (req,res, next) => {
    res.render('./users/login')
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err){
            return next(err);
        } else {
            res.redirect('/');
        }
    })
}

exports.authenticate = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    UserModel.findOne({email: email})
    .then(user => {
        if (!user) {
            console.log('WRong email address');
            req.flash('error', 'Wrong email address')
            res.redirect('back')
        } else {
            user.comparePassword(password)
            .then(result => {
                if (result) {
                    req.session.user = {id: user._id, firstName: user.firstName};
                    //req.session.user.firstName = user.firstName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Incorrect password');
                    res.redirect('back');
                }
            })
        }
    })
    .catch(err => {
        next(err);
    })
};
