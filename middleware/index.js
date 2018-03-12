var Car = require("../models/cars");
var Comment = require("../models/comments");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCarOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Car.findById(req.params.id, function(err, foundCar){
           if(err){
               req.flash("error", "Car not found!");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCar.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!")
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You do not have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;