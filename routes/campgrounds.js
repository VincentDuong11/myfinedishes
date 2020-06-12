var express = require("express");
var router = express.Router();
var Campground =require("../models/campground")
var middleware = require("../middleware")
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//Index - show all campgrounds
router.get("/", (req, res)=>{
	//get all campgrounds from mongodb
	Campground.find({}, (err, allCampgrounds) =>{
		(err) ? console.log(err) : res.render("./campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
	});
});

// //create - add new campground to DB
// router.post("/", middleware.isLoggedIn, (req, res)=>{
// 	//get data from form and add to campgrounds array
// 	var name = req.body.name,
// 		price = req.body.price,
// 	    image = req.body.image,
// 		description = req.body.description,
// 		author = {
// 			id: req.user._id,
// 			username: req.user.username
// 		}
// 	var newCampground = {name: name, price: price, image: image, description: description, author: author};
	
// 	//create new campgrounds and save to db
// 	Campground.create(newCampground,(err, newlyCampground)=>{
// 		(err) ? console.log("Error is " + err) : res.redirect("/campgrounds");
// 		});
	
// 	});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err.message)
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, price: price, image: image, description: description, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});
//New - show form crate new campground
router.get("/new", middleware.isLoggedIn, (req, res)=>{
	res.render("campgrounds/new");
	
	})
//Show more info ab campground
router.get("/:id", (req, res)=>{
	//find the campgrounds with provided id
	Campground.findById(req.params.id).populate("comments").exec((err, foundCamp) =>{
		if(err || !foundCamp) {
			req.flash("error", "Campground not found");
			res.redirect("back");
		}else{
			res.render("campgrounds/show", {campground: foundCamp})
			}
		
		});
	})

//EDIT campgrounds route
router.get("/:id/edit", middleware.checkCampOwn, (req, res)=>{
			Campground.findById(req.params.id,  (err, foundCamp) =>{
		 // err ? res.send("Err") : 
				res.render("campgrounds/edit", {campground: foundCamp})	
		})
})
//UPDATE campgrounds route
// router.put("/:id", middleware.checkCampOwn, (req, res)=>{
// 	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCamp)=>{
// 		err ? res.redirect("/campgrounds") : req.flash("success", "Successfully update your post!"); res.redirect("/campgrounds/" + req.params.id);
// 	})
// })

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampOwn, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DESTROY campgrounds router
router.delete("/:id", middleware.checkCampOwn, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, err => {
		 err ? res.redirect("/campgrounds") :  res.redirect("/campgrounds")
	})
})


module.exports = router;