const express = require("express");
const router = express.Router();
const controller = require('../controllers/mainController');

//gets the landing page
router.get("/", controller.index);

//gets the about page
router.get("/about", controller.about);

//gets the contact page
router.get("/contact", controller.contact);

module.exports = router;