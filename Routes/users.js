const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const review = require('../models/review')
const users = require('../controllers/users')

const { storeReturnTo } = require('../middleware')

//All HTTP methods for /register
router.route('/register')
    .get(users.renderRegister) //Route for register page
    //creating new user, not logging in user
    .post(catchAsync(users.registerUser))

//All HTTP methods for /login
router.route('/login')
    .get(users.renderLogin) //route to login page

    //use middleware from passport; passport-authenticate.
    //storeReturnTo middleware, saves the returnTo value from session to res.locals.
    //Then specify strategy; 'local' strategy verifies username and password
    //If failure, we have two options; fail flash, will flash message & fail redirect will redirect back to login page
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginFlash)

//logout route
router.get('/logout', users.logout)

module.exports = router