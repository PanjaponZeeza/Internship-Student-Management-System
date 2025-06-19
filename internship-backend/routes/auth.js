const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

/* POST /api/auth/register */
router.post('/register',
  body('username').trim().notEmpty().withMessage('กรุณากรอก username').escape(),
  body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง').normalizeEmail(),
  body('role').notEmpty().withMessage('กรุณากรอก role').escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      await User.registerUser(req.body);
      res.status(201).json({ message: 'ลงทะเบียนสำเร็จ' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/* POST /api/auth/login */
router.post('/login',
  body('username').trim().notEmpty().withMessage('กรุณากรอก username').escape(),
  body('password').notEmpty().withMessage('กรุณากรอก password'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
      const user = await User.findUserByUsername(username);
      if (!user) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

      const validPassword = await User.checkPassword(user, password);
      if (!validPassword) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

      const token = jwt.sign(
        { user_id: user.user_id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({ message: 'เข้าสู่ระบบสำเร็จ', token });
    } catch (error) {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', details: error.message });
    }
  }
);

/* POST /api/auth/change-password */
router.post('/change-password',
  authenticateToken,
  body('oldPassword').notEmpty().withMessage('กรุณากรอกรหัสผ่านเก่า'),
  body('newPassword').isLength({ min: 6 }).withMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัว'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    try {
      await User.changePassword(userId, oldPassword, newPassword);
      res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);  

module.exports = router;
