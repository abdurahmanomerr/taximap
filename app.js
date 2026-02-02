const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Good practice to expand the app for maps

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
  .bindPopup(`<b>${STATION.name}</b>`)
  .openPopup();

let routingControl;

function getLocation() {
  const infoBox = document.getElementById("info");
  infoBox.innerHTML = "<span>Searching... 🛰️</span>";

  // Use the browser Geolocation API
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Add user marker
      L.marker([userLat, userLng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Clear existing route
      if (routingControl) {
        map.removeControl(routingControl);
      }

      // Create new route using secure HTTPS server
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(STATION.lat, STATION.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1' // Force HTTPS
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        show: false
      })
      .on("routesfound", (e) => {
        const distanceKm = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
        infoBox.innerHTML = `<b>Distance:</b> ${distanceKm} km`;
      })
      .on("routingerror", () => {
        infoBox.innerHTML = "❌ Route calculation failed";
      })
      .addTo(map);

      // Zoom map to show both points
      map.fitBounds([
        [userLat, userLng],
        [STATION.lat, STATION.lng]
      ], { padding: [50, 50] });
    },
    (error) => {
      // Handle location errors
      console.error(error);
      if (error.code === 1) {
        infoBox.innerHTML = "❌ Please allow location access";
      } else {
        infoBox.innerHTML = "❌ Location unavailable";
      }
    },
    { 
        enableHighAccuracy: true,
        timeout: 10000 
    }
  );
}
