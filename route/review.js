// route/review.js
// Router for nested reviews resource mounted at /listings/:id/reviews
// - POST /listings/:id/reviews       -> create review (requires login)
// - DELETE /listings/:id/reviews/:id -> delete review (requires login & ownership check elsewhere)
const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const controllersReview=require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  }
  next();
};

//reviews
//post route
router.post("/", isLoggedIn, validateReview, wrapAsync(controllersReview.postReview));


// Delete review route
// Purpose: Remove a review from a listing
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(controllersReview.deleteReview));
module.exports=router;