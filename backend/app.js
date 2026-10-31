
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Backend health check
app.get("/", (req, res) => {
    res.json({
        message: "LiveTracking API is running",
        status: "success"
    });
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("Device connected:", socket.id);

    socket.on("send-location", (data) => {
        io.emit("receive-location", {
            id: socket.id,
            ...data
        });
    });

    socket.on("disconnect", () => {
        console.log("Device disconnected:", socket.id);

        io.emit("user-disconnected", socket.id);
    });
});

// Render port configuration
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
