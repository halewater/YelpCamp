const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");

//moved out validate reviews middleware to middleware.js
const { validateReview } = require("../middleware");
//middleware for validate review
const { isLoggedIn } = require("../middleware");
//I require this middleware to check if the user is logged in before making a review
const { isReviewAuthor } = require("../middleware");
//middleware to chech the author when deleting reviews

//review controllers
const reviews = require("../controllers/reviews");

//review routes
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview),
);

module.exports = router;
