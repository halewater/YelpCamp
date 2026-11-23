const Campground = require("../models/campground");
//cloudinary (to delete images)
const { cloudinary } = require("../cloudinary");
//mapbox geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const campground = require("../models/campground");
//mapbox access token
const mapBoxToken = process.env.MAPBOX_TOKEN;
//instantiating mapboxGeocoding instance with mapbox token
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
//geocoder is a client provided by the Mapbox SDK. It allows your

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  //the below funtion uses Mapbox Geocoding API to convert a
  //place name into geographic coordinates (latitude and longitude).

  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const camp = await new Campground(req.body.campground);
  //saving the GeoJson data - geoData.body.features[0].geometry
  //outputs into mongoDB
  camp.geometry = geoData.body.features[0].geometry;

  //saving the image property into the camp document object
  camp.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.author = req.user._id;

  await camp.save();
  console.log(camp);
  req.flash("success", "Successfully made a campground!");
  res.redirect(`/campgrounds/${camp.id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  // console.log(campground);

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  //console.log(req.body);
  const { id } = req.params;

  const camp = req.body.campground;
  // console.log(camp);
  const newCamp = await Campground.findByIdAndUpdate(id, camp);
  const img = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCamp.images.push(...img);

  await newCamp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      cloudinary.uploader.destroy(filename);
    }
    await newCamp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    //console.log(newCamp);
  }

  req.flash("success", "Successfully Updated campground!");
  res.redirect(`/campgrounds/${newCamp.id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campground!");
  res.redirect("/campgrounds");
};
