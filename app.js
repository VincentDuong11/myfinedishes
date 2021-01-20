require('dotenv').config()

//myfinefishes App

//Require NPM app
var express               = require("express"),
	app               = express(),
 	bodyParser        = require("body-parser"),
	mongoose 	  = require("mongoose"),
	moment 		  = require('moment'),
	passport          = require("passport"),
	LocalStrategy     = require("passport-local"),
	methodOverride 	  = require("method-override"),
	flash 			  = require("connect-flash")

//Require classes
var 	Dish              = require("./models/dish"),
	Comment           = require("./models/comment"),
	seedDB            = require("./seeds"),
	User              = require("./models/user")

//requiring routes
var	commentRoutes     = require("./routes/comments"),
	dishRoutes        = require("./routes/dishes"),
	indexRoutes       = require("./routes/index")


var url = process.env.DATABASEURL || "mongodb://localhost/myboss_v1";

mongoose.connect(url, {
useUnifiedTopology: true,
useNewUrlParser: true,
}).then(() =>{
	console.log('Connected to DB!');
}).catch(err =>{
	console.log('ERROR: ', err.message)
});



app.locals.moment = moment;
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
app.use("/dishes", dishRoutes);
app.use("/dishes/:id/comments", commentRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//change port:3000 to  process.env.PORT  for Heroku

app.listen(process.env.PORT, process.env.IP, ()=> {
	console.log("The YelpCamp server is running!");
})
