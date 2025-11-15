const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


module.exports.postReview=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;  // Add the author
  await newReview.save();
  listing.review.push(newReview._id);
  await listing.save();
  console.log("new review saved");
  req.flash('success', 'Created new review!');
  res.redirect(`/listings/${req.params.id}`);
  };

module.exports.deleteReview=async (req, res) => {
  const listingId = req.params.id;
  const { reviewId } = req.params;
  await Listing.findByIdAndUpdate(listingId, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/listings/${listingId}`);
};