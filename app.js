//YelpCamp App

//Require NPM app
var express           = require("express"),
	app               = express(),
 	bodyParser        = require("body-parser"),
	mongoose 		  = require("mongoose"),
	passport          = require("passport"),
	LocalStrategy     = require("passport-local"),
	methodOverride 	  = require("method-override"),
	flash 			  = require("connect-flash")

//Require classes
var Campground        = require("./models/campground"),
	Comment           = require("./models/comment"),
	seedDB            = require("./seeds"),
	User              = require("./models/user")

//requiring routes
var commentRoutes     = require("./routes/comments"),
	campgroundRoutes  = require("./routes/campgrounds"),
	indexRoutes       = require("./routes/index")



mongoose.connect("mongodb://localhost/myboss_v1", {
useUnifiedTopology: true,
useNewUrlParser: true,
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //Seed the database


//Passport Configuration
app.use(require("express-session")({
		secret: "Sunny is the best",
		resave: false,
		saveUninitialized: false 
		}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next)=>{
		res.locals.currentUser = req.user;
		res.locals.error = req.flash("error")
		res.locals.success = req.flash("success")
		next();
		})

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.listen(3000, process.env.IP, ()=> {
	console.log("The YelpCamp server is running!");
})