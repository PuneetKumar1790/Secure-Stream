import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router=express.Router();

router.post("/",async (req,res)=>{
    const token=req.cookies.refreshToken;
    if(!token) return res.status(401).json({msg:"No refresh token"});
    
    try {
        const decoded=jwt.verify(token,process.env.JWT_REFRESH_SECRET);
        const user=await User.findById(decoded.id);
        
        if(!user||user.refreshToken !==token){
            return res.status(403).json({msg:"Invalid refresh token"});
        }

        //Rotate refresh token
        const newRefreshToken=jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_EXPIRES_IN});

        //Generate new acces token
        const newaccessToken=jwt.sign({id:user_id,},process.env.JWT_SECRET,{expiresIn:process.env.ACCESS_EXPIRES_IN});

        //Save new refresh token in db 
        user.refreshToken=newRefreshToken;
        await user.save();

        //Send refresh token cookie
        res.cookie("refreshtoken",newRefreshToken,{
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge:7 * 24 * 60 * 60 * 1000,
        });

        res.json({newaccessToken})

    } catch (error) {
        console.error("Refresh error:",err);
        res.status(403).json({msg:"Token invalid or expired"});
    }

});
export default router;