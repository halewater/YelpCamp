//this creates the map
const map = new mapboxgl.Map({
  accessToken: mapToken,
  container: "cluster-map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/standard",
  config: {
    basemap: {
      theme: "faded", //monochrome or faded or default
      lightPreset: "day", //dawn or night or dusk or day
    },
  },
  center: [-103.5917, 40.6699], //this is where we center the map
  zoom: 3,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//map.on(),.addSource(), .addLayer() are events we can listen for
//and "load", "earthquake", "mouseenter" are events we add
map.on("load", () => {
  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.

  //this is registering a source of data for the map
  map.addSource("campgrounds", {
    type: "geojson",
    generateId: true,
    // Point to GeoJSON data.
    //Here I add my source data as campgrounds
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  //Here we are referring back to the data form the source when we
  //add different layers

  //this has id, type source etc and this controls the size of the
  //circle and color of the circle depending on the number of points in it
  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "campgrounds",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#51bbd6",
        5,
        "#f1f075",
        10,
        "#f28cb1",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 5, 30, 10, 40],
      "circle-emissive-strength": 1,
    },
  });

  //this shows the count of campgrounds in a cluster
  //another part of this layer for the text
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "campgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  //this is for unclustered singular point
  map.addLayer({
    id: "unclustered-point",
    type: "circle", //"symbol",
    source: "campgrounds",
    filter: ["!", ["has", "point_count"]],

    paint: {
      "circle-color": "#1165da",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
      "circle-emissive-strength": 1,
    },

    //So I changed paint to layout
    /*
    layout: {
      "icon-image": "hotel-15",
      "icon-size": 1,
      "icon-allow-overlap": true,
    },*/
  });

  // When a click event occurs on a cluster,
  // getClusterExpansionZoom grabs the zoomlevel where the cluster expands
  // Then the viewport zooms in to show the expanded cluster
  // Displaying the underlying individual points and/or smaller clusters
  map.addInteraction("click-clusters", {
    type: "click",
    target: { layerId: "clusters" },
    handler: (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map
        .getSource("campgrounds")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    },
  });

  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.addInteraction("click-unclustered-point", {
    type: "click",
    target: { layerId: "unclustered-point" },
    handler: (e) => {
      //changed this
      const text = e.feature.properties.popUpMarkup;

      const coordinates = e.feature.geometry.coordinates.slice();

      console.log(text);

      new mapboxgl.Popup().setLngLat(coordinates).setHTML(text).addTo(map);
    },
  });

  // Change the cursor to a pointer when the mouse is over a cluster of POIs.
  map.addInteraction("clusters-mouseenter", {
    type: "mouseenter",
    target: { layerId: "clusters" },
    handler: () => {
      map.getCanvas().style.cursor = "pointer";
    },
  });

  // Change the cursor back to a pointer when it stops hovering over a cluster of POIs.
  map.addInteraction("clusters-mouseleave", {
    type: "mouseleave",
    target: { layerId: "clusters" },
    handler: () => {
      map.getCanvas().style.cursor = "";
    },
  });

  // Change the cursor to a pointer when the mouse is over an individual POI.
  map.addInteraction("unclustered-mouseenter", {
    type: "mouseenter",
    target: { layerId: "unclustered-point" },
    handler: () => {
      map.getCanvas().style.cursor = "pointer";
    },
  });

  // Change the cursor back to a pointer when it stops hovering over an individual POI.
  map.addInteraction("unclustered-mouseleave", {
    type: "mouseleave",
    target: { layerId: "unclustered-point" },
    handler: () => {
      map.getCanvas().style.cursor = "";
    },
  });
});
