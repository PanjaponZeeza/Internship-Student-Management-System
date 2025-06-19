const mysql = require('mysql2');
require('dotenv').config();

/**
 * สร้าง MySQL connection โดยใช้ config จากไฟล์ .env
 * - เพื่อป้องกันการ hardcode ค่าลับลงในโค้ด
 */
const connection = mysql.createConnection({
  host: process.env.DB_HOST,         // Host ของ MySQL เช่น localhost หรือ IP
  user: process.env.DB_USER,         // ชื่อผู้ใช้ MySQL
  password: process.env.DB_PASSWORD, // รหัสผ่าน MySQL
  database: process.env.DB_NAME,     // ชื่อ database ที่ใช้
  port: process.env.DB_PORT          // พอร์ต MySQL (ปกติ 3306)
});

/**
 * เชื่อมต่อฐานข้อมูล พร้อม log ผลลัพธ์
 */
connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL as id', connection.threadId);
});

// export connection สำหรับใช้ query ในไฟล์อื่น
module.exports = connection;
