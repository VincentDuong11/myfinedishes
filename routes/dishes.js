var express = require("express");
var router = express.Router();
var Dish =require("../models/dish")
var middleware = require("../middleware")
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//Index - show all dishes
router.get("/", (req, res)=>{
	//get all dishes from mongodb
	Dish.find({}, (err, allDishes) =>{
		(err) ? console.log(err) : res.render("./dishes/index", {dishes: allDishes, page: 'dishes'});
	});
});

// //create - add new dish to DB
// router.post("/", middleware.isLoggedIn, (req, res)=>{
// 	//get data from form and add to dishes array
// 	var name = req.body.name,
// 		price = req.body.price,
// 	    image = req.body.image,
// 		description = req.body.description,
// 		author = {
// 			id: req.user._id,
// 			username: req.user.username
// 		}
// 	var newDish = {name: name, price: price, image: image, description: description, author: author};
	
// 	//create new dishes and save to db
// 	Dish.create(newDish,(err, newlyDish)=>{
// 		(err) ? console.log("Error is " + err) : res.redirect("/dishes");
// 		});
	
// 	});

//CREATE - add new dish to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to dishes array
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
    var newDish = {name: name, price: price, image: image, description: description, author:author, location: location, lat: lat, lng: lng};
    // Create a new dish and save to DB
    Dish.create(newDish, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to dishes page
            console.log(newlyCreated);
            res.redirect("/dishes");
        }
    });
  });
});
//New - show form crate new dish
router.get("/new", middleware.isLoggedIn, (req, res)=>{
	res.render("dishes/new");
	
	})
//Show more info ab dish
router.get("/:id", (req, res)=>{
	//find the dishes with provided id
	Dish.findById(req.params.id).populate("comments").exec((err, foundCamp) =>{
		if(err || !foundCamp) {
			req.flash("error", "Dish not found");
			res.redirect("back");
		}else{
			res.render("dishes/show", {dish: foundCamp})
			}
		
		});
	})

//EDIT dishes route
router.get("/:id/edit", middleware.checkCampOwn, (req, res)=>{
			Dish.findById(req.params.id,  (err, foundCamp) =>{
		 // err ? res.send("Err") : 
				res.render("dishes/edit", {dish: foundCamp})	
		})
})
//UPDATE dishes route
// router.put("/:id", middleware.checkCampOwn, (req, res)=>{
// 	Dish.findByIdAndUpdate(req.params.id, req.body.dish, (err, updatedCamp)=>{
// 		err ? res.redirect("/dishes") : req.flash("success", "Successfully update your post!"); res.redirect("/dishes/" + req.params.id);
// 	})
// })

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampOwn, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.dish.lat = data[0].latitude;
    req.body.dish.lng = data[0].longitude;
    req.body.dish.location = data[0].formattedAddress;

    Dish.findByIdAndUpdate(req.params.id, req.body.dish, function(err, updatedCamp){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/dishes/" + updatedCamp._id);
        }
    });
  });
});


// // PUT - updates dish in the database
// router.put("/:id", middleware.checkCampOwn, function(req, res){
//   geocoder.geocode(req.body.location, function (err, data) {
//     var lat = data.results[0].geometry.location.lat;
//     var lng = data.results[0].geometry.location.lng;
//     var location = data.results[0].formatted_address;
//     var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
//     Dish.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, dish){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/dishes/" + dish._id);
//         }
//     });
//   });
// });


//DESTROY dishes router
router.delete("/:id", middleware.checkCampOwn, (req, res)=>{
	Dish.findByIdAndRemove(req.params.id, err => {
		 err ? res.redirect("/dishes") :  req.flash("success","Successfully delete!"); res.redirect("/dishes")
	})
})


module.exports = router;