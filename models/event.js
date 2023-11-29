const { DateTime } = require('luxon');
const {v4: uuidv4} = require('uuid');
const mongoose = require('mongoose');



const eventSchema = new mongoose.Schema(
    {
        title: {type: String, required: [true, 'title is required']},
        category: {type: String, enum: ['workshops','seminars','meet and greet', 'convention','other'], required: [true, 'category is required']},
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "No user ObjectID provided"]},
        host: {type: String, required: [true, 'host is required']},
        content: {type: String, required: [true, 'contest is required']},
        location: {type: String, required: [true, 'location is required']},
        dateStart: {type: Date, required: [true, 'start date is required']},
        dateEnd: {type: Date, required: [true, 'end date is required']},
        image: {type: String, required: [true, 'image path is required']}
    }
);

module.exports = mongoose.model('Event', eventSchema);

