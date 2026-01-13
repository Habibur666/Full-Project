const User=require("../models/user.js");
const { body, validationResult } = require("express-validator");

module.exports.renderSignupUser=(req,res)=>{
  res.render("users/signup.ejs");
};

module.exports.signupUser=async (req,res,next)=>{ 
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", "Invalid input. Please check your details.");
      return res.redirect("/signup");
    }

    let {username, email, password}=req.body;
    if (!username || !email || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    let newUser=new User({username, email});
    let registeredUser=await User.register(newUser, password);

    req.login(registeredUser, (err)=>{
      if(err){
        console.error("Login error:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/login");
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  
  } catch(e){
    console.error("Signup error:", e);
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.loginUser=(req,res)=>{
  res.render("users/login.ejs");
};

module.exports.logoutUser=(req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out Successfully");
    res.redirect("/listings");
  });
};