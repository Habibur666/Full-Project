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

if (!process.env.SECRET || process.env.SECRET === "") {
    console.error("❌ FATAL ERROR: SECRET is not set in environment variables!");
    process.exit(1);
}

process.on('unhandledRejection', (err) => {
    if (err && err.message && err.message.includes("Cannot read properties of null (reading 'length')")) {
        return;
    }
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
    if (err && err.message && err.message.includes("Cannot read properties of null (reading 'length')")) {
        return;
    }
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

async function startApp() {
    try {
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Database: ${dbURL ? 'Connected' : 'Not set'}`);
        console.log(`🔑 Secret: ${process.env.SECRET ? 'Set' : 'Not set'}`);
        
        await mongoose.connect(dbURL);
        console.log("✅ MongoDB Connected to Atlas");
        
        const db = mongoose.connection.db;
        const client = mongoose.connection.getClient();
        
        if (!db || !client) {
            throw new Error("MongoDB connection not fully initialized");
        }
        
        const store = MongoStore.create({
            clientPromise: Promise.resolve(client),
            dbName: "wanderlust",
            collectionName: "sessions",
            touchAfter: 24 * 60 * 60,
            ttl: 7 * 24 * 60 * 60
        });

        store.on("error", (err) => {
            console.error("⚠ Session store error:", err.message);
        });

        const sessionOptions = {
            store,
            secret: process.env.SECRET,
            resave: false,
            saveUninitialized: false, 
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, 
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax" 
            }
        };

        app.set('trust proxy', 1);

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
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
}

startApp();
