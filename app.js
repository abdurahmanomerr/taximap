const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userName = tg.initDataUnsafe?.user?.first_name || "Driver";
document.getElementById("user-name").innerText = userName;

// YOUR GEBETA API KEY
const GEBETA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IkFiZHVyYWhtYW4iLCJkZXNjcmlwdGlvbiI6IjU2ZDk3OTVkLWQwZmUtNGJkMy05ZTNlLWVhOGFiYWQ4MDQ1YiIsImlkIjoiZmRhZDAwYzUtYzFmYi00YzBiLTlhMTQtODE0MDJlNGU0ZDEyIiwiaXNzdWVkX2F0IjoxNzcwMDIxOTgxLCJpc3N1ZXIiOiJodHRwczovL21hcGFwaS5nZWJldGEuYXBwIiwiand0X2lkIjoiMCIsInNjb3BlcyI6WyJESVJFQ1RJT04iLCJHRU9DT0RJTkciLCJUSUxFIiwiTUFUUklYIiwiT05NIiwiVFNTIl0sInVzZXJuYW1lIjoiQWJkdXJhaG1hbjEyMzQifQ.y15xB1cnJfbgij8RK6JxFDNd5zWyXTn5phsLmca6Z5U";

const STATION = { lat: 9.059406, lng: 38.737413, name: "Addisu Gebeya Station" };
let userLocation = null;
let currentRouteLine = null;

// Initialize Map with Gebeta Tiles (Raster)
const map = L.map("map", { zoomControl: false }).setView([STATION.lat, STATION.lng], 15);

L.tileLayer(`https://mapapi.gebeta.app/api/v1/route/tile/{z}/{x}/{y}.png?apiKey=${GEBETA_KEY}`, {
  attribution: '© Gebeta Maps'
}).addTo(map);

// Station Marker & Popup
const stationIcon = L.divIcon({
  html: '<div style="background:#000; color:#FFD700; border:2px solid #FFD700; border-radius:50%; width:35px; height:35px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚕</div>',
  className: 'station', iconSize: [40, 40], iconAnchor: [20, 20]
});

const infoHtml = `
  <div style="min-width:180px;">
    <strong>${STATION.name}</strong>
    <ul class="dest-list">
      <li>Piassa <span class="dest-tag">Active</span></li>
      <li>Gojam Berenda <span class="dest-tag">Active</span></li>
      <li>Mexico <span class="dest-tag">Active</span></li>
      <li>Shiro Meda <span class="dest-tag">Active</span></li>
    </ul>
  </div>
`;
L.marker([STATION.lat, STATION.lng], { icon: stationIcon }).addTo(map).bindPopup(infoHtml);

function getLocation() {
  const status = document.getElementById("status");
  status.innerText = "🛰️ LOCATING...";
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      L.marker([userLocation.lat, userLocation.lng], { icon: L.divIcon({ html: '👤', iconSize: [30,30] }) }).addTo(map);
      map.flyTo([userLocation.lat, userLocation.lng], 16);
      status.innerText = "📍 READY! TAP GO";
      document.getElementById("go-btn").disabled = false;
    },
    () => { status.innerText = "❌ GPS ERROR"; },
    { enableHighAccuracy: true }
  );
}

// GET ROUTE FROM GEBETA API
async function getGebetaRoute() {
  if (!userLocation) return;
  const status = document.getElementById("status");
  status.innerText = "📐 CALCULATING GEBETA ROUTE...";

  const url = `https://mapapi.gebeta.app/api/v1/route/direction/?origin=${userLocation.lat},${userLocation.lng}&destination=${STATION.lat},${STATION.lng}&apiKey=${GEBETA_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.direction) {
      // Gebeta returns directions as [lon, lat] pairs
      const path = data.direction.map(coord => [coord[1], coord[0]]);
      
      if (currentRouteLine) map.removeLayer(currentRouteLine);
      
      currentRouteLine = L.polyline(path, { color: '#FFD700', weight: 6, opacity: 0.8 }).addTo(map);
      map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });

      const dist = (data.totalDistance / 1000).toFixed(2);
      status.innerHTML = `🏁 <b>${dist} KM</b> to Station`;
    }
  } catch (error) {
    status.innerText = "❌ ROUTE FAILED";
    console.error(error);
  }
}
