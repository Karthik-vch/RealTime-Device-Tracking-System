
const BACKEND_URL =
    "https://realtime-device-tracking-system-bf6j.onrender.com";

const socket = io(BACKEND_URL);

// Connection monitoring
socket.on("connect", () => {
    console.log("Connected to backend:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
});

// Initialize map
const map = L.map("map").setView([20, 0], 2);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
}).addTo(map);

// Device markers
const markers = {};

let firstLocationReceived = false;

// Get live location
if (navigator.geolocation) {

    navigator.geolocation.watchPosition(
        (position) => {

            const { latitude, longitude } = position.coords;

            console.log("Current location:", latitude, longitude);

            socket.emit("send-location", {
                latitude,
                longitude
            });

        },

        (error) => {
            console.error("Geolocation error:", error.message);
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );

} else {
    console.error("Geolocation is not supported.");
}

// Receive location updates
socket.on("receive-location", (data) => {

    const { id, latitude, longitude } = data;

    const coordinates = [latitude, longitude];

    if (!markers[id]) {

        markers[id] = L.marker(coordinates).addTo(map);

    } else {

        markers[id].setLatLng(coordinates);

    }

    // Center map on the first received location
    if (!firstLocationReceived) {

        map.setView(coordinates, 16);

        firstLocationReceived = true;

    }

});

// Remove disconnected devices
socket.on("user-disconnected", (id) => {

    if (markers[id]) {

        map.removeLayer(markers[id]);

        delete markers[id];

    }

});
