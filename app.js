const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set Greeting from Telegram User Data
const userName = tg.initDataUnsafe?.user?.first_name || "Driver";
document.getElementById("user-name").innerText = userName;

const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";
const STATION = { lat: 9.059406, lng: 38.737413, name: "Central Taxi Station" };
let userLocation = null;
let routingControl = null;

// Initialize Map (Fast-loading Normal Style)
const map = L.map("map", { zoomControl: false }).setView([STATION.lat, STATION.lng], 15);

L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`, {
  attribution: '© Stadia Maps'
}).addTo(map);

// Professional Taxi Station Marker
const stationIcon = L.divIcon({
  html: '<div style="background:#000; color:#ffd700; border:3px solid #ffd700; border-radius:50%; width:35px; height:35px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚕</div>',
  className: 'taxi-station', iconSize: [40, 40], iconAnchor: [20, 20]
});

L.marker([STATION.lat, STATION.lng], { icon: stationIcon }).addTo(map).bindPopup(STATION.name);

function getLocation() {
  const status = document.getElementById("status");
  status.innerText = "🛰️ PINPOINTING YOUR POSITION...";
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = [pos.coords.latitude, pos.coords.longitude];
      
      L.marker(userLocation, {
        icon: L.divIcon({ html: '<div style="font-size:30px;">🚶‍♂️</div>', iconSize:[30,30], iconAnchor:[15,15] })
      }).addTo(map);

      map.flyTo(userLocation, 16);
      status.innerText = "📍 LOCATION SET. PRESS GO!";
      document.getElementById("go-btn").disabled = false;
    },
    () => { status.innerText = "❌ GPS ACCESS DENIED"; },
    { enableHighAccuracy: true }
  );
}

function calculateRoute() {
  if (!userLocation) return;
  const status = document.getElementById("status");
  status.innerText = "⏳ ANALYZING BEST PATH...";

  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [L.latLng(userLocation[0], userLocation[1]), L.latLng(STATION.lat, STATION.lng)],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: '#000', weight: 6, opacity: 0.6 }, { color: '#FFD700', weight: 3 }] },
    addWaypoints: false, show: false
  }).on("routesfound", (e) => {
    const route = e.routes[0];
    const km = (route.summary.totalDistance / 1000).toFixed(2);
    const mins = Math.round(route.summary.totalTime / 60);
    status.innerHTML = `🏁 <b>${km} km</b> away • 🕒 <b>${mins} min</b> drive`;
  }).addTo(map);

  map.fitBounds([userLocation, [STATION.lat, STATION.lng]], { padding: [80, 80] });
}
