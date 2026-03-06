require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

(async () => {
  try {

    const username = "admin";
    const password = "admin"; 
    const role = "admin";

    const [rows] = await db.query("SELECT * FROM users WHERE username=?", [username]);
    if (rows.length > 0) {
      console.log("Admin user มีอยู่แล้ว");
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)",
      [username, hashed,  role]
    );

    console.log("สร้าง Admin user สำเร็จ");
  } catch (err) {
    console.error("เกิดข้อผิดพลาด:", err.message);
  }
})();
