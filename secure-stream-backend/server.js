import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import streamRoutes from "./routes/stream.js";
import refreshRoutes from "./routes/refresh.js";
import cookieParser from "cookie-parser";
import movieRoutes from "./routes/movies.js"

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500", 
    credentials: true              
  })
);    
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Secure Stream Backend Running");
});


//Mounting route handlers
app.use("/api/auth",authRoutes);  //Signup,login,Me
app.use("/api/refresh",refreshRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/movies", movieRoutes);


// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
  }
};

await connectDB(); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});