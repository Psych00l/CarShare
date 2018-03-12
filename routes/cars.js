var express = require("express");
var router = express.Router();
var Car = require("../models/cars");
var middleware = require("../middleware");
var noMatch = null;
var multer = require("multer");
var tmp;
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_PASS,
});

router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Car.find({"name": regex}, function(err, allCars){
            if(err){
                console.log(err);
            } else {
                if(allCars.length <1 ){
                  req.flash("error","Sorry, no cars found matching your search");
                  return res.redirect("/cars");
                }
            }
        }); 
    } else {
        Car.find({}, function(err, allCars){
            if(err){
                console.log(err);
            } else {
                res.render("cars/index", {cars: allCars, noMatch: noMatch});
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    //get data from form and add to cars array
    cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the car object under image property
    req.body.car.image = result.secure_url;
  // add author to car
    req.body.car.author = {
        id: req.user._id,
        username: req.user.username
    };
      Car.create(req.body.car, function(err, car) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/cars/' + car.id);
      });
    });
});

//new - show form to create new car
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("cars/new");
});

//SHOW - shows more info about one car
router.get("/:id", function(req, res){
    Car.findById(req.params.id).populate("comments").exec(function(err, foundCar){
        if(err){
            console.log(err);
        } else {
            res.render("cars/show", {car: foundCar});  
        }
    });
});

//EDIT CAR ROUTE
router.get("/:id/edit", middleware.checkCarOwnership, function (req, res){
    //is user logged in
    Car.findById(req.params.id, function(err, foundCar){
        res.render("cars/edit", {car: foundCar});    
    });
});



// UPDATE CAR ROUTE
router.put("/:id", middleware.isLoggedIn, upload.single('image'), function(req, res) {
//Code below checks if there is a file uploaded or not and on that creates an URL or not.
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function(result){
            req.body.car.image = result.secure_url;
            Car.findByIdAndUpdate(req.params.id, req.body.car, function(err, car){
                if(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                res.redirect("/cars/" + req.params.id);
            });
        });
    } else {
        Car.findByIdAndUpdate(req.params.id, req.body.car, function(err, car){
            if(err){
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.redirect("/cars/" + req.params.id);
        });
    }
});
   






// DESTROY CAR ROUTE
router.delete("/:id", middleware.checkCarOwnership, function(req, res){
    Car.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/cars");
        } else {
            res.redirect("/cars");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;