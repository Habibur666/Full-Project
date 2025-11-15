if(process.env.NODE_ENV!=="production"){//কোডের ভেতরে সরাসরি পাসওয়ার্ড বা সিক্রেট লেখা নিরাপদ নয়। .env ফাইল লুকিয়ে রাখা যায়, তাই সিকিউরিটি বাড়ে।
   require("dotenv").config();
};

const express=require("express");
const app=express();
const port=3000;

// Purpose: Import mongoose and connect to MongoDB
const mongoose=require("mongoose");

// Purpose: Import the Mongoose model for listings
const Listing=require("./models/listing");

const path=require("path");

// Purpose: Allow PUT and DELETE requests from forms
const methodOverride=require("method-override");

//ejs-mate setup
const ejsMate=require("ejs-mate");//যখন EJS দিয়ে টেমপ্লেট বানাচ্ছি এবং সব পেজে এক রকম লেআউট রাখতে চাই।
const wrapAsync = require("./util/wrapAsync");//যে কোনো অ্যাসিঙ্ক্রোনাস ফাংশনের এরর হ্যান্ডলিং সহজ করার জন্য
const ExpressError = require("./util/ExpressError.js");//কাস্টম এরর ক্লাস যা স্ট্যাটাস কোড এবং মেসেজ নিয়ে কাজ করে
const { listingSchema, reviewSchema } = require("./schema.js");
const Review=require("./models/review.js");
const listingsRouter=require("./route/listing.js");
const reviewRouter=require("./route/review.js");
const userRouter=require("./route/user.js");
const flash=require("connect-flash");//ফ্ল্যাশ মেসেজ দেখানোর জন্য for some seconds 
const session=require("express-session");//লগইন/অথেন্টিকেশন সিস্টেমে।
const MongoStore=require("connect-mongo");//মঙ্গোডিবিতে সেশন স্টোর করার জন্য
const passport=require("passport");//যখন অ্যাপে ইউজার লগইন/সাইনআপ ফিচার দরকার।
const LocalStrategy=require("passport-local");//লোকাল অথেন্টিকেশনের জন্য, ইউজারনেম এবং পাসওয়ার্ড দিয়ে লগইন করার জন্য
const User=require("./models/user.js");

// Database URL from environment variables with validation
const dbURL = process.env.ATLAS_DB || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/wanderlust";

if(!dbURL || dbURL === "") {
  console.error("FATAL: Database URL (ATLAS_DB or MONGODB_URL) not configured in environment variables");
  process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended: true}));//form data পার্স করার জন্য 
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const storeConfig = {
  mongoUrl: dbURL,
  touchAfter: 24*60*60,//24 hours
};

// Only add crypto config if SECRET is provided
if(process.env.SECRET) {
  storeConfig.crypto = {
    secret: process.env.SECRET
  };
}

const store = MongoStore.create(storeConfig);

store.on("error", (err) => {
  console.error("Session store error:", err.message);
});

// Session configuration (required before passport.session and flash)
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  },
};
app.use(session(sessionOption));
app.use(flash());

// Passport.js configuration (after session middleware)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Expose flash messages and current user to all templates
app.use((req,res, next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currentUser=req.user;
  next();
});

main().then((res)=>{
  console.log("MongoDB connected");
}).catch((err)=>{
  console.log(err);
})

async function main(){
  await mongoose.connect(dbURL);
}

app.use("/listings", listingsRouter)
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Catch-all for unmatched routes (use app.use so no path parsing occurs)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).send(message);
});

app.listen(port, ()=>{
  console.log("server listening");
});

