/*
File for campground routes.
*/

//express library
const express = require('express');
const router = express.Router();

//use catch Async class
const catchAsync = require('../utils/catchAsync');

//use isLoggedIn middleware
const { isLoggedIn, isAuthor, validateCG } = require('../middleware');

//use campground controller file
const campgrounds = require('../controllers/campgrounds');

const multer = require('multer');
const { storage } = require('../cloudinary') //don't need to add '/index'; automatically looked for
const upload = multer({ storage });

//ROUTES
//All HTTP req methods for /
router.route('/')
    .get(catchAsync(campgrounds.index)) //campground route
    .post(isLoggedIn, upload.array('image'), validateCG, catchAsync(campgrounds.createNewForm)) //post route to create new location

//route to create new location
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//All HTTP req methods for /id
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //route for campground followed by id
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCG, catchAsync(campgrounds.editCampground)) //route to submit edit to the current campground
    .delete(isAuthor, catchAsync(campgrounds.deleteCampground)) //route to delete a campground location

//Route to edit a campground location
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;