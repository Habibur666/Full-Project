// route/listing.js
// Router for listings resource (CRUD + show page)
// - GET /listings          -> index
// - GET /listings/new      -> form
// - POST /listings         -> create
// - GET /listings/:_id     -> show (populates owner and reviews)
// - GET /listings/:_id/edit-> edit form
// - PUT /listings/:_id     -> update
// - DELETE /listings/:_id  -> delete
const express=require("express");
const router=express.Router();
const { listingSchema, reviewSchema } = require("../schema.js");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError.js");
const Listing=require("../models/listing");
const{ isLoggedIn,isOwner }=require("../middleware.js");
const controllersListings=require("../controllers/listings.js");
const multer=require("multer");//ডকুমেন্ট আপলোড করার জন্য
const {storage}=require("../cloudConfig.js");
const upload=multer({storage: storage}); // Set destination for uploaded files

// Middleware to check and validate listing data

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    // send Joi error details as message
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  }
  next();
};

// Index and Create routes
router.route("/")
  .get(wrapAsync(controllersListings.indexListing))
  .post(isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(controllersListings.createListing));

// New listing form route
// Purpose: Show form to create a new listing
router.get("/new", isLoggedIn, (req,res)=>{
  console.log(req.user);
  
  res.render("listings/new.ejs");
});

// Show, Update and Delete routes
router.route("/:_id")
  .get(wrapAsync(controllersListings.showListing))
  .put(isLoggedIn,isOwner, upload.single("listing[image]"),  validateListing, wrapAsync(controllersListings.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(controllersListings.deleteListing));

// Edit listing form route
// Purpose: Show form to edit a listing
router.get("/:_id/edit", isLoggedIn, isOwner, wrapAsync(controllersListings.editListing));

module.exports=router;