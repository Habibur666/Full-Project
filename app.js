if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync");
const ExpressError = require("./util/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingsRouter = require("./route/listing.js");
const reviewRouter = require("./route/review.js");
const userRouter = require("./route/user.js");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const dbURL = process.env.ATLAS_DB;

if (!dbURL || dbURL === "") {
    console.error("❌ FATAL ERROR: ATLAS_DB is not set in environment variables!");
    process.exit(1);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60, 
    crypto: {
        secret: process.env.SECRET
    }
});

store.on("error", (err) => {
    console.error("⚠ Session store error:", err.message);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "fallbackSecret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


mongoose.connect(dbURL)
    .then(() => console.log("✅ MongoDB Connected to Atlas"))
    .catch((err) => console.log("❌ MongoDB Error:", err));


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).send(err.message || "Something went wrong");
});


app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
