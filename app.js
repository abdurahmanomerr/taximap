const tg = window.Telegram.WebApp;
tg.ready();

// Fixed station location
const STATION = {
  name: "Taxi Station",
  lat: 9.059406,
  lng: 38.737413
};

// Init map
const map = L.map("map").setView([STATION.lat, STATION.lng], 14);

// Map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Station marker
L.marker([STATION.lat, STATION.lng])
  .addTo(map)
  .bindPopup(<b>${STATION.name}</b>)
  .openPopup();

let routingControl;

// Get user location (USER-INITIATED ✅)
function getLocation() {
  document.getElementById("info").innerText = "Locating you…";

  navigator.geolocation.getCurrentPosition(
    position => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // User marker
      L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Remove old route if exists
      if (routingControl) {
        map.removeControl(routingControl);
      }

      // Route
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(STATION.lat, STATION.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: false
      })
      .on("routesfound", e => {
        const distanceKm =
          (e.routes[0].summary.totalDistance / 1000).toFixed(2);

        document.getElementById("info").innerText =
          Distance to station: ${distanceKm} km;
      })
      .addTo(map);

      map.fitBounds([
        [userLat, userLng],
        [STATION.lat, STATION.lng]
      ]);
    },
    error => {
      document.getElementById("info").innerText =
        "❌ Location permission denied";
    },
    { enableHighAccuracy: true }
  );
}
