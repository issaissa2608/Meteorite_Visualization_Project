// Store our API endpoint as queryUrl.
let queryUrl = "https://data.nasa.gov/resource/gh4g-9sfh.json";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data array to the createFeatures function.
  createFeatures(data);
});

function createFeatures(meteoriteData) {
  // Create separate arrays to hold the "Fell" and "Found" meteorite markers.
  let fellMarkers = [];
  let foundMarkers = [];

  // Define color scale based on mass.
  let colorScale = d3.scaleLinear()
    .domain([0, 100, 1000, 10000, 100000, 1000000, 10000000])
    .range(["aqua", "blue", "green", "olive", "orange", "orangered", "red"]);

  // Loop through the meteoriteData array.
  meteoriteData.forEach(function (feature) {
    // Make sure this feature has a geolocation property and fall status before proceeding.
    if (feature.geolocation && feature.fall) {
      // Extract the coordinates from the geolocation property.
      let latitude = parseFloat(feature.geolocation.latitude);
      let longitude = parseFloat(feature.geolocation.longitude);

      // Parse the mass value as a float.
      let mass = parseFloat(feature.mass);

      // Define marker options based on mass and fall status.
      let markerOptions = {
        radius: 12, // Default marker size
        color: "blue" // Default marker color
      };

      // Check the fall status and update the marker color.
      if (feature.fall === "Fell") {
        markerOptions.color = "white"; // Change color for "Fell" meteorites
      } else if (feature.fall === "Found") {
        markerOptions.color = "black"; // Change color for "Found" meteorites
      }

      // Check the mass value and update the marker color and size.
      if (mass < 100) {
        markerOptions.color = colorScale(0);
        markerOptions.radius = 10;
      } else if (mass >= 100 && mass <= 1000) {
        markerOptions.color = colorScale(100);
        markerOptions.radius = 10;
      } else if (mass > 1000 && mass <= 10000) {
        markerOptions.color = colorScale(1000);
        markerOptions.radius = 10;
      } else if (mass > 10000 && mass <= 100000) {
        markerOptions.color = colorScale(10000);
        markerOptions.radius = 10;
      } else if (mass > 100000 && mass <= 1000000) {
        markerOptions.color = colorScale(100000);
        markerOptions.radius = 12;
      } else if (mass > 1000000 && mass <= 10000000) {
        markerOptions.color = colorScale(1000000);
        markerOptions.radius = 12;
      } else if (mass > 10000000) {
        markerOptions.color = colorScale(10000000);
        markerOptions.radius = 12;
      }

      // Create a marker with a popup that includes the name and mass.
      let marker = L.circleMarker([latitude, longitude], markerOptions)
        .bindPopup(`<h3>${feature.name}</h3><hr><p>${feature.mass}</p>`);

      // Check the fall status and add the marker to the corresponding array.
      if (feature.fall === "Fell") {
        fellMarkers.push(marker);
      } else if (feature.fall === "Found") {
        foundMarkers.push(marker);
      }
    }
  });

  function createMap(fellMeteorites, foundMeteorites) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };

    // Create the map, giving it the streetmap layer as the default.
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [street, fellMeteorites] // Set initial layers on the map
    });

    // Create an overlay object to hold the overlay layers.
    let overlayMaps = {
      "Fell Meteorites": fellMeteorites,
      "Found Meteorites": foundMeteorites
    };

    // Add the control layer to the map.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Create a legend for the color scale.
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "legend");

      let title = "<strong>Mass (grams)</strong>";
      div.innerHTML += title + "<br>";

      let labels = [
        "< 100",
        "100 - 1,000",
        "1,000 - 10,000",
        "10,000 - 100,000",
        "100,000 - 1,000,000",
        "1,000,000 - 10,000,000",
        "> 10,000,000"
      ];

      let colors = ["aqua", "blue", "green", "olive", "orange", "orangered", "red"];

      for (let i = 0; i < labels.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' + labels[i] + '<br>';
      }

      return div;
    };

    legend.addTo(myMap);
  }

  createMap(L.layerGroup(fellMarkers), L.layerGroup(foundMarkers));
}
