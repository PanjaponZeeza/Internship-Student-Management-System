const jwt = require('jsonwebtoken');

// กำหนด secret สำหรับ JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// Middleware สำหรับตรวจสอบ JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'ไม่มี Token, โปรดเข้าสู่ระบบ' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }

    if (!user) {
      return res.status(401).json({ error: 'ไม่พบข้อมูลผู้ใช้ใน token' });
    }

    req.user = user;
    next();
  });
}

// Middleware สำหรับตรวจสอบ role ของผู้ใช้
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // ตรวจสอบว่า user ถูกกำหนดใน req หรือไม่
    if (!req.user) {
      return res.status(401).json({ error: 'ไม่พบข้อมูลผู้ใช้ใน token' });
    }

    // ตรวจสอบว่า role ของ user ตรงกับที่อนุญาตหรือไม่
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' });
    }

    // ถ้าผ่านทั้งสองเงื่อนไขนี้ จะให้ผ่านไปยัง endpoint ต่อไป
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
