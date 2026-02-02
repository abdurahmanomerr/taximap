const tg = window.Telegram.WebApp;
tg.ready();

// Station location (FIXED)
const STATION = {
  name: "Station",
  lat: 9.059406,
  lng: 38.737413
};

// Init map (temporary center)
const map = L.map("map").setView([STATION.lat, STATION.lng], 13);

// Tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Station marker
L.marker([STATION.lat, STATION.lng])
  .addTo(map)
  .bindPopup(<b>${STATION.name}</b>);

// Get user location
navigator.geolocation.getCurrentPosition(
  position => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    // User marker
    L.marker([userLat, userLng])
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();

    // Routing
    L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(STATION.lat, STATION.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false
    })
    .on("routesfound", function (e) {
      const route = e.routes[0];
      const distanceKm = (route.summary.totalDistance / 1000).toFixed(2);
      document.getElementById("distance").innerText =
        Distance to station: ${distanceKm} km;
    })
    .addTo(map);

    map.fitBounds([
      [userLat, userLng],
      [STATION.lat, STATION.lng]
    ]);
  },
  error => {
    document.getElementById("distance").innerText =
      "Location access denied";
  },
  {
    enableHighAccuracy: true
  }
);
