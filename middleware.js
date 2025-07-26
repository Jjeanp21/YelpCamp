/*passport function isAuthenticated, to check if signed in
so that user can access 'new' route page. */

//use campground joi and review joi schema file
const { campgroundSchema, reviewSchema } = require('./schemas.js')

//use Express Error class
const ExpressError = require('./utils/ExpressError')

//use campground model
const Campground = require('./models/campground')

const Review = require('./models/review')

//Middleware to check if logged in
module.exports.isLoggedIn = (req, res, next) => {
    //if not signed
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl //the URL we will want to redirect user to
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next() //else move on to next function/call
}

//Middleware to save returnTo value from session into locals
module.exports.storeReturnTo = (req, res, next) =>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo
    }
    next()
}

module.exports.validateCG = (req, res, next) => {
    //pass data through schema
    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        //for each element, return element message.
        //Map over error details to make single error message.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//middleware for authenticating user
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const cground = await Campground.findById(id);

    /*check to see if specific user is signed in */
    //If "owner" of campground isn't logged in, can't access edit features
    // and redirect them back to campground page
    if (!cground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions to do this.')
        return res.redirect(`/campgrounds/${id}`)
    }
    
    next(); //else move onto next call
}

//middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)

    console.log(error)
    if (error) {
        //for each element, return element message.
        //Map over error details to make single error message.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//middleware for authenticating author of review(s)
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewID} = req.params;
    const review = await Review.findById(reviewID);

    /*check to see if specific user is signed in */
    //If "owner" of review isn't logged in, can't delete
    // and redirect them back to campground page
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions to do this.')
        return res.redirect(`/campgrounds/${id}`)
    }
    
    next(); //else move onto next call
}
