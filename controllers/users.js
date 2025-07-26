const User = require('../models/user')

/*
Functions for routes. Use functions in campground file under routes folder.
 */

//Function to render register page
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

//Function for register user route
module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body //get values from request
        const user = new User({ email, username })

        //takes the user instance and hashes the password for new user
        const registeredUser = await User.register(user, password)
        console.log(registeredUser)

        //Login a user AFTER being registered
        req.login(registeredUser, err => {
            if (err) return next();
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        }) 

    } catch (err) {
        req.flash('error', err.message)
        res.redirect('/register')
    }
}

//Function to render login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

//After getting logged in with passport(in route user.js) this function will flash message
// and redirect
module.exports.loginFlash = (req, res) => {
    req.flash('success', 'Welcome Back!')

    //redirect user to the URL they were previously on, or redirect
    // them to campgrounds if there isn't a returnTo value.
    const redirectURL = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectURL)
}

//Function to logout user
module.exports.logout = (req, res, next) => {
    //terminate an existing session
    req.logout(function (err) {
        if (err) {
            return next(err)
        }

        req.flash('success', 'Signed Out')
        res.redirect('/login')
    })

}