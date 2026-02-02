const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userName = tg.initDataUnsafe?.user?.first_name || "Driver";
document.getElementById("user-name").innerText = userName;

const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";
const STATION = { lat: 9.059406, lng: 38.737413, name: "Addisu Gebeya Station" };
let userLocation = null;
let routingControl = null;

// Initialize Map
const map = L.map("map", { 
    zoomControl: false,
    tap: true // Ensures better mobile response
}).setView([STATION.lat, STATION.lng], 16);

// HIGH-DETAIL "OSM BRIGHT" STYLE
L.tileLayer(`https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png?api_key=${STADIA_KEY}`, {
    maxZoom: 20,
    minZoom: 13,
    attribution: '© Stadia Maps',
    // These two lines force higher detail/smaller labels
    zoomOffset: -1,
    tileSize: 512
}).addTo(map);

// --- 🚕 STATION MARKER ---
const stationIcon = L.divIcon({
    html: '<div style="background:#000; color:#FFD700; border:3px solid #FFD700; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);">🚕</div>',
    className: 'taxi-hub', iconSize: [40, 40], iconAnchor: [20, 20]
});

const infoContent = `
    <div style="text-align:center;">
        <strong style="color:#FFD700; font-size:16px;">${STATION.name}</strong>
        <ul class="dest-list">
            <li><span>📍 Piassa</span> <span class="dest-tag">ACTIVE</span></li>
            <li><span>📍 Gojam Berenda</span> <span class="dest-tag">ACTIVE</span></li>
            <li><span>📍 Mexico</span> <span class="dest-tag">ACTIVE</span></li>
            <li><span>📍 Shiro Meda</span> <span class="dest-tag">ACTIVE</span></li>
        </ul>
        <p style="font-size:10px; margin-top:8px; color:#888;">Tap "GO" for shortest route</p>
    </div>
`;

L.marker([STATION.lat, STATION.lng], { icon: stationIcon })
    .addTo(map)
    .bindPopup(infoContent, { className: 'dest-popup', minWidth: 200 });

function getLocation() {
    const status = document.getElementById("status");
    status.innerText = "🛰️ PINPOINTING...";
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocation = [pos.coords.latitude, pos.coords.longitude];
            L.marker(userLocation, { 
                icon: L.divIcon({ html: '<div style="font-size:30px;">👤</div>', iconSize:[30,30], iconAnchor:[15,15] }) 
            }).addTo(map);
            map.flyTo(userLocation, 17); // Zoomed in more for better street detail
            status.innerText = "📍 LOCATION SET. PRESS GO!";
            document.getElementById("go-btn").disabled = false;
        },
        () => { status.innerText = "❌ GPS DENIED"; },
        { enableHighAccuracy: true }
    );
}

function calculateRoute() {
    if (!userLocation) return;
    const status = document.getElementById("status");
    status.innerText = "📐 MAPPING BEST PATH...";

    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [L.latLng(userLocation[0], userLocation[1]), L.latLng(STATION.lat, STATION.lng)],
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        lineOptions: { styles: [{ color: '#000', weight: 8, opacity: 0.4 }, { color: '#FFD700', weight: 4 }] },
        addWaypoints: false, 
        show: false,
        createMarker: function() { return null; }
    }).on("routesfound", (e) => {
        const dist = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
        status.innerHTML = `🏆 STATION IS <b>${dist} KM</b> AWAY`;
    }).addTo(map);

    map.fitBounds([userLocation, [STATION.lat, STATION.lng]], { padding: [80, 80] });
}
