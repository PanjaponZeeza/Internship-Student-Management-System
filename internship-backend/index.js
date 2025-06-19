// ===== โหลด environment และตั้งค่า Express =====
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// ===== สำหรับอ่าน route files อัตโนมัติ =====
const { readdirSync } = require('fs');
const cors = require('cors');

// ===== Middleware ส่วนกลาง (CORS + JSON Parser) =====
app.use(cors());
app.use(express.json());

/**
 * โหลดและ register router อัตโนมัติจากโฟลเดอร์ /routes
 * โดยแมปชื่อไฟล์ให้กลายเป็น endpoint เช่น user.js -> /api/user
 */
readdirSync('./routes').forEach((file) => {
  const route = require(`./routes/${file}`);
  // เช็คว่า export เป็น express.Router()
  if (route && typeof route.use === 'function') {
    const routeName = `/${file.replace('.js', '')}`;
    app.use(`/api${routeName}`, route);
  } else {
    console.warn(`⚠️  ไฟล์ ${file} ไม่ได้ export express.Router() ที่ถูกต้อง`);
  }
});

// ===== route ที่ต้องแยกออกมาเฉพาะ =====
app.use('/api/supervisor', require('./routes/supervisor'));
app.use('/dashboard', require('./routes/dashboard'));

// ===== Route test index (health check) =====
app.get('/', (req, res) => {
  res.send('🎉 Internship Backend is running!');
});

// ===== เริ่มรัน server =====
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// ===== Export app (สำหรับใช้ใน test) =====
module.exports = app;
