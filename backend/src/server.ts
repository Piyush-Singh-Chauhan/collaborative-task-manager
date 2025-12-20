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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow requests from localhost on any port
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      
      // For production, you might want to add your production domain here
      // Example: if (origin === 'https://yourdomain.com') return callback(null, true);
      
      // Block requests from unknown origins
      return callback(new Error('Not allowed by CORS'));
    },
    credentials : true
  }
})

connectDB();
setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});