const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-campW")
  .then(() => {
    console.log("Mongo Connection successful");
  })
  .catch(() => {
    console.log("Mongo connection failed");
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];
//retruns a random array element

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10; //generating random price
    const camp = new Campground({
      location: `${cities[random1000].city},${cities[random1000].state}`,

      title: `${sample(descriptors)} ${sample(places)}`,

      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque pretium convallis velit sit amet sagittis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis quis arcu laoreet, gravida libero ut, efficitur ipsum. ",

      price, //same as price:price

      //adding in author for every campground as default when the seed file runs
      //I changed the author object id here while changing the database to yelp-camp2
      author: "6b042f8e96b0c22ef4434cab",

      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },

      images: [
        {
          url: "https://res.cloudinary.com/syicct8d/image/upload/v1793429883/YelpCamp2/syolgyy7sae0tnsc6ggl.jpg",
          filename: "YelpCamp2/syolgyy7sae0tnsc6ggl",
        },
        {
          url: "https://res.cloudinary.com/syicct8d/image/upload/v1793429888/YelpCamp2/l4r6yvncxsz82yt9x7sz.jpg",
          filename: "YelpCamp2/l4r6yvncxsz82yt9x7sz",
        },
      ],
    });

    await camp.save();
  }
};
seedDB().then(() => {
  mongoose.connection.close();
});
