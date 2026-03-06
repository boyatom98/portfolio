const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const { authenticateToken ,authorizeRoles} = require("../middleware/auth");

//แสดงรายชื่อ user
router.get("/users", authenticateToken,authorizeRoles("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, username 
      FROM users 
      WHERE role = 'user'
      ORDER BY id ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึง users" });
  }
});

router.get("/admin", authenticateToken,authorizeRoles("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, username 
      FROM users 
      WHERE role = 'admin'
      ORDER BY id ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการดึง admin" });
  }
});


// ลบ user
router.delete("/delete_user/:id", authenticateToken,authorizeRoles("admin"), async (req, res) => {
  try {
    const id = req.params.id;

    // ลบ users จะ cascade ลบ evaluators ด้วย
    await db.query("DELETE FROM users WHERE id=? AND role='user'", [id]);

    res.json({ success: true, message: "ลบ user สำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบ user" });
  }
});

// แกเ้ข user
router.put("/edit_user/:id", authenticateToken,authorizeRoles("admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
    }

    await db.query(
      "UPDATE users SET username=? WHERE id=?",
      [username, userId]
    );

    res.json({ success: true, message: "แก้ไข user สำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการแก้ไข user" });
  }
});


module.exports = router;
