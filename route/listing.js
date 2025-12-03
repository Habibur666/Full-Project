const express=require("express");
const router=express.Router();
const { listingSchema, reviewSchema } = require("../schema.js");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError.js");
const Listing=require("../models/listing");
const{ isLoggedIn,isOwner }=require("../middleware.js");
const controllersListings=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage: storage});

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  }
  next();
};

router.route("/")
  .get(wrapAsync(controllersListings.indexListing))
  .post(isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(controllersListings.createListing));

router.get("/new", isLoggedIn, (req,res)=>{
  console.log(req.user);
  
  res.render("listings/new.ejs");
});

router.route("/:_id")
  .get(wrapAsync(controllersListings.showListing))
  .put(isLoggedIn,isOwner, upload.single("listing[image]"),  validateListing, wrapAsync(controllersListings.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(controllersListings.deleteListing));

router.get("/:_id/edit", isLoggedIn, isOwner, wrapAsync(controllersListings.editListing));

module.exports=router;
