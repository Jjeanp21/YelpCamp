/*
Schema/model for app.
 */

//work with mongoose package
const mongoose = require('mongoose');

const Review = require('./review')

//create a schema variable
const { Schema } = mongoose;

//A schema for images
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//virtual property; not stored in model or DB
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200'); //replace 'upload' in URL
})

const opts = { toJSON: { virtuals: true } };

//create a schema for campground
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' //object ID from user model
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' //object ID from review model
        }
    ]
}, opts)

//virtual property; not stored in model or DB
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

//function for deleting review(s) with associated campground
CampgroundSchema.post('findOneAndDelete', async function (document) {

    if (document) {
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
})

//export model, to be able to use in other files
module.exports = mongoose.model('Campground', CampgroundSchema)