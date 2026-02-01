const tg = window.Telegram.WebApp;
tg.expand(); // Make Mini App full screen

// Center map near the station
const map = L.map('map').setView([9.060429, 38.729736], 14);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Add the station marker
const station = { name: "My Station", lat: 9.060429, lng: 38.729736 };
L.marker([station.lat, station.lng])
  .addTo(map)
  .bindPopup(station.name)
  .openPopup();

// Get user's location
map.locate({ setView: true, maxZoom: 16 });

map.on('locationfound', e => {
  const userLatLng = [e.latitude, e.longitude];

  // Marker for user
  L.marker(userLatLng).addTo(map)
    .bindPopup("You are here").openPopup();

  // Distance in meters
  const distance = map.distance(userLatLng, [station.lat, station.lng]);
  alert(`Distance to ${station.name}: ${distance.toFixed(0)} meters`);

  // Draw shortest route
  L.Routing.control({
    waypoints: [
      L.latLng(e.latitude, e.longitude),
      L.latLng(station.lat, station.lng)
    ],
    routeWhileDragging: false,
    show: false
  }).addTo(map);
});

map.on('locationerror', err => {
  alert("Cannot access your location. Please allow location access.");
});
