const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";
const STATION = { lat: 9.059406, lng: 38.737413, name: "Yellow Cab Station" };
let userLocation = null;
let routingControl = null;

// 1. Setup Map with Normal (Smooth) Tiles
const map = L.map("map", { zoomControl: false }).setView([STATION.lat, STATION.lng], 15);

L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`, {
  attribution: '© Stadia Maps, © OpenStreetMap'
}).addTo(map);

// 2. Custom Station Marker (New Design)
const stationIcon = L.divIcon({
  html: '<div style="background:#000; color:#ffd700; padding:5px; border-radius:50%; border:2px solid #ffd700; font-size:20px; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">🚕</div>',
  className: 'station-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

L.marker([STATION.lat, STATION.lng], { icon: stationIcon })
  .addTo(map)
  .bindPopup(`<b>${STATION.name}</b>`);

// 3. Find User
function getLocation() {
  const status = document.getElementById("status");
  status.innerText = "📡 SEARCHING FOR GPS...";
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = [pos.coords.latitude, pos.coords.longitude];
      
      // Add or move user marker
      L.marker(userLocation, {
        icon: L.divIcon({ html: '👤', className: 'u-icon', iconSize: [30,30] })
      }).addTo(map);

      map.flyTo(userLocation, 16);
      status.innerText = "📍 LOCATION FOUND! TAP GO";
      document.getElementById("go-btn").disabled = false; // Enable GO button
    },
    () => { status.innerText = "❌ GPS DENIED"; },
    { enableHighAccuracy: true }
  );
}

// 4. Calculate Distance & Route (The GO Feature)
function calculateRoute() {
  if (!userLocation) return;
  
  const status = document.getElementById("status");
  status.innerText = "🏁 CALCULATING ROUTE...";

  if (routingControl) map.removeControl(routingControl);

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(STATION.lat, STATION.lng)
    ],
    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
    lineOptions: { styles: [{ color: '#000', weight: 4, opacity: 0.7 }, { color: '#ffd700', weight: 2 }] },
    addWaypoints: false,
    show: false
  })
  .on("routesfound", (e) => {
    const route = e.routes[0];
    const dist = (route.summary.totalDistance / 1000).toFixed(2);
    const time = Math.round(route.summary.totalTime / 60);
    status.innerHTML = `📏 ${dist} km | 🕒 ${time} min`;
  })
  .addTo(map);

  map.fitBounds([userLocation, [STATION.lat, STATION.lng]], { padding: [100, 100] });
}
