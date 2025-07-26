//use campground model
const Campground = require('../models/campground')

//require maptiler and set API key
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const { cloudinary } = require('../cloudinary')

/*
Functions for routes. Use functions in campground file under routes folder.
 */

//controller function for index route
module.exports.index = async (req, res) => {
    const cgrounds = await Campground.find({});
    res.render('campgrounds/index', { cgrounds })
}

//controller function for viewing 'new' route
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

//controller function for creating new campground
module.exports.createNewForm = async (req, res, next) => {
    //get geo location of location
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location,  {limit: 1});
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;

    //map through array of files and get file path and name, & create new object for each one; for images
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id //assign logged in user as author
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully made a new Campground!') //message when successfully created new CG
    res.redirect(`/campgrounds/${campground._id}`)//redirect to page of newly created campground
}

//Controller function for 'show' route
module.exports.showCampground = async (req, res) => {
    const cground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    //console.log(cground)
    if (!cground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { cground })
}

//Controller function for edit campground route
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const cground = await Campground.findById(id);
    if (!cground) {
        req.flash('error', 'Campground does not exist')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { cground })
}

//Function to submit edit
module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const cground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    //map through array of files and get file path and name, & create new object for each one; add to array
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    cground.images.push(...imgs); //add uploaded images to images array
    await cground.save();
    //if there's an image to delete
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename) //delete image on cloudinary as well
        }
        await cground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(cground)
    }
    req.flash('success', 'Successfully updated Campground!') //message when successfully updated new CG
    res.redirect(`/campgrounds/${cground._id}`)
}

//Function to delete campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Removed Campground!') //message when successfully removed CG
    res.redirect('/campgrounds')
}