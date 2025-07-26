/*
File for "seeding" campgrounds. We will run this on it's own when 
we need/want to seed database with locations.

When ran, it deletes everything in DB and then uploads new locations.
 */

//work with mongoose package
const mongoose = require('mongoose');

//use campground model
const Campground = require('../models/campground')

//import cities file and seedHelper file
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper')

//Connect to mongo DB. Then pass in options
mongoose.connect('mongodb://localhost:27017/yelpcamp');

//Create variable for DB connection
const db = mongoose.connection

//check for error connecting. If error, display error
// message or else display success message
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log("Database Connected")
});

//Find random number within an array of varrying length and return
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

//remove everything from DB, then insert new location
const seedDB = async () => {
    await Campground.deleteMany({}); // delete everything in campground model

    //loop to randomly insert location
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)// generate random number between 0-1000. *Have 1000 cities in file

        //random price
        const price = Math.floor(Math.random() * 20) + 10

        //get a random city/state, descriptor/place
        const camp = new Campground({
            author: '681e1d88346ede559094f74f', //user ID of jaylo account
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempore beatae ad laudantium omnis molestiae consectetur error voluptatum odit aut quidem doloribus, aliquid optio quia impedit ut maxime similique, reiciendis ipsam.",
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dfdpkzx7c/image/upload/v1752263645/YelpCamp/ghwit1isqj6c5nrhbvnm.jpg',
                    filename: 'YelpCamp/ghwit1isqj6c5nrhbvnm'
                },
                {
                    url: 'https://res.cloudinary.com/dfdpkzx7c/image/upload/v1750035451/YelpCamp/vcv5lmce2o2o9toaglu3.jpg',
                    filename: 'YelpCamp/vcv5lmce2o2o9toaglu3'
                }
            ]
        })
        await camp.save(); //save
    }
}

//run seedDB
seedDB().then(() => {
    mongoose.connection.close() //close DB
})