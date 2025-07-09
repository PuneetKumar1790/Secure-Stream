import mongoose from "mongoose";
const UserSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    pasword:{
        type:String,
        required:[true,"Password is required "],
        
    }
},{timestamps:true});

export const User=mongoose.model("User",UserSchema)