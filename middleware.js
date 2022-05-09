const ExpressError = require('./utlities/ExpressError')
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const Campground = require('./models/campground')
const Review = require("./models/review")
const campground = require('./models/campground')

 
  module.exports.isLoggedIn = async(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash("error" , 'you must be signed in first')
        return res.redirect("/login")
    }
    next();
} 


module.exports.validateCampground = (req,res,next)=>{

    const {error} = campgroundSchema.validate(campground);
        
        if(error){
            const msg = error.details.map(el=>el.message).join(",")
            throw new ExpressError(msg,400)
        }
        else{
            next();
        }
    }


    module.exports.isAuthor = async(req,res,next)=>{
       const {id} =  req.params
    const campground =  await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        req.flash("error", "you dont have permission to access")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
   } 
   
   module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} =  req.params
 const review =  await Review.findById(reviewId);
 if (!review.author.equals(req.user._id)){
     req.flash("error", "you dont have permission to access")
     return res.redirect(`/campgrounds/${id}`)
 }
 next();
} 


 module.exports.validateReview = (req,res,next)=>{
    const {error} =reviewSchema.validate(req.body)

    if(error){
        const msg = error.details.map(el=>el.message).join(",")
        throw new ExpressError(msg,400)
        
    }
    else{
        next();
    }

}