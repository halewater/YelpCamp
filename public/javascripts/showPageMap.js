//1. Instantiate a Map

// creates the map, passing your access token to associate it with your Mapbox account, and setting the container, initial center, and zoom level
const map = new mapboxgl.Map({
  accessToken: mapToken,
  container: "map", // container ID
  style: "mapbox://styles/mapbox/standard",
  center: campground.geometry.coordinates, //original [-71.06776, 42.35816], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 10, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//2.We add a marker to the map

var marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${campground.title}</h4> <p>${campground.location}</p>`,
    ),
  )

  .addTo(map);
