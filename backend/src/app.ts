import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes"
import { authMiddleware } from "./middlewares/auth.middleware";
import taskRoutes from "./modules/tasks/task.route"
import userRoutes from "./modules/users/user.routes"

const app = express();

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.get("/api/protected", authMiddleware, (req, res)=>{

    // console.log("REq user: " , (req as any).user);
    res.json({
        message:" You are authorized",
        userId : (req as any).user.id
    })
})

// app.get("/", (req, res) =>{
//     res.send("Backend is runnig..");
// })


export default app;