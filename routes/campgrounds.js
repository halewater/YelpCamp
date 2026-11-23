const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { isLoggedIn } = require("../middleware");
//isAuthor and validateCampground middleware
const { isAuthor, validateCampground } = require("../middleware");
//controller routes
const campgrounds = require("../controllers/campgrounds");

//multer for parsing the multipart file from
const multer = require("multer");

//cloudinary storage - I will require the CloudinaryStorage instance
const { storage } = require("../cloudinary");

//I will then pass in storage object as destination to
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground),
  );

//new
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground),
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm),
);

module.exports = router;
