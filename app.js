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
}const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Initialize user data
const user = tg.initDataUnsafe?.user || {};
const userName = user.first_name || "Driver";
const userId = user.id || Math.floor(Math.random() * 1000);
const userInitial = userName.charAt(0).toUpperCase();

document.getElementById("user-name").innerText = userName;
document.getElementById("user-avatar").innerText = userInitial;
document.getElementById("user-avatar").style.backgroundColor = getRandomColor(userId);

// Stadia Maps API key
const STADIA_KEY = "a00feb43-6438-468d-91f2-76b7e45cf245";

// Taxi stations in Addis Ababa
const STATIONS = [
    { 
        id: 1, 
        name: "Addisu Gebeya", 
        lat: 9.059406, 
        lng: 38.737413, 
        info: "Piassa, Mexico, Shiro Meda",
        busyLevel: 2 // 1-3 scale
    },
    { 
        id: 2, 
        name: "Piassa to Bole", 
        lat: 9.034082, 
        lng: 38.749485, 
        info: "Bole, Gemo, Kara",
        busyLevel: 3
    },
    { 
        id: 3, 
        name: "Sululta Station", 
        lat: 9.181063, 
        lng: 38.758629, 
        info: "Sululta to Addis",
        busyLevel: 1
    },
    {
        id: 4,
        name: "Megenagna Hub",
        lat: 9.0215,
        lng: 38.7901,
        info: "Bole, Megenagna, Saris",
        busyLevel: 2
    },
    {
        id: 5,
        name: "Kera Taxi Station",
        lat: 9.0023,
        lng: 38.8304,
        info: "Kera, Bole Michael",
        busyLevel: 1
    }
];

let selectedStation = STATIONS[0];
let userLocation = null;
let routingControl = null;
let userMarker = null;
let routeInstructions = [];
let isRouteActive = false;

// Initialize map
const map = L.map("map", { 
    zoomControl: true, 
    tap: false,        
    dragging: true,
    touchZoom: true,
    scrollWheelZoom: true,
    zoomSnap: 0.5
}).setView([9.05, 38.74], 13);

// Add tile layer
L.tileLayer(`https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}@2x.png?api_key=${STADIA_KEY}`, {
    maxZoom: 20,
    attribution: '© Stadia Maps | © OpenStreetMap'
}).addTo(map);

// Add custom zoom control position
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Initialize station selector
function initializeStations() {
    const stationList = document.getElementById("station-list");
    stationList.innerHTML = "";
    
    STATIONS.forEach(station => {
        const item = document.createElement("div");
        item.className = `station-item ${selectedStation.id === station.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="station-name">
                ${station.name} 
                <span style="float: right; font-size: 12px;">
                    ${'★'.repeat(station.busyLevel)}${'☆'.repeat(3 - station.busyLevel)}
                </span>
            </div>
            <div class="station-info">${station.info}</div>
        `;
        item.onclick = () => selectStation(station.id);
        stationList.appendChild(item);
    });
}

