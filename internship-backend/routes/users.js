const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/user'); // ใช้โมเดล User

// =============== ส่วน POST /api/users ===============
router.post('/', 
  authenticateToken,
  body().custom(value => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'object') return true;
    throw new Error('ข้อมูลต้องเป็น object หรือ array');
  }),
  body('*.username').optional().trim().notEmpty().withMessage('กรุณากรอก username').escape(),
  body('*.password').optional().notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
  body('*.email').optional({ checkFalsy: true }).isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง').normalizeEmail(),
  body('*.role').optional().notEmpty().withMessage('กรุณากรอก role').escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let users = req.body;
    if (!Array.isArray(users)) users = [users];

    // === เพิ่มเช็ก input ซ้ำสำหรับทุก user ===
    for (const u of users) {
      if (!u.username || !u.password || !u.role) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน (ต้องมี username, password, role)' });
      }
    }

    try {
      const createdUsers = await Promise.all(users.map(async u => {
        return await User.createUser(u);
      }));

      res.status(201).json({ message: `เพิ่มผู้ใช้ ${createdUsers.length} รายการสำเร็จ` });
    } catch (err) {
      console.error("DB Error:", err);
      res.status(500).json({ error: 'เพิ่มผู้ใช้ล้มเหลว', details: err.message || err });
    }
  }
);

// =============== ส่วน GET /api/users ===============
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'ดึงข้อมูลล้มเหลว', details: err });
  }
});

// =============== ส่วน GET /api/users/:id ===============
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.getUserById(id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }
});

// =============== ส่วน PUT /api/users/:id ===============
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, email, role } = req.body;

  const updateData = { username, password, email, role };
  try {
    const updatedUser = await User.updateUser(id, updateData);
    res.json({ message: 'อัปเดตผู้ใช้สำเร็จ', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'อัปเดตผู้ใช้ล้มเหลว', details: err });
  }
});

// =============== ส่วน DELETE /api/users/:id ===============
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await User.deleteUser(id);
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'ลบผู้ใช้ล้มเหลว', details: err });
  }
});

module.exports = router;
