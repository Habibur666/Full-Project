// route/user.js
// Authentication routes (signup, login, logout)
// Uses passport-local for authentication and exposes redirect handling via middleware
const express = require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const controllerUser=require("../controllers/users.js");

router.route("/signup")
.get(controllerUser.renderSignupUser)
.post(wrapAsync(controllerUser.signupUser));

router.route("/login")
  .get(controllerUser.loginUser)
  .post(saveRedirectUrl, passport.authenticate("local", {
  failureFlash: true,//লগইন ব্যর্থ হলে একটি ফ্ল্যাশ মেসেজ দেখাবে (যেমন “Invalid username/password”)
  failureRedirect: "/login"//ব্যর্থ হলে /login পেজে ফেরত পাঠাবে
}), 
async (req, res) => {
  req.flash("success", "Logged In Successfully");
  let redirectUrl=res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
});

router.get("/logout", controllerUser.logoutUser);

module.exports=router;