const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//set config on cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, //Assuming that is what we named the environment variable
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//connects multer with cloudinary
//creating instance of the cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp3",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
