const {body, validationResult} = require('express-validator');


/**
 *      title: {type: String, required: [true, 'title is required']},
        category: {type: String, enum: ['workshops','seminars','meet and greet', 'convention','other'], required: [true, 'category is required']},
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "No user ObjectID provided"]},
        host: {type: String, required: [true, 'host is required']},
        content: {type: String, required: [true, 'contest is required']},
        location: {type: String, required: [true, 'location is required']},
        dateStart: {type: Date, required: [true, 'start date is required']},
        dateEnd: {type: Date, required: [true, 'end date is required']},
        image: {type: String, required: [true, 'image path is required']}
 */
exports.validateNewEvent = [
    body('title', '').trim().escape(),
    body('category', 'Please select a category').notEmpty().trim().escape().isIn(['workshops','seminars','meet and greet','convention', 'other']),
    body('host', 'Please provide a host').notEmpty().trim().escape(),
    body('content', 'content must have 10 characters').notEmpty().isLength({min:10}).trim().escape(),
    body('location', 'location must be valid').notEmpty().trim().escape(),
    body('image', 'please include an image').notEmpty().trim(),
    body('dateStart', 'start date must be valid and after now').isAfter({comparisonDate: Date().toString()}).notEmpty().trim().escape().isISO8601(),
    body('dateEnd', 'end date must be valid and after start date').notEmpty().trim().escape().isISO8601().custom((dateEnd, {req}) => {
        let d1 =  new Date(req.body.dateStart).getTime();
        let d2 = new Date(dateEnd).getTime();
        console.log(d1 + " dd " + d2);
        if (d1 >= d2) {
            throw new Error('end date must be valid and after start date');
        } 
        return true;
    })
];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}