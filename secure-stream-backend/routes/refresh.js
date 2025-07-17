import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ msg: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    // Generate new tokens
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES_IN }
    );

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_EXPIRES_IN }
    );

    // Rotate refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Send cookies
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
       sameSite: "Lax",      //  Lax,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
       sameSite: "Lax",      //  Lax,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ msg: "Token refreshed" });

  } catch (error) {
    console.error("Refresh error:", error.message);
    return res.status(403).json({ msg: "Token invalid or expired" });
  }
});

export default router;
