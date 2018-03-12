var mongoose = require("mongoose");

var carSchema = new mongoose.Schema({
    name: String,
    image: String,
    title: String,
    description: String,
    price: String,
    location: String,
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

module.exports = mongoose.model("Car", carSchema);