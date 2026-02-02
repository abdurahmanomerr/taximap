const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// YOUR STADIA API KEY
const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";

// Taxi Station Location
const STATION = {
  name: "Taxi Station",
  lat: 9.059406,
  lng: 38.737413
};

// Initialize Map
const map = L.map("map").setView([STATION.lat, STATION.lng], 15);

// Add Stadia Alidade Satellite (Hybrid: Satellite + Labels)
// We use {r} for retina support and add your api_key at the end
L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`, {
  maxZoom: 20,
  attribution: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors'
}).addTo(map);

// Custom Yellow Taxi Marker
const taxiIcon = L.divIcon({
  html: '<div style="font-size: 30px; text-shadow: 0 0 10px #ffd700;">🚕</div>',
  className: 'custom-taxi',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

L.marker([STATION.lat, STATION.lng], { icon: taxiIcon })
  .addTo(map)
  .bindPopup(`<b>${STATION.name}</b>`)
  .openPopup();

let routingControl;

function getLocation() {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = "🛰️ LOCATING...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // User Marker
      const userIcon = L.divIcon({
        html: '<div style="font-size: 30px;">🚶‍♂️</div>',
        className: 'user-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

      if (routingControl) map.removeControl(routingControl);

      // Routing with Yellow Line to match theme
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(STATION.lat, STATION.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        lineOptions: {
          styles: [{ color: '#ffd700', weight: 7, opacity: 0.9 }] // Yellow route line
        },
        addWaypoints: false,
        show: false
      })
      .on("routesfound", (e) => {
        const dist = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
        statusDiv.innerHTML = `DISTANCE: ${dist} KM`;
      })
      .addTo(map);

      map.fitBounds([[userLat, userLng], [STATION.lat, STATION.lng]], { padding: [70, 70] });
    },
    (err) => {
      statusDiv.innerText = "❌ GPS ERROR";
      console.error(err);
    },
    { enableHighAccuracy: true }
  );
}
