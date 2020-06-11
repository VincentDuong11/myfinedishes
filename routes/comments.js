var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground")
var Comment = require("../models/comment")
var middleware = require("../middleware")


//Comment new
router.get("/new", middleware.isLoggedIn, (req, res)=>{
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			console.log("err")
		} else{
			res.render("comments/new", {campground: campground})
		} 
	})		
})

//comments create
router.post("/", middleware.isLoggedIn, (req, res)=>{
	Campground.findById(req.params.id, (err, campground)=>{
		if (err){
			res.redirect("/campgrounds");
		}else{	
			Comment.create(req.body.comment, (err, comment)=>{
				if (err){
					res.redirect("/campgrounds")
				}else {
					//add username and id to comments
					comment.author.id = req.user._id
					comment.author.username = req.user.username
					//save the comments
					comment.save()
					
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added comment!")
					res.redirect("/campgrounds/" + campground._id);
				   }
			})
		
			}
		})
	})
//Comment edit route
 router.get("/:comment_id/edit", middleware.checkCommentOwn,  (req, res)=>{
	 Campground.findById(req.params.id, (err, foundCamp)=>{
		 if(err || !foundCamp){
			 req.flash("error", "No Campground found");
			 res.redirect("back");
		 }else{
			 	 Comment.findById(req.params.comment_id, (err, foundComment)=>{
			 		err ? res.redirect("back") :  res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
			 	})
			 }
		})
	})
//Comment update route
 router.put("/:comment_id", middleware.checkCommentOwn, (req, res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
		err ? res.redirect("/campgrounds") : req.flash("success", "Successfully update comment!"); res.redirect("/campgrounds/" + req.params.id);
	})
	
 })
//Comment destroy
router.delete("/:comment_id", middleware.checkCommentOwn, (req, res)=>{
	Comment.findByIdAndRemove(req.params.comment_id, err => {
		if(err){
			res.redirect("back")
		} else{
			req.flash("success", "Comment successully deleted!"); 
			res.redirect("/campgrounds/" + req.params.id)
		} 
	})
})



//middleware checking login
function isLoggedIn(req, res, next){
	!req.isAuthenticated() ? res.redirect("/login") : next();
};


module.exports = router;