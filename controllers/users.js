const User=require("../models/user.js");

module.exports.renderSignupUser=(req,res)=>{
  res.render("users/signup.ejs");
};

module.exports.signupUser=async (req,res,next)=>{ 
  try{
  let {username, email, password}=req.body;
  let newUser=new User({username, email});
  let registeredUser=await User.register(newUser, password);
  console.log(registeredUser);
  req.login(registeredUser, (err)=>{
    if(err) return next(err);
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
  });
  
  } catch(e){
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