// Create custom taxi icons
function createTaxiIcon(busyLevel) {
    const colors = ['#28a745', '#FFD700', '#dc3545']; // Green, Yellow, Red
    return L.divIcon({
        html: `
            <div style="
                background: ${colors[busyLevel - 1]}; 
                color: white;
                border: 2px solid white;
                border-radius: 50%; 
                width: 40px; 
                height: 40px;
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-size: 18px; 
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
            ">
                🚕
            </div>
        `,
        className: 'taxi-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// Add station markers to map
STATIONS.forEach(station => {
    const icon = createTaxiIcon(station.busyLevel);
    const marker = L.marker([station.lat, station.lng], { icon: icon }).addTo(map);
    
    marker.bindPopup(`
        <div style="text-align:center; min-width: 200px;">
            <strong style="font-size: 16px;">${station.name}</strong><br>
            <div style="color: #666; font-size: 13px; margin: 5px 0;">${station.info}</div>
            <div style="margin: 8px 0;">
                <span style="font-size: 12px; background: #f0f0f0; padding: 2px 8px; border-radius: 10px;">
                    Busy Level: ${'●'.repeat(station.busyLevel)}${'○'.repeat(3 - station.busyLevel)}
                </span>
            </div>
            <button onclick="selectStation(${station.id})" 
                style="margin-top:10px; padding:10px; background:#FFD700; border:none; border-radius:8px; 
                font-weight:bold; width:100%; cursor:pointer;">
                SELECT THIS HUB
            </button>
        </div>
    `);
});

// Function to select station
function selectStation(id) {
    selectedStation = STATIONS.find(s => s.id === id);
    document.getElementById("current-hub").innerHTML = `<b>${selectedStation.name}</b>`;
    document.getElementById("status").style.background = "rgba(255, 215, 0, 0.1)";
    
    // Update station list UI
    initializeStations();
    toggleStations();
    
    // If user location is set, calculate straight-line distance
    if (userLocation) {
        const distance = calculateStraightDistance(userLocation, [selectedStation.lat, selectedStation.lng]);
        document.getElementById("distance-info").innerText = `Straight distance: ${distance} km`;
        document.getElementById("go-btn").disabled = false;
    }
    
    // Center map on selected station
    map.flyTo([selectedStation.lat, selectedStation.lng], 14);
}

// Get user location
function getLocation() {
    document.getElementById("status").innerHTML = '<div class="route-info">Detecting your location...</div>';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = [pos.coords.latitude, pos.coords.longitude];
                
                // Remove existing user marker
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                // Add new user marker
                userMarker = L.marker(userLocation, {
                    icon: L.divIcon({
                        html: '<div class="user-marker">📍</div>',
                        className: 'user-marker-icon',
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    })
                }).addTo(map);
                
                // Update UI
                document.getElementById("go-btn").disabled = false;
                document.getElementById("status").innerHTML = `
                    <div class="route-info">
                        <div><b>Location found!</b></div>
                        <div style="font-size: 12px; color: #666; font-weight: normal;">
                            Select a hub to calculate route
                        </div>
                    </div>
                `;
                
                // Calculate nearest station
                const nearestStation = findNearestStation(userLocation);
                if (nearestStation && calculateStraightDistance(userLocation, [nearestStation.lat, nearestStation.lng]) < 5) {
                    selectStation(nearestStation.id);
                    showNotification(`Auto-selected nearest hub: ${nearestStation.name}`);
                }
                
                // Center map on user location
                map.flyTo(userLocation, 15);
            },
            (error) => {
                console.error("Geolocation error:", error);
                document.getElementById("status").innerHTML = '<div class="route-info" style="color: #dc3545;">Location access denied. Please enable GPS.</div>';
                
                // Fallback to manual location selection
                userLocation = [9.05, 38.74]; // Default to Addis center
                showNotification("Using default location. Please select your location manually.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

// Calculate straight-line distance (Haversine formula)
function calculateStraightDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(2);
}

// Find nearest station
function findNearestStation(userCoord) {
    let nearest = null;
    let minDistance = Infinity;
    
    STATIONS.forEach(station => {
        const distance = calculateStraightDistance(userCoord, [station.lat, station.lng]);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = station;
        }
    });
    
    return nearest;
}

// Calculate optimal route using OSRM
async function calculateRoute() {
    if (!userLocation || !selectedStation) return;
    
    // Show loader
    document.getElementById("loader").style.display = 'block';
    document.getElementById("go-btn").disabled = true;
    
    try {
        // Clear existing route
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        
        const userLatLng = L.latLng(userLocation[0], userLocation[1]);
        const stationLatLng = L.latLng(selectedStation.lat, selectedStation.lng);
        
        // Calculate route using OSRM
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/` +
            `${userLocation[1]},${userLocation[0]};` +
            `${selectedStation.lng},${selectedStation.lat}?` +
            `overview=full&geometries=geojson&steps=true`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = (route.distance / 1000).toFixed(2);
            const durationMin = Math.round(route.duration / 60);
            
            // Update UI with route info
            document.getElementById("distance-badge").style.display = 'block';
            document.getElementById("distance-badge").innerText = `${distanceKm} km`;
            
            document.getElementById("current-hub").innerHTML = `
                To: <b>${selectedStation.name}</b>
            `;
            
            document.getElementById("distance-info").innerHTML = `
                ${distanceKm} km • ${durationMin} min
            `;
            
            // Extract instructions
            routeInstructions = [];
            if (route.legs && route.legs[0].steps) {
                route.legs[0].steps.forEach((step, index) => {
                    if (step.maneuver.instruction && step.distance > 50) { // Filter short steps
                        routeInstructions.push({
                            instruction: step.maneuver.instruction.replace(/<[^>]*>/g, ''),
                            distance: (step.distance / 1000).toFixed(1) + ' km'
                        });
                    }
                });
            }
            
            // Draw route on map
            const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const routeLine = L.polyline(routeCoordinates, {
                color: '#FFD700',
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round',
                dashArray: '10, 10'
            }).addTo(map);
            
            // Add start and end markers
            L.marker(userLatLng, {
                icon: L.divIcon({
                    html: '<div style="background: #007bff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white;">A</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);
            
            L.marker(stationLatLng, {
                icon: L.divIcon({
                    html: `<div style="background: #28a745; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white;">B</div>`,
                    iconSize: [30, 30]
                })
            }).addTo(map);
            
            // Fit bounds to show entire route
            const bounds = routeLine.getBounds();
            map.fitBounds(bounds, { padding: [50, 50] });
            
            // Enable route controls
            document.getElementById("instructions-btn").disabled = false;
            document.getElementById("clear-btn").disabled = false;
            isRouteActive = true;
            
            // Send route info to Telegram
            tg.sendData(JSON.stringify({
                action: 'route_calculated',
                distance: distanceKm,
                duration: durationMin,
                station: selectedStation.name
            }));
            
            showNotification(`Route calculated: ${distanceKm} km, ${durationMin} min`);
        }
    } catch (error) {
        console.error("Routing error:", error);
        
        // Fallback to straight line if routing fails
        const distance = calculateStraightDistance(userLocation, [selectedStation.lat, selectedStation.lng]);
        document.getElementById("distance-badge").style.display = 'block';
        document.getElementById("distance-badge").innerText = `${distance} km (straight)`;
        
        showNotification("Using straight-line distance. Routing service unavailable.");
        
        // Draw straight line
        const routeLine = L.polyline([userLocation, [selectedStation.lat, selectedStation.lng]], {
            color: '#FFD700',
            weight: 3,
            opacity: 0.6,
            dashArray: '5, 10'
        }).addTo(map);
        
        map.fitBounds([userLocation, [selectedStation.lat, selectedStation.lng]], { padding: [80, 80] });
    } finally {
        // Hide loader
        document.getElementById("loader").style.display = 'none';
        document.getElementById("go-btn").disabled = false;
    }
}

// Toggle station selector
function toggleStations() {
    const selector = document.getElementById("station-selector");
    selector.style.display = selector.style.display === 'block' ? 'none' : 'block';
}

// Toggle instructions panel
function toggleInstructions() {
    const panel = document.getElementById("instructions-panel");
    const list = document.getElementById("instructions-list");
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        // Populate instructions
        list.innerHTML = '';
        if (routeInstructions.length > 0) {
            routeInstructions.forEach((inst, index) => {
                const item = document.createElement("div");
                item.className = "instruction-item";
                item.innerHTML = `
                    <div class="instruction-icon">${index + 1}.</div>
                    <div>
                        <div style="font-weight: bold;">${inst.instruction}</div>
                        <div style="font-size: 12px; color: #666;">${inst.distance}</div>
                    </div>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">No detailed instructions available</div>';
        }
        panel.style.display = 'block';
    }
}

// Clear current route
function clearRoute() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    // Clear all route layers
    map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || 
            (layer.options && layer.options.icon && 
             (layer.options.icon.options?.className === 'user-marker-icon'))) {
            if (!(layer instanceof L.TileLayer) && !(layer._icon?.classList?.contains('taxi-marker'))) {
                map.removeLayer(layer);
            }
        }
    });
    
    // Reset UI
    document.getElementById("distance-badge").style.display = 'none';
    document.getElementById("current-hub").innerHTML = `<b>${selectedStation.name}</b>`;
    document.getElementById("distance-info").innerHTML = "Select a hub and calculate route";
    document.getElementById("instructions-btn").disabled = true;
    document.getElementById("clear-btn").disabled = true;
    document.getElementById("instructions-panel").style.display = 'none';
    
    isRouteActive = false;
    routeInstructions = [];
    
    showNotification("Route cleared");
}

// Show notification
function showNotification(message) {
    tg.showAlert(message);
}

// Generate random color based on user ID
function getRandomColor(seed) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
        '#118AB2', '#EF476F', '#073B4C', '#7209B7'
    ];
    return colors[seed % colors.length];
}

// Initialize station list
initializeStations();

// Handle map click for manual location selection
map.on('click', (e) => {
    if (confirm("Set this as your location?")) {
        userLocation = [e.latlng.lat, e.latlng.lng];
        
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        
        userMarker = L.marker(userLocation, {
            icon: L.divIcon({
                html: '<div class="user-marker">📍</div>',
                className: 'user-marker-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        }).addTo(map);
        
        document.getElementById("go-btn").disabled = false;
        document.getElementById("status").innerHTML = `
            <div class="route-info">
                <div><b>Manual location set</b></div>
                <div style="font-size: 12px; color: #666; font-weight: normal;">
                    Select a hub to calculate route
                </div>
            </div>
        `;
        
        showNotification("Location set manually");
    }
});
