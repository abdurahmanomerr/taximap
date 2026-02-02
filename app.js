const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const MAPTILER_KEY = "PolsSfZNg49T4lwOFXtb";

// Station Location
const STATION = {
  name: "Taxi Station",
  lat: 9.059406,
  lng: 38.737413
};

// 1. Initialize Map
const map = L.map("map").setView([STATION.lat, STATION.lng], 15);

// 2. Add MapTiler Hybrid (Satellite + Labels)
const mtLayer = new L.maptiler.MaptilerLayer({
  apiKey: MAPTILER_KEY,
  style: "hybrid", // This gives you Satellite + Streets
}).addTo(map);

// 3. Custom Taxi Icon
const taxiIcon = L.divIcon({
  html: '<div style="font-size: 30px; filter: drop-shadow(0 2px 2px black);">🚕</div>',
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Add Station Marker
L.marker([STATION.lat, STATION.lng], { icon: taxiIcon })
  .addTo(map)
  .bindPopup(`<b>${STATION.name}</b>`)
  .openPopup();

let routingControl;

function getLocation() {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = "🛰️ Connecting to GPS...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Add User Marker (Person emoji)
      const userIcon = L.divIcon({
        html: '<div style="font-size: 30px;">🚶‍♂️</div>',
        className: 'user-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

      // Remove old route
      if (routingControl) map.removeControl(routingControl);

      // Draw Route
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(STATION.lat, STATION.lng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        lineOptions: {
          styles: [{ color: '#0088cc', weight: 6, opacity: 0.8 }]
        },
        addWaypoints: false,
        show: false
      })
      .on("routesfound", (e) => {
        const dist = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
        statusDiv.innerHTML = `🏁 Distance: ${dist} km`;
      })
      .addTo(map);

      // Fit map to see both points
      map.fitBounds([[userLat, userLng], [STATION.lat, STATION.lng]], { padding: [80, 80] });
    },
    (err) => {
      statusDiv.innerText = "❌ Please enable Location/GPS";
      console.error(err);
    },
    { enableHighAccuracy: true }
  );
}
