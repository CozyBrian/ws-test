import http from "http";
import express from "express";
import { getSocketIO } from "./lib/socketIO";

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
  const io = getSocketIO(server);
  io.on("connection", (socket) => {
    console.log("New client connected");


    socket.on("ball-move", (data) => {
      console.log("ball-move", data);
      
      io.emit("ball-move", data);
    })
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

startServer();
