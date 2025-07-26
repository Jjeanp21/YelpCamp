/*
File for review routes.
*/

//express library
const express = require('express');
const router = express.Router({mergeParams: true})

//use campground and review model
const Campground = require('../models/campground');
const Review = require('../models/review')

//use catch Async class
const catchAsync = require('../utils/catchAsync')

//use vallidateReview middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

//use review controller file
const reviews = require('../controllers/reviews')

//route to post a review with associated campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//route to delete a review of associated campground
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router