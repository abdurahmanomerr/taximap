const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userName = tg.initDataUnsafe?.user?.first_name || "User";
document.getElementById("user-name").innerText = userName;

const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";
const STATION = { lat: 9.059406, lng: 38.737413, name: "Addisu Gebeya Station" };
let userLocation = null;
let routingControl = null;

const map = L.map("map", { zoomControl: false }).setView([STATION.lat, STATION.lng], 15);

L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`, {
  attribution: '© Stadia Maps'
}).addTo(map);

// --- 🚕 STATION MARKER WITH CLICK FEATURE ---
const stationIcon = L.divIcon({
  html: '<div style="background:#000; color:#FFD700; border:3px solid #FFD700; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow: 0 0 15px #FFD700;">🚕</div>',
  className: 'taxi-hub', iconSize: [40, 40], iconAnchor: [20, 20]
});

// Destination Information
const infoContent = `
  <div style="text-align:center;">
    <strong style="color:#FFD700; font-size:16px;">${STATION.name}</strong>
    <ul class="dest-list">
      <li><span>📍 Piassa</span> <span class="dest-tag">ACTIVE</span></li>
      <li><span>📍 Gojam Berenda</span> <span class="dest-tag">ACTIVE</span></li>
      <li><span>📍 Mexico</span> <span class="dest-tag">ACTIVE</span></li>
      <li><span>📍 Shiro Meda</span> <span class="dest-tag">ACTIVE</span></li>
    </ul>
    <p style="font-size:10px; margin-top:8px; color:#888;">Tap "GO" to start navigation</p>
  </div>
`;

L.marker([STATION.lat, STATION.lng], { icon: stationIcon })
  .addTo(map)
  .bindPopup(infoContent, { className: 'dest-popup', minWidth: 200 });

function getLocation() {
  const status = document.getElementById("status");
  status.innerText = "🛰️ SEARCHING...";
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = [pos.coords.latitude, pos.coords.longitude];
      L.marker(userLocation, { icon: L.divIcon({ html: '👤', iconSize:[30,30] }) }).addTo(map);
      map.flyTo(userLocation, 16);
      status.innerText = "📍 READY! PRESS GO";
      document.getElementById("go-btn").disabled = false;
    },
    () => { status.innerText = "❌ GPS DENIED"; },
    { enableHighAccuracy: true }
  );
}

function calculateRoute() {
  if (!userLocation) return;
  const status = document.getElementById("status");
  status.innerText = "📐 CALCULATING DISTANCE...";

  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [L.latLng(userLocation[0], userLocation[1]), L.latLng(STATION.lat, STATION.lng)],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: '#000', weight: 8, opacity: 0.5 }, { color: '#FFD700', weight: 4 }] },
    addWaypoints: false, 
    show: false, // REMOVES THE SIDEBAR TIMER/INSTRUCTIONS
    createMarker: function() { return null; } // Cleaner map
  }).on("routesfound", (e) => {
    const dist = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
    status.innerHTML = `🏁 DISTANCE: <b>${dist} KM</b> to Station`;
  }).addTo(map);

  map.fitBounds([userLocation, [STATION.lat, STATION.lng]], { padding: [80, 80] });
}
