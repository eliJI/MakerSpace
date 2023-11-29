const express = require("express");
const router = express.Router();
const controller = require('../controllers/eventController');
const {isCreator, isLoggedIn} = require('../middleware/auth');
const { DateTime } = require('luxon');
const {v4: uuidv4} = require('uuid');

//router.use();

//gets index
router.get('/', controller.index);

//new event post request
router.post('/',controller.fileUpload, isLoggedIn, controller.create)

//gets new event form
router.get('/newEvent', isLoggedIn, controller.new)

//get specific event
router.get('/:id', controller.show);


//update event
router.put('/:id', controller.fileUpload, isLoggedIn, isCreator, controller.update);

//get edit form for specific event
router.get("/:id/edit", isLoggedIn, isCreator, controller.edit);

//delete event
router.delete('/:id', isLoggedIn, isCreator, controller.delete);

module.exports = router;
