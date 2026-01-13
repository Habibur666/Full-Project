const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};



module.exports.isOwner=async(req,res,next)=>{
  const {_id}=req.params;
  const listing=await Listing.findById(_id);
  if(!listing.owner.equals(res.locals.currentUser._id)){
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${_id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Review not found');
    return res.redirect('back');
  }
  
  if (!res.locals.currentUser || String(review.author) !== String(res.locals.currentUser._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};
