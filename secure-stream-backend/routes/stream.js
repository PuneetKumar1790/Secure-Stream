import express from "express";
const router=express.Router();
router.get("/",(req,res)=>{
    res.send("Streaming route connected ");
});

export default router;