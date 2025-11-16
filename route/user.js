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
  failureFlash: true,
  failureRedirect: "/login"
}), 
async (req, res) => {
  req.flash("success", "Logged In Successfully");
  let redirectUrl=res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
});

router.get("/logout", controllerUser.logoutUser);

module.exports=router;