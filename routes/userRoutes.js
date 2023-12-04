const express = require("express");
const router = express.Router();
const {isGuest, isLoggedIn} = require('../middleware/auth');
const { logInLimiter } = require('../middleware/rateLimiters');
const controller = require('../controllers/userController');

//shows new user form
router.get("/new", isGuest, controller.new)

//submits new user registration
router.post("/", isGuest, controller.create)

//shows login form
router.get("/login", isGuest, controller.login)

//sends login request
router.post('/login', logInLimiter, isGuest,  controller.authenticate)

//logs the current user out
router.get('/logout', isLoggedIn, controller.logout);

//gets profile
router.get('/profile', isLoggedIn, controller.profile);

module.exports = router;