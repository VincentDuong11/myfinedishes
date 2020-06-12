var express = require("express");
var router = express.Router();
var passport = require("passport")
var User = require("../models/user")

//root route
router.get("/", (req, res)=>{
	res.render("landing")
})




// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle Sign up logic
router.post("/register", (req, res)=>{
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user)=>{
		if (err){
			req.flash("err ", {error: err.message})
			return res.render("register");
		}
		passport.authenticate("local")(req, res, ()=>{
			req.flash("success", "Welcome to MyBoss " + user.username);
			res.redirect("/campgrounds");
		})
	})
})

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handle login logic
router.post("/login",passport.authenticate("local", 
											{
												// successRedirect: "/campgrounds",
												// successFlash: "Welcome",
												failureRedirect: "/login",
												failureFlash: true
											}), (req, res)=>{
													  req.flash("success", "Welcome back! " + req.body.username);
														res.redirect("/campgrounds");
														})

//show logout route
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success", "Logged you out")
	res.redirect("/campgrounds");
})



module.exports = router;
