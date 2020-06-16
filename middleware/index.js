//All middleware goes here
var middlewareObj = {}
var Campground = require("../models/campground")
var Comment = require("../models/comment")

middlewareObj.checkCampOwn = function (req, res, next){
	if(req.isAuthenticated()){
			Campground.findById(req.params.id, (err, foundCamp)=>{
			 if(err || !foundCamp){
				 req.flash("error", "Campground not found")
				 res.redirect("back")
			}else{
					if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){
					 next()
					}else {
					  req.flash("error", "Permission denied! ")
					  res.redirect("back")
					}
			}
		})  
	}else {
		res.redirect("back")
	}
}

middlewareObj.checkCommentOwn = function (req, res, next){
	if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id, (err, foundCom)=>{
			 if(err || !foundCom){
				 req.flash("error", "Comment not found")
				 res.redirect("back")
			 }else{
				  if(foundCom.author.id.equals(req.user._id) || req.user.isAdmin){
					  next() 
				  }else{
					  req.flash("error", "Permission denied! ");
					  res.redirect("back");		
				  } 
			 }
		})  
	}else {
		res.redirect("back")
	}
}

//middleware checking login
middlewareObj.isLoggedIn = function (req, res, next){
	if(!req.isAuthenticated()){
		req.flash("error", "You are not logged in ");
		res.redirect("/login");
	} else{
		next();
	}
	 
};


module.exports = middlewareObj;