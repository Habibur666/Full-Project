// models/review.js
// Mongoose schema for Reviews.
// Each review stores a comment, rating, a reference to the author (User), and a timestamp.
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
  comment:String,
  rating:{
    type:Number,
    min:1,
    max:5
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  created_at:{
    type:Date,
    default:Date.now(),
  }
});

module.exports=mongoose.model("Review", reviewSchema);