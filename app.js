if(process.env.NODE_ENV!=="production"){
   require("dotenv").config();
};

const express=require("express");
const app=express();
const port=3000;

const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require("./util/wrapAsync");
const ExpressError = require("./util/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review=require("./models/review.js");
const listingsRouter=require("./route/listing.js");
const reviewRouter=require("./route/review.js");
const userRouter=require("./route/user.js");
const flash=require("connect-flash");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbURL = process.env.ATLAS_DB || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/wanderlust";

if(!dbURL || dbURL === "") {
  console.error("FATAL: Database URL (ATLAS_DB or MONGODB_URL) not configured in environment variables");
  process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const storeConfig = {
  mongoUrl: dbURL,
  touchAfter: 24*60*60,//24 hours
};

if(process.env.SECRET) {
  storeConfig.crypto = {
    secret: process.env.SECRET
  };
}

const store = MongoStore.create(storeConfig);

store.on("error", (err) => {
  console.error("Session store error:", err.message);
});

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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).send(message);
});

app.listen(port, ()=>{
  console.log("server listening");
});

