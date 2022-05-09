if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
    
}
const express = require('express');
const app = express();
const path = require("path")
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utlities/ExpressError')
const Joi =  require('joi')
const session = require("express-session")
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require("passport-local")
const User = require("./models/user")
const fileUpload = require('express-fileupload');


const usersRoutes = require("./routes/users");
const campgroundRoutes =  require("./routes/campgrounds")
const reviewRoutes = require('./routes/review')


// these are imported for the displaying form
const form = require("express-form-data")
const bp = require('body-parser');

// this method is to override the put request that we cannot use in forms
const methodOverride = require("method-override")

//this is related to the form submitted in ejs method
const os = require('os');
const campground = require('./models/campground');
const req = require('express/lib/request');
const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
}


// this is also imported for the form
app.engine('ejs', ejsMate)
app.use(bp.urlencoded({ extended: true }))
app.use(bp.json());
app.use(form.parse(options));
// app.use(function (req, res, next) {
//     res.header("Content-Type",'multipart/form-data');
//     next();
//   });
//app.use(fileUpload());
// this method is to override the put request that we cannot use in forms
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,"public")))
const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave : false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})
app.use('/',usersRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)




//these are mongoose data base local host 
mongoose.connect('mongodb://localhost:27017/yelp-camp', {

});
//this is default mongoose error catcher
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected");

})

//this is the path that ejs will look up for
app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, "views"))


//starting route
app.get("/", (req, res) => {
    res.render("home")
})



// app.all('*',(req,res,next)=>{
//     next(new ExpressError("Page Not Found",404))

// })

//this route is for error handling
app.use((err, req, res, next) => {
    const{statusCode= 500} = err;
    if(!err.message) err.message = "oops something went wrong"
    res.status(statusCode).render('errors',{err});

})
//express port
app.listen(5000, () => {
    console.log('serving port 5000')
})

