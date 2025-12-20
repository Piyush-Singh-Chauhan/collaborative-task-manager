import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes"
import { authMiddleware } from "./middlewares/auth.middleware";
import taskRoutes from "./modules/tasks/task.route"
import userRoutes from "./modules/users/user.routes"

const app = express();

// Configure CORS to allow requests from multiple localhost ports
app.use(cors({
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
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/api/protected", authMiddleware, (req, res)=>{
    res.json({
        message:" You are authorized",
        userId : (req as any).user.id
    })
})

export default app;