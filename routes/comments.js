var express = require("express");
var router = express.Router({mergeParams: true});
var Dish = require("../models/dish")
var Comment = require("../models/comment")
var middleware = require("../middleware")


//Comment new
router.get("/new", middleware.isLoggedIn, (req, res)=>{
	Dish.findById(req.params.id, (err, dish)=>{
		if(err){
			console.log("err")
		} else{
			res.render("comments/new", {dish: dish})
		} 
	})		
})

//comments create
router.post("/", middleware.isLoggedIn, (req, res)=>{
	Dish.findById(req.params.id, (err, dish)=>{
		if (err){
			res.redirect("/dishes");
		}else{	
			Comment.create(req.body.comment, (err, comment)=>{
				if (err){
					res.redirect("/dishes")
				}else {
					//add username and id to comments
					comment.author.id = req.user._id
					comment.author.username = req.user.username
					//save the comments
					comment.save()
					
					dish.comments.push(comment);
					dish.save();
					req.flash("success", "Successfully added comment!")
					res.redirect("/dishes/" + dish._id);
				   }
			})
		
			}
		})
	})
//Comment edit route
 router.get("/:comment_id/edit", middleware.checkCommentOwn,  (req, res)=>{
	 Dish.findById(req.params.id, (err, foundDish)=>{
		 if(err || !foundDish){
			 req.flash("error", "No Dish found");
			 res.redirect("back");
		 }else{
			 	 Comment.findById(req.params.comment_id, (err, foundComment)=>{
			 		err ? res.redirect("back") :  res.render("comments/edit", {dish_id: req.params.id, comment: foundComment, dish: foundDish})
			 	})
			 }
		})
	})
//Comment update route
 router.put("/:comment_id", middleware.checkCommentOwn, (req, res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
		err ? res.redirect("/dishes") : req.flash("success", "Successfully update comment!"); res.redirect("/dishes/" + req.params.id);
	})
	
 })
//Comment destroy
router.delete("/:comment_id", middleware.checkCommentOwn, (req, res)=>{
	Comment.findByIdAndRemove(req.params.comment_id, err => {
		if(err){
			res.redirect("back")
		} else{
			req.flash("success", "Comment successully deleted!"); 
			res.redirect("/dishes/" + req.params.id)
		} 
	})
})



//middleware checking login
function isLoggedIn(req, res, next){
	!req.isAuthenticated() ? res.redirect("/login") : next();
};


module.exports = router;