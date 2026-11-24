if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
app.set("query parser", "extended");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");
//session
const session = require("express-session");
//flash
const flash = require("connect-flash");
//passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
//this is the local strategy section that passport provides
//user model for authentication
const User = require("./models/user.js");
//user routes
const userRoutes = require("./routes/users.js");
//requiring sanitizer from utils
const sanitizeV5 = require("./utils/mongoSanitizeV5.js");

//requiring helmet
const helmet = require("helmet");

//requiring mongodb store to replace memory store for session
const { MongoStore } = require("connect-mongo");

//database URL
//console.log("DB_URL:", dbUrl);

dbUrl = "mongodb://127.0.0.1:27017/yelp-campW";
//process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Mongo Connection successful");
  })
  .catch(() => {
    console.log("Mongo connection failed");
  });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
//adding static directory
app.use(express.static(path.join(__dirname, "public")));

//sanitize
app.use(sanitizeV5());

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

//MongoDB as session store we are not relying on default memory store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

//sesssion
const sessionConfig = {
  store,
  name: "mysession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
//flash
app.use(flash());

//helmet
app.use(helmet());

//setting CSP links
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com",
];
const fontSrcUrls = [];

//running CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/syicct8d/", //my cloudinary account
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

//passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//global middleware
//with flash middleware
app.use((req, res, next) => {
  //console.log(req.query);
  //console.log(req.session); //To view the session
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

//campgrounds routes
app.use("/campgrounds", campgroundRoutes);

//reviews routes
app.use("/campgrounds/:id/reviews", reviewRoutes);

//users routes
app.use("/", userRoutes);

//catch all invalid routes
app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no Something went wrong!";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
