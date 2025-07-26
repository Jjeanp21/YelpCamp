const Campground = require('../models/campground');
const Review = require('../models/review');

/*
Functions for routes. Use functions in campground file under routes folder.
 */

//Function to create review
module.exports.createReview = async (req, res) => {
    //find camp ground by id
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)

    //set id of current user to author
    review.author = req.user._id

    //then push the review into campground
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Successfully made new review!') //message when successfully created new review
    //then redirect
    res.redirect(`/campgrounds/${campground._id}`)
}

//Function to delete review
module.exports.deleteReview = async (req, res) => {
    //Destruct
    const { id, reviewID } = req.params

    //find campground by ID
    // then pull in an object from reviews array that has a review ID
    const campground = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewID}})

    //find review by ID
    const review = await Review.findByIdAndDelete(reviewID)

    req.flash('success', 'Successfully removed review!') //message when successfully removed review

    //then redirect back to camp ground page
    res.redirect(`/campgrounds/${campground._id}`)
}