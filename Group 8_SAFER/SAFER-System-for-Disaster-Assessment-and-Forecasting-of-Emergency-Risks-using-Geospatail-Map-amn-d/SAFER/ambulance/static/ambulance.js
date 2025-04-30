let latitude, longitude, userLocationMarker, map;
let trackedUserMarkers = {}; // Store markers for tracked users
let routeControl;

function userLocation() {
  function success(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    initializeMap(latitude, longitude);
    userLocationMarker = L.marker([latitude, longitude]).addTo(map);
    userLocationMarker.bindPopup("<b>Your Location</b>").openPopup();
    fetchTrackedLocations(); // Fetch tracked locations after loading the map
  }

  function error() {
    latitude = document.getElementById("latitude").value;
    longitude = document.getElementById("longitude").value;
    initializeMap(latitude, longitude);
    var circle = L.circle([latitude, longitude], {
      color: "blue",
      fillColor: "#ADD8E6",
      fillOpacity: 0.2,
      radius: 500,
    }).addTo(map);
    circle
      .bindPopup("<b>Please allow location</b><br>for improved accuracy")
      .openPopup();
    fetchTrackedLocations(); // Fetch tracked locations even if location isn't allowed
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

function initializeMap(latitude, longitude) {
  map = L.map("map", {
    center: [latitude, longitude],
    zoom: 15,
    attributionControl: false,
  });

  L.tileLayer("http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}", {
    maxZoom: 18,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);
}

// Function to fetch and update tracked user locations
function fetchTrackedLocations() {
  fetch("/ambulance/receive-location/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success" && data.locations) {
        updateTrackedUserMarkers(data.locations);
      }
    })
    .catch((error) =>
      console.error("❌ Error fetching tracked locations:", error)
    );
}

// Function to update tracked users' markers on the map
function updateTrackedUserMarkers(locations) {
  // Remove old markers first
  for (let ip in trackedUserMarkers) {
    if (!locations[ip]) {
      map.removeLayer(trackedUserMarkers[ip]);
      delete trackedUserMarkers[ip];
    }
  }

  // Add new markers
  for (let ip in locations) {
    let { latitude, longitude } = locations[ip];

    if (trackedUserMarkers[ip]) {
      // Update existing marker position
      trackedUserMarkers[ip].setLatLng([latitude, longitude]);
    } else {
      // Create a new marker
      let marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(
        map
      );
      marker.bindPopup(`<b>Tracked User</b><br>IP: ${ip}`).openPopup();
      trackedUserMarkers[ip] = marker;
    }
  }
}

// Custom icon for tracked users
let userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Example marker icon
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Fetch tracked locations every 10 seconds
setInterval(fetchTrackedLocations, 10000);

// Initialize map and location tracking
window.addEventListener("load", userLocation);

function getCSRFToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]").value; // Get CSRF token
}

function callAmbulance() {
  let latitude = document.getElementById("latitude").value;
  let longitude = document.getElementById("longitude").value;
  let csrfToken = getCSRFToken();

  fetch("/ambulance/send_sms/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRFToken": csrfToken, // CSRF token for security
    },
    body: `latitude=${latitude}&longitude=${longitude}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert(
          "SMS sent successfully! Help is on the way. Stay safe, and use our Quick Aid feature in case of an emergency."
        );
      } else {
        alert("Error sending SMS. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Something went wrong! Please try again.");
    });
}

// Initialize Speech Recognition
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";

// Modify voice recognition to handle both commands
function startVoiceRecognition() {
  recognition.start();
  recognition.onresult = function (event) {
    let voiceCommand = event.results[0][0].transcript.toLowerCase();
    console.log("Voice Command: ", voiceCommand);

    if (voiceCommand.includes("show nearby hospital")) {
      fetchNearbyLocations("hospital");
    } else if (voiceCommand.includes("show nearby police station")) {
      fetchNearbyLocations("police");
    } else if (voiceCommand.includes("show nearby shelter")) {
      fetchNearbyLocations("shelter");
    } else if (voiceCommand.includes("zoom in")) {
      map.zoomIn();
    } else if (voiceCommand.includes("zoom out")) {
      map.zoomOut();
    }
  };
}


function fetchNearbyLocations(type) {
  if (!latitude || !longitude) {
    alert("Location not available. Please enable GPS.");
    return;
  }

  let amenityType;
  if (type === "hospital") {
    amenityType = "hospital";
  } else if (type === "police") {
    amenityType = "police";
  } else if (type === "shelter") {
    amenityType = "shelter"; // Add shelter
  }

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${amenityType}"](around:5000,${latitude},${longitude});out;`;

  fetch(overpassUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.elements.length > 0) {
        let locations = data.elements.slice(0, 5); // Show only top 5
        addLocationMarkers(locations, type);
      } else {
        alert(`No nearby ${type}s found!`);
      }
    })
    .catch((error) => console.error(`Error fetching ${type}s:`, error));
}


// Function to add markers and allow route on click
function addLocationMarkers(locations, type) {
  let iconUrl;

  if (type === "hospital") {
    iconUrl = "https://cdn-icons-png.flaticon.com/512/684/684908.png";
  } else if (type === "police") {
    iconUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991105.png";
  } else if (type === "shelter") {
    iconUrl = "https://cdn-icons-png.flaticon.com/512/190/190411.png"; // Shelter icon
  }

  let customIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  locations.forEach((place) => {
    let lat = place.lat;
    let lon = place.lon;
    let name = place.tags.name || `Unknown ${type}`;

    let marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    marker.bindPopup(
      `<b>${name}</b><br><button onclick="showRoute(${lat}, ${lon})">Show Route</button>`
    );

    marker.on("click", () => {
      showRoute(lat, lon);
    });
  });
}


// Function to show route to a clicked hospital/police station
function showRoute(destLat, destLon) {
  if (!latitude || !longitude) {
      alert("User location not available!");
      return;
  }

  // Remove old route if exists
  if (routeControl) {
      map.removeControl(routeControl);
  }

  // Add new route without the white box
  routeControl = L.Routing.control({
      waypoints: [
          L.latLng(latitude, longitude), // User's location
          L.latLng(destLat, destLon) // Selected hospital/police station
      ],
      routeWhileDragging: true,
      createMarker: () => null, // Hides default start & end markers
      routeLine: (route) => L.polyline(route.coordinates, { color: "red", weight: 5 }) // Custom route style
  }).addTo(map);

  // Remove the default route instructions panel
  document.querySelector(".leaflet-routing-container")?.remove();
}


window.addEventListener("load", () => {
  startVoiceRecognition();
});
