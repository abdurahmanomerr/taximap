const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// 1. Get User Data
const userName = tg.initDataUnsafe?.user?.first_name || "Driver";
document.getElementById("user-name").innerText = userName;

// 2. Your API Key & Station Coordinates
const GEBETA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IkFiZHVyYWhtYW4iLCJkZXNjcmlwdGlvbiI6IjU2ZDk3OTVkLWQwZmUtNGJkMy05ZTNlLWVhOGFiYWQ4MDQ1YiIsImlkIjoiZmRhZDAwYzUtYzFmYi00YzBiLTlhMTQtODE0MDJlNGU0ZDEyIiwiaXNzdWVkX2F0IjoxNzcwMDIxOTgxLCJpc3N1ZXIiOiJodHRwczovL21hcGFwaS5nZWJldGEuYXBwIiwiand0X2lkIjoiMCIsInNjb3BlcyI6WyJESVJFQ1RJT04iLCJHRU9DT0RJTkciLCJUSUxFIiwiTUFUUklYIiwiT05NIiwiVFNTIl0sInVzZXJuYW1lIjoiQWJkdXJhaG1hbjEyMzQifQ.y15xB1cnJfbgij8RK6JxFDNd5zWyXTn5phsLmca6Z5U";
const STATION = { lat: 9.059406, lng: 38.737413, name: "Addisu Gebeya Station" };

let userLocation = null;
let currentRouteLine = null;

// 3. Initialize Map (Using Gebeta Tiles)
const map = L.map("map", { zoomControl: false }).setView([STATION.lat, STATION.lng], 15);

L.tileLayer(`https://mapapi.gebeta.app/api/v1/route/tile/{z}/{x}/{y}.png?apiKey=${GEBETA_KEY}`, {
    attribution: '© Gebeta Maps'
}).addTo(map);

// 4. Taxi Station Marker with Info Popup
const stationIcon = L.divIcon({
    html: '<div style="background:#000; color:#FFD700; border:2px solid #FFD700; border-radius:50%; width:35px; height:35px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🚕</div>',
    className: 'station', iconSize: [40, 40], iconAnchor: [20, 20]
});

const infoHtml = `
    <div style="min-width:180px; font-family: sans-serif;">
        <strong style="color:#333; font-size:16px;">${STATION.name}</strong>
        <hr style="border:0; border-top:1px solid #eee;">
        <ul style="list-style:none; padding:0; margin:0;">
            <li style="padding:4px 0;">📍 Piassa <span style="float:right; color:green;">●</span></li>
            <li style="padding:4px 0;">📍 Mexico <span style="float:right; color:green;">●</span></li>
            <li style="padding:4px 0;">📍 Shiro Meda <span style="float:right; color:green;">●</span></li>
        </ul>
    </div>
`;
L.marker([STATION.lat, STATION.lng], { icon: stationIcon }).addTo(map).bindPopup(infoHtml);

// 5. Functions
function getLocation() {
    const status = document.getElementById("status");
    status.innerText = "🛰️ LOCATING...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            L.marker([userLocation.lat, userLocation.lng], { 
                icon: L.divIcon({ html: '<div style="font-size:24px;">🚶‍♂️</div>', iconSize:[30,30] }) 
            }).addTo(map);
            map.flyTo([userLocation.lat, userLocation.lng], 16);
            status.innerText = "📍 READY! TAP GO";
            document.getElementById("go-btn").disabled = false;
        },
        () => { status.innerText = "❌ GPS DENIED"; },
        { enableHighAccuracy: true }
    );
}

async function getGebetaRoute() {
    if (!userLocation) return;
    const status = document.getElementById("status");
    status.innerText = "📐 ANALYZING ROUTE...";

    // Gebeta URL Construction
    const url = `https://mapapi.gebeta.app/api/v1/route/direction/?origin=${userLocation.lat},${userLocation.lng}&destination=${STATION.lat},${STATION.lng}&apiKey=${GEBETA_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.direction && data.direction.length > 0) {
            // IMPORTANT: Gebeta returns [Lon, Lat], Leaflet needs [Lat, Lon]
            const path = data.direction.map(point => [point[1], point[0]]);
            
            if (currentRouteLine) map.removeLayer(currentRouteLine);
            
            currentRouteLine = L.polyline(path, { color: '#FFD700', weight: 6, opacity: 0.9 }).addTo(map);
            map.fitBounds(currentRouteLine.getBounds(), { padding: [50, 50] });

            const km = (data.totalDistance / 1000).toFixed(2);
            status.innerHTML = `🏆 <b>${km} KM</b> to Station`;
        } else {
            status.innerText = "❌ ROUTE NOT FOUND";
        }
    } catch (e) {
        status.innerText = "❌ CONNECTION FAILED";
        console.error(e);
    }
}
