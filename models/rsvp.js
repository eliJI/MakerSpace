const mongoose = require('mongoose');



const rsvpSchema = new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "No user ObjectID provided"]},
        eventId: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: [true, "No event ObjectID provided"]},
        status: {type: String, enum: ["YES","NO","MAYBE"], required: [true, "No status provided"]}

    }
);

module.exports = mongoose.model('Rsvp', rsvpSchema);

