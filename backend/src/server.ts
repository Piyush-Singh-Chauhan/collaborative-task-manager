import app from "./app";
import dotenv from "dotenv"
import connectDB from "./config/db";
import {Server} from 'socket.io';
import http from 'http';
import { setupSocket } from "./socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors : {
    origin : "http://localhost:5173",
    credentials : true
  }
})

connectDB();
setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
