const express = require("express");
const app = express();
const path = require("path");

const http = require("http");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

io.on("connection", function (socket){
  socket.on("send-location", function (data){
    io.emit("receive-location", { id:socket.id, ...data});
  });
  
socket.on("disconnect", function (){
  io.emit("user-disconnected", socket.id);
});
});

app.get("/", function(req, res){
  res.sendFile(path.join(frontendPath, "index.html"));
});

server.listen(3000);