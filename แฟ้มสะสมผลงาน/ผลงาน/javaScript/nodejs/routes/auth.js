const express = require("express");
const router = express.Router();
const db = require("../db"); // Connection Pool
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { authenticateToken ,authorizeRoles} = require("../middleware/auth");
const e = require("express");


// สมัครสมาชิก evaluatee
router.post("/register", async (req,res)=>{
    try {
        const { username, password } = req.body;

        if(!username||!password) return res.json({success:false,message:"ข้อมูลไม่ครบ"});

        const [eix] = await db.query("SELECT * FROM users WHERE username=? ", [username]);
        if(eix.length > 0){
            return res.status(400).json({ success:false, message:"Username  นี้ถูกใช้แล้ว" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users (username,password,role) VALUES (?,?,?)",
            [username, hashedPassword, "user"]
        );

        res.json({ success:true, message:"สมัครสมาชิกสำเร็จ" });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:"เกิดข้อผิดพลาดในระบบ" });
    }
});

// login
router.post("/login", async (req,res)=>{
    try{
        const {username,password} = req.body;
        if(!username||!password) return res.json({success:false,message:"ข้อมูลไม่ครบ"});

        const [rows] = await db.query("SELECT * FROM users WHERE username=?",[username]);
        if(rows.length===0) return res.json({success:false,message:"ไม่พบชื่อบัญชี"});

        const user = rows[0];

        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.json({success:false,message:"รหัสผ่านผิด"});

        // Generate token
        const token = jwt.sign(
            {id:user.id, username:user.username, role:user.role}, 
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        );
        
        if(!token) {
            console.error("Failed to generate token for user:", username);
            return res.status(500).json({success:false,message:"Failed to generate token"});
        }

        console.log("เข้าสู่ระบบสำเร็จ ชื่อ:", username);
        res.json({success:true,message:"Login สำเร็จ",token,"บทบาท : ":user.role});
    }catch(err){
        console.error(err);
        res.status(500).json({ success:false, message:"เกิดข้อผิดพลาดในระบบ" });
    }
});

// สมัครสมาชิก 
router.post("/createAdmin", async (req,res)=>{
    try {
        const username = "admin";
        const password = "admin";
        const role = "admin";

        const [eix] = await db.query("SELECT * FROM users WHERE username=? ", [username]);
        if(eix.length > 0){
            return res.status(400).json({ success:false, message:" admin ถูกใช้แล้ว" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users (username,password,role) VALUES (?,?,?)",
            [username, hashedPassword, role]
        );

        res.json({ success:true, message:"สร้าง admin สำเร็จ" });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:"เกิดข้อผิดพลาดในระบบ" });
    }
});


module.exports = router;