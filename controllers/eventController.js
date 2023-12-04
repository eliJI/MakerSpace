const model = require('../models/event');
const rsvpModel = require('../models/rsvp');
const { DateTime } = require('luxon');
const {v4: uuidv4} = require('uuid');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        const fname = uuidv4() + path.extname(file.originalname);
        let event = req.body;
        event.image = "/uploads/"+fname;
        cb(null, fname);
    },
  
});

const fileFilter = (req, file, cb) => {
    const filetypes = ["image/png", "image/jpeg"];

    if (!filetypes.includes(file.mimetype)) {
       return cb(new Error('file type is not supported'));
    } else {
        return cb(null, true);
    }
}

const upload = multer({
    storage: storage, 
    limits:{fileSize: 1024*1024},
    fileFilter: fileFilter
}).single('image');

const fileUpload = (req, res, next) => {
    upload(req, res, err => {
        if (err) {
            console.log('ping');
            err.status = 400;
            next(err);
        } else {
            next();
        }
    });
}

exports.fileUpload = fileUpload;


exports.index = (req, res, next) => {
   model.find()
   .then(events =>{
        let categories = []
        events.forEach(event => {
            if (categories.indexOf(event.category) === -1){
                categories.push(event.category);    
            }
            
        });

        if (events) {
            res.render('./events', {events: events, categories: categories});    
        } else {
            err = new Error("No events to display");
            err.status = 404;
            next(err)
        }
   })
   .catch(err => {
        next(err);
   })
    
}

exports.new = (req, res) => {
    res.render('./newEvent');
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        next(err);
    }

    model.findById(id).lean()
    .then(event => {
        if (event) {
            event.dateStart = DateTime.fromJSDate(event.dateStart).setZone('America/New_York').toISO({suppressSeconds: true, suppressMilliseconds: true, includeOffset: false});
            console.log(event.dateStart);
            event.dateEnd = DateTime.fromJSDate(event.dateEnd).setZone('America/New_York').toISO({suppressSeconds: true, suppressMilliseconds: true, includeOffset: false});
            console.log(event.dateEnd);
            console.log(event);
            res.render('./edit', {event: event});
        } else {
            let err = new Error('Cannot find event with ID: ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        next(err)
    });
   
}

exports.update = (req,res,next) => {
    const event = req.body;
    let id = req.params.id;
    console.log(event);

    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        next(err);
    }

    model.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators:  true})
    .then(event => {
        if (event) {
            req.flash('success',  'Event Updated');
            res.redirect('/events/'+id);
        } else {
            let err = new Error('Cannot update the story with ID: '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if (err.name = "ValidationError") {
            let error = new Error(err.message);
            error.status = 400;
            next(error)
        } else {
            next(err);   
        }
    });
}

exports.create = (req, res, next) => {
    req.body.createdBy = req.session.user.id;  

    console.log("req body: ");
    console.log(req.body);

    const event = new model(req.body);
    event.save()
    .then(event => {
        if (event) {
            req.flash('success', 'Created the event');
            res.redirect('./events');
        } else {
           let err = new Error('Cannot create the event');
           err.status = 400;
           next(err)
        }
    })
    .catch(err => {
        if (err.name = "ValidationError") {
            let error = new Error(err.message);
            error.status = 400;
            next(error)
        } else {
            next(err);   
        }
        
    });
    
}

exports.show = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        next(err);
    }

    model.findById(id).populate('createdBy', 'firstName lastName').lean()
    .then(event => {
        if (event) {
            console.log(event)
            const oriDateStart = event.dateStart
            const oriDateEnd = event.dateEnd
            event.dateStart = DateTime.fromJSDate(event.dateStart).toLocaleString(DateTime.DATETIME_MED);
            event.dateEnd = DateTime.fromJSDate(event.dateEnd).toLocaleString(DateTime.DATETIME_MED);

            //get amount of rsvps and send to template
            let count = -1;
            rsvpModel.find({eventId: id, status: "YES"})
            .then(rsvps => {
                count = rsvps.length;
                console.log(rsvps.length); 
                res.render('./event', {event: event, rsvp: {count: count}})
            })
            .catch(err => next(err))
        } else {
            let err = new Error('Cannot find event with ID: ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        next(err)
    });

}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event id');
        err.status = 400;
        next(err);
    }

    model.findByIdAndDelete(id)
    .then(event => {
        if (event) {
            rsvpModel.deleteMany({eventId: id})
            .then(deleted => {
                req.flash('success', 'Event Deleted');
                res.redirect('/events'); 
            })
            .catch(err => {
                next(err);
            })
        } else {
            let err = new Error('Cannot delete event with ID: '+id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        next(err);
    });

}

//created/updates rsvp if it exists
exports.rsvp = (req, res, next) => {

    const eventId = req.params.id;
    const userId = req.session.user.id;

    if(!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event or user id');
        err.status = 400;
        next(err);
    }

    if(!userId.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid event or user id');
        err.status = 400;
        next(err);
    }

    req.body.eventId = eventId;
    req.body.userId= userId;
    
    rsvpModel.findOneAndUpdate(
        {userId: userId, eventId: eventId},
        req.body,
        {new: true, upsert: true}
    )
    .then(rsvp => {
        if (rsvp) {
            req.flash('success','RSVP updated')
            res.redirect('back')
        } else {
            let err = new Error('could not create rsvp');
            err.status = 400;
            next(err);
        }
    })
    .catch(err => {
        next(err)
    })
}