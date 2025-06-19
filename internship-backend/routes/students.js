const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Student = require('../models/student');

// =============== GET /api/students (admin เท่านั้น) ===============
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const students = await Student.getAllStudents();
    res.json(students);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: 'ดึงข้อมูลล้มเหลว', details: err });
  }
});

// =============== GET /api/students/me (student ดูข้อมูลตัวเอง) ===============
router.get('/me', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const userId = req.user.user_id;
  try {
    const student = await Student.getStudentByUserId(userId);
    res.json(student);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(404).json({ error: 'Student not found', details: err.message });
  }
});

// =============== POST /api/students (เพิ่มนักศึกษา) ===============
const studentValidators = [
  // Validate object only (ถ้า req.body เป็น object)
  body().custom(value => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'object') return true;
    throw new Error('ข้อมูลต้องเป็น object หรือ array');
  }),
  body('first_name').if(body().custom(v => !Array.isArray(v))).notEmpty().withMessage('กรุณากรอกชื่อ').trim().escape(),
  body('last_name').if(body().custom(v => !Array.isArray(v))).notEmpty().withMessage('กรุณากรอกนามสกุล').trim().escape(),
  body('internship_year').if(body().custom(v => !Array.isArray(v))).notEmpty().withMessage('กรุณากรอก internship_year'),
  // Validate array only (ถ้า req.body เป็น array)
  body('*.first_name').if(body().custom(Array.isArray)).notEmpty().withMessage('กรุณากรอกชื่อ').trim().escape(),
  body('*.last_name').if(body().custom(Array.isArray)).notEmpty().withMessage('กรุณากรอกนามสกุล').trim().escape(),
  body('*.internship_year').if(body().custom(Array.isArray)).notEmpty().withMessage('กรุณากรอก internship_year'),
];

router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  ...studentValidators,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let students = req.body;
    if (!Array.isArray(students)) students = [students];

    try {
      const createdStudents = await Promise.all(students.map(async student => {
        return await Student.createStudent(student);
      }));
      res.status(201).json({ message: `เพิ่มนักศึกษา ${createdStudents.length} รายการสำเร็จ` });
    } catch (err) {
      console.error("DB Insert Error:", err);
      res.status(500).json({ error: 'เพิ่มนักศึกษาล้มเหลว', details: err });
    }
  }
);

// =============== PUT /api/students/:id (อัปเดตข้อมูลนักศึกษา) ===============
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const studentData = req.body;

  try {
    const updatedStudent = await Student.updateStudent(id, studentData);
    res.json({ message: 'อัปเดตนักศึกษาสำเร็จ', student: updatedStudent });
  } catch (err) {
    res.status(500).json({ error: 'อัปเดตข้อมูลล้มเหลว', details: err });
  }
});

// =============== DELETE /api/students/:id (ลบข้อมูลนักศึกษา) ===============
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await Student.deleteStudent(id);
    res.json({ message: 'ลบนักศึกษาสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'ลบข้อมูลล้มเหลว', details: err });
  }
});

// =============== DELETE /api/students/bulk (ลบหลายคนพร้อมกัน) ===============
router.delete('/bulk', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const ids = req.body;
  try {
    await Student.bulkDeleteStudents(ids);
    res.json({ message: `ลบ ${ids.length} นักศึกษาสำเร็จ` });
  } catch (err) {
    res.status(500).json({ error: 'ลบข้อมูลล้มเหลว', details: err });
  }
});

module.exports = router;
