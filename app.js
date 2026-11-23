/*
CONTENT SECURITY POLICY
-----------------------
Here i will talk about CSP -content security policy and
add in the needed code
*/
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
//const dbUrl = process.env.DB_URL;

//"mongodb://127.0.0.1:27017/yelp-camp3"
//console.log("DB_URL:", dbUrl);

dbUrl = "mongodb://127.0.0.1:27017/yelp-camp3";

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

//MongoDB as session store we are not relying on default memory store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

//sesssion
const sessionConfig = {
  store,
  name: "mysession",
  secret: "thisshouldbeabettersecret",
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

app.listen(8080, () => {
  console.log("Serving on port 8080");
});

/*
CONTENT SECURITY POLICY
-----------------------
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

Here using regular helmet, if we don't turn off that one content
security policy middleware, It breaks a lot in our map

The images doesn't load, the map doesn't load, certain scripts 
aren't going to work, there is a lot of red in the console and
they all say around content security policy CSP

So in helmet 
this one middleware
helmet.contentSecurityPolicy(options)
sets the header called Content-Security-Policy which helps 
mitigate cross site scripting attacks

So CSP is an extra layer of security that allows us to specify 
on this one application/website that you are on
You are only allowed to display images from Unsplash, You are
only allowed to run scripts form that come from this paticular
website, and you are only allowed to display fonts form this
website etc

You can specify alist of acceptable sources and that is the whole
point of CSP

SO CSP is about designating your own policy on what is allowed and
what is not allowed for things like images, scripts, fonts, media
objects 

there are these different directives 
and for each one you can specify the locations, that these type
of resource is allowed to be loaded or fetched from

for example, if you are looking at font source, you could specify
things like self -> refers to the same origin wherever document 
is being served
So if we set font source to be self, it would be just saying from
our YelpCamp App; if there is a font that we have as a file
But it would not allow us to use fonts from google fonts (for eg)
*/

/*
When we configure the content security policy in helmet we can
pass in our options, the default looks like this

default-src 'self';
base-uri 'self';
font-src 'self' https: data:;
form-action 'self';
frame-ancestors 'self';
img-src 'self' data:;
object-src 'none';
script-src 'self';
script-src-attr 'none';
style-src 'self' https: 'unsafe-inline';
upgrade-insecure-requests

Setting the directives in CSP in helmet will give out a header to
the browser saying
content security policy -> <specification>
which the browser sees and decides -> Oh we are only allowed to
load fonts form this place, we are only allowed to store images
from self, unsplash is not allowed but if I have a local image
it would be allowed etc

So confuguring our own policy looks like this:
// Sets "Content-Security-Policy: default-src 'self';
// script-src 'self' example.com;object-src 'none';
// upgrade-insecure-requests"

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "example.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);
*/
