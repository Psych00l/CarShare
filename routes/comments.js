var express = require("express");
var router  = express.Router({mergeParams: true});
var Car = require("../models/cars");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find car by id
    Car.findById(req.params.id, function(err, car){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {car: car});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn,function(req, res){
   //lookup car using ID
   Car.findById(req.params.id, function(err, car){
       if(err){
           console.log(err);
           res.redirect("/cars");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
           } else {
               //add username and ID to comment
               //save comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               car.comments.push(comment);
               car.save();
               req.flash("success", "Successfully added comment!");
               res.redirect("/cars/" + car._id);
           }
        });
       }
   });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            req.flash("error", "You don't have permission to do that!");
            res.redirect("back");
        } else {
            res.render("comments/edit", {car_id: req.params.id, comment: foundComment});
        }
    });
});

//COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/cars/" + req.params.id);
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Could not delete the comment!");
            res.redirect("back");
        } else {
            req.flash("success", "Comment has been deleted!");
            res.redirect("/cars/" + req.params.id);
        }
    });
});


//middleware



module.exports = router;