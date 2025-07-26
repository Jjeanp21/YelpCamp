/*Access to Cloudinary */
//If not in production (otherwise in development)
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.CLOUDINARY_SECRET);

//express library
const express = require('express');

//work with mongoose package
const mongoose = require('mongoose');

//absolute path
const path = require('path');

//define ejs engine
const ejsMate = require('ejs-mate')

//use method-override
const methodOverride = require('method-override')

//use session and flash library
const session = require('express-session')
const flash = require('connect-flash')

//use campground & review joi schema file
const { campgroundSchema, reviewSchema } = require('./schemas.js')

//run express
const app = express();

app.set('query parser', 'extended');

//use campground and review model
const Campground = require('./models/campground');
const Review = require('./models/review')

//use Express Error class
const ExpressError = require('./utils/ExpressError')

//to access route files
const userRoutes = require('./Routes/users')
const campgroundRoutes = require('./Routes/campground')
const reviewRoutes = require('./Routes/reviews')

const User = require('./models/user')

//use passport library
const passport = require('passport')
const LocalStrategy = require('passport-local')

const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

const helmet = require('helmet')

//const dbUrl = process.env.DB_URL

const MongoStore = require('connect-mongo');

const dbUrl = 'mongodb://localhost:27017/yelpcamp';
//Connect to mongo DB. Then pass in options
//mongoose.connect('mongodb://localhost:27017/yelpcamp'); //local DB
mongoose.connect(dbUrl) //cloud DB

//Create variable for DB connection
const db = mongoose.connection

//check for error connecting. If error, display error
// message or else display success message
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log("Database Connected")
});

//tell app what to use for ejs engine
app.engine('ejs', ejsMate)

//set to ejs, then set directory
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

//override method
app.use(methodOverride('_method'))

//for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

//mongo sanitize; for NoSql injection prevention
app.use(sanitizeV5({ replaceWith: '_' }));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto:{
        secret:'thisisatestsecret'
    }
})

store.on('error', function(e){
    console.log("Session store error", e)
})

//session object
const sessionConfig = {
    store,
    name: 'Jose.sid',
    secret: 'thisisadefaultsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet()); //enable all of helmet's middleware



//Set content security default sources
/* Set or restrict what outside sources can be implented in project. */
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dfdpkzx7c/", //match your cloudinary account
            "https://images.unsplash.com/",
            "https://api.maptiler.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    }
}));






//passport middleware
app.use(passport.initialize())
app.use(passport.session()) //use AFTER session
passport.use(new LocalStrategy(User.authenticate()))

//tells passport how to serialize user - how to store user in the session
//tells passport how to deserialize user - how to get user out of session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware for flash message
app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user //have access to current user info
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//TEMP creation of new user
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'testemail@testy.com', username: 'Jaylo' })
    const newUser = await User.register(user, 'foodtest')//register method registers user with password; also checks if username is unique
    res.send(newUser)
})

//specify default path and a router
//So campgrounds router will have a default path of /campgrounds & same logic for reviews router
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//basic route
app.get('/', (req, res) => {
    res.render('home')
});

//error handler for nonexistent URL
//'.all' - Will be for every single request type
//'*' - is for every path
app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found!", 404))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err //defualt status code
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err })
})

//listen
app.listen(3000, () => {
    console.log("Server is started up")
});