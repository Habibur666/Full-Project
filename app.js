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


const dbURL = process.env.MONGO_URI;

if (!dbURL || dbURL === "") {
    console.error("❌ FATAL ERROR: MONGO_URI is not set or invalid in environment variables!");
    process.exit(1);
}


mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected to Atlas"))
.catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});


if (!process.env.SECRET || process.env.SECRET === "") {
    console.error("❌ FATAL ERROR: SECRET is not set in environment variables!");
    process.exit(1);
}
let store;
try {
    store = MongoStore.create({
        mongoUrl: dbURL,
        collectionName: "sessions",
        touchAfter: 24 * 60 * 60, // 1 day
        crypto: {
            secret: process.env.SECRET
        }
    });

    store.on("error", (err) => {
        console.error("⚠ Session store error:", err.message);
        if (err.message.includes("Cannot read properties of null")) {
            console.error("❌ Check your MongoDB connection string and cluster status.");
        }
    });
} catch (err) {
    console.error("❌ Failed to initialize session store:", err.message);
    process.exit(1);
}


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false, 
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
    res.locals.success = req.flash("success") || [];
    res.locals.error = req.flash("error") || [];
    res.locals.currentUser = req.user || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const { statusCode = 500 } = err;
    res.status(statusCode).send(err.message || "Something went wrong");
});


app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
