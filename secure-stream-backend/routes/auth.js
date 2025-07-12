import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router=Router();

// Sign UP route
router.post("/signup",async(req,res)=>{
    try {
        const {username,email,password}=req.body;

        if(!username||!password||!email){
            return res.status(400).json({msg:"All fields are required"})
        }

        if(password.length<6){
            return res.status(400).json({msg:"Password must be atleast 6 characters long "})
        }

        //Checking existing user 
        const existingUser=await User.findOne({$or: [{ email }, { username }]});
        if(existingUser){
            return res.status(400).json({msg:"User already exists"})
        }

        //Hashing
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        
        //Save user
        const newUser=new User({username,email,password:hashedPassword});
        await newUser.save();
        res.status(201).json({msg:"Signup successful"});


    } catch (error) {
        res.sendStatus(500).json({msg:"Signup error",error:err.message});
    }
});


//Login route
router.post("/login",async(req,res)=>{
    try {
        const{email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({msg:"Email and password are required"});
        }

        //find user
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:"Invalid credentials"})
        }
        //Check pswrd
        const ismatch= await bcrypt.compare(password,user.password);
        if(!ismatch) return res.status(400).json({msg:"Invalid credentials"})

        //Genertae tokens
        const accessToken=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.ACCESS_EXPIRES_IN});
        const refreshToken=jwt.sign({id:user._id},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.REFRESH_EXPIRES_IN});

        //Save new refresh token in DB
        user.refreshToken=refreshToken;
        await user.save();

        //Send refresh token in cookies 
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge:7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({accessToken});

    } catch (error) {
        console.error("Login error :",error);
        res.status(500).json({msg:"Login failed",error:error.message})
    }
})