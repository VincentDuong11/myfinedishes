var mongoose = require("mongoose")
//Schema setup

var dishSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	location: String,
    lat: Number,
    lng: Number,
	price: String,
	createdAt: { type: Date, default: Date.now },
	author: {
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User"
					},
				username: String
			},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});


module.exports = mongoose.model("Campground", dishSchema);