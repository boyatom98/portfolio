const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.query.token;
  const token = authHeader && authHeader.split(" ")[1] || authHeader;
  
  if (!token) {
    return res.status(401).json({ success: false, message: "ไม่พบโทเค็น" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET ไม่ได้ตั้งค่าใน env");
    return res.status(500).json({ success: false, message: "ไม่สามารถตั้งค่า JWT_SECRET ได้" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("โทเค็นไม่ถูกต้อง:", err.message);
      return res.status(403).json({ success: false, message: "โทเค็นไม่ถูกต้อง" });
    }
    
    if (!user || !user.role) {
      console.error("โทเค็นไม่มีข้อมูล:", user);
      return res.status(403).json({ success: false, message: "โทเค็นไม่มีข้อมูล" });
    }

    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "ยังไม่ได้เข้าสู่ระบบ" });
    }
    
    if (!req.user.role) {
      console.error("ผู้ใช้ไม่มีสิทธิ์ :", req.user);
      return res.status(403).json({ success: false, message: "ไม่พบสิทธิ์ของผู้ใช้" });
    }

    if (!roles.includes(req.user.role)) {
      console.error(`User role "${req.user.role}" ไม่มีสิทธิ์เข้าถึง :`, roles);
      return res.status(403).json({ success: false, message: `ไม่มีสิทธิ์เข้าถึง (require: ${roles.join(", ")})` });
    }
    

    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
