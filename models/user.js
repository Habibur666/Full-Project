// models/user.js
// User model using passport-local-mongoose plugin.
// plugin provides username/password hashing + convenience methods like register/authenticate
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");// adds username/password fields + methods 
                                                               // for authentication

const userSchema=new Schema({
    username:String,
    password:String,
    email:String
});

userSchema.plugin(passportLocalMongoose);// adds username, hash and salt fields to store the username,
                                        // the hashed password and the salt value.

module.exports=mongoose.model("User",userSchema);