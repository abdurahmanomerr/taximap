const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const userName = tg.initDataUnsafe?.user?.first_name || "Driver";
document.getElementById("user-name").innerText = userName;

const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";

const STATIONS = [
    { id: 1, name: "Addisu Gebeya", lat: 9.059406, lng: 38.737413, info: "Piassa, Mexico, Shiro Meda" },
    { id: 2, name: "Piassa to Bole", lat: 9.034082, lng: 38.749485, info: "Bole, Gemo, Kara" },
    { id: 3, name: "Sululta Station", lat: 9.181063, lng: 38.758629, info: "Sululta to Addis" }
];

let selectedStation = STATIONS[0]; 
let userLocation = null;
let routingControl = null;

const map = L.map("map", { 
    zoomControl: false, 
    tap: false,        
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true
}).setView([9.05, 38.74], 13);

L.tileLayer(`https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png?api_key=${STADIA_KEY}`, {
    maxZoom: 20,
    attribution: '© Stadia Maps'
}).addTo(map);

STATIONS.forEach(st => {
    const icon = L.divIcon({
        html: `<div class="taxi-icon">🚕</div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
    });

    const marker = L.marker([st.lat, st.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`
        <div style="text-align:center;">
            <strong>${st.name}</strong><br>
            <span style="font-size:12px;">${st.info}</span><br>
            <button onclick="selectStation(${st.id})" style="margin-top:10px; padding:8px; background:#FFD700; border:none; border-radius:8px; font-weight:bold; width:100%;">SELECT HUB</button>
        </div>
    `);
});

function selectStation(id) {
    selectedStation = STATIONS.find(s => s.id === id);
    document.getElementById("status").innerHTML = `HUB: <b>${selectedStation.name}</b>`;
    map.closePopup();
}

function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
        userLocation = [pos.coords.latitude, pos.coords.longitude];
        L.marker(userLocation, { icon: L.divIcon({ html: '👤', iconSize:[30,30] }) }).addTo(map);
        map.flyTo(userLocation, 15);
        document.getElementById("go-btn").disabled = false;
        document.getElementById("status").innerText = "📍 LOCATION FOUND!";
    });
}

function calculateRoute() {
    if (!userLocation) return;
    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLocation[0], userLocation[1]), 
            L.latLng(selectedStation.lat, selectedStation.lng)
        ],
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
        lineOptions: { 
            styles: [{ color: '#000', weight: 8, opacity: 0.3 }, { color: '#FFD700', weight: 4 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
        },
        addWaypoints: false, 
        show: false,
        // CLEAN UI FIX: This removes the extra "start/end" markers created by the router
        createMarker: function() { return null; } 
    }).on("routesfound", (e) => {
        const dist = (e.routes[0].summary.totalDistance / 1000).toFixed(2);
        document.getElementById("status").innerHTML = `🏁 <b>${dist} KM</b> to ${selectedStation.name}`;
    }).addTo(map);

    map.fitBounds([userLocation, [selectedStation.lat, selectedStation.lng]], { padding: [80, 80] });
}
