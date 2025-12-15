import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes"

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

// app.get("/", (req, res) =>{
//     res.send("Backend is runnig..");
// })


export default app;