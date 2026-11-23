const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
//I do this for logging in functions
const passport = require("passport");
//middleware for retrunTo
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");

//1.REGISTER ROUTES
router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

//2. LOGIN ROUTES
router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login,
  );

//3. LOGOUT ROUTE
router.get("/logout", users.logout);
module.exports = router;
