import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

//middlewawre
app.use(cors());
app.use(express.json());

//connect database
connectDB();

//routes
app.use('/auth', authRoutes);

app.get('/', (req,res) =>{
    res.send("Auth Microservice online....😉");
})

//server
const 