import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import streamRoutes from "./routes/stream.js";
import refreshRoutes from "./routes/refresh.js";
import cookieParser from "cookie-parser";
import verifyToken from "./middlewares/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/videos", express.static("public")); // Serve HLS from public (for testing)

app.get("/", (req, res) => {
  res.send("Secure Stream Backend Running");
});


//Mounting route handlers
app.use("/api/auth",authRoutes);  //Signup,login,Me
app.use("/api/stream",streamRoutes);  //Signed video Urls
app.use("/api/refresh",refreshRoutes);

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