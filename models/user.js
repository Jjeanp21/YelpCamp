const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
})

//this will add in username, password to schema,
// so I don't have to manually add username and password in schema.
userSchema.plugin(passportLocalMongoose)

//export model
module.exports = mongoose.model('User', userSchema)