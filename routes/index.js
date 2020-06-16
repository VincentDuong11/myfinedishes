var express = require("express");
var router = express.Router();
var passport = require("passport")
var User = require("../models/user")
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require('crypto')
//root route
router.get("/", (req, res)=>{
	res.render("landing")
})

//about route
router.get("/about", (req, res)=>{
	res.render("about" , {page: 'about'})
})


// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});


//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
	if(req.body.admin === 'chanh0511') {newUser.isAdmin = true} 
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Welcome to Myfinedishes " + req.body.username);
           res.redirect("/dishes"); 
        });
    });
});


//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handle login logic
router.post("/login",passport.authenticate("local", 
											{
												// successRedirect: "/dishes",
												// successFlash: "Welcome",
												failureRedirect: "/login",
												failureFlash: true
											}), (req, res)=>{
													  req.flash("success", "Welcome back! " + req.body.username);
														res.redirect("/dishes");
														})

//show logout route
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success", "Logged you out")
	res.redirect("/dishes");
})

//Forgot Password





module.exports = router;
