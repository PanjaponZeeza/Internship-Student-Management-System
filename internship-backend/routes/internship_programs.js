const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const csv = require('csvtojson');
const fs = require('fs');
const InternshipProgram = require('../models/internship_program');

const upload = multer({ dest: 'uploads/' });

// GET all programs
router.get('/', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const programs = await InternshipProgram.getAllPrograms();
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: 'ดึงข้อมูลล้มเหลว', details: err });
  }
});

// POST add/bulk add (Bulk POST to create multiple internship programs)
router.post('/bulk',
  authenticateToken,
  body().isArray().withMessage('ข้อมูลต้องเป็น array ของโปรแกรมฝึกงาน'),
  body('*.program_name').trim().notEmpty().withMessage('กรุณากรอกชื่อโปรแกรมฝึกงาน'),
  body('*.start_date').isISO8601().withMessage('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง'),
  body('*.end_date').isISO8601().withMessage('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง'),
  body('*.supervisor_id').notEmpty().isUUID().withMessage('กรุณาเลือกผู้ดูแล'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let programs = req.body;
    try {
      const result = await InternshipProgram.bulkImportPrograms(programs);
      res.status(201).json({ message: `เพิ่มโปรแกรมฝึกงาน ${result.affectedRows} รายการสำเร็จ` });
    } catch (err) {
      res.status(500).json({ error: 'เพิ่มโปรแกรมฝึกงานล้มเหลว', details: err });
    }
  }
);

// PUT update one
router.put('/:id',
  authenticateToken,
  body('program_name').trim().notEmpty().withMessage('กรุณากรอกชื่อโปรแกรมฝึกงาน').escape(),
  body('start_date').optional().isISO8601().withMessage('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง'),
  body('end_date').optional().isISO8601().withMessage('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง'),
  body('supervisor_id').optional().isUUID().withMessage('supervisor_id ต้องเป็น UUID'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { id } = req.params;
    try {
      await InternshipProgram.updateProgram(id, req.body);
      res.json({ message: 'อัปเดตโปรแกรมฝึกงานสำเร็จ' });
    } catch (err) {
      res.status(500).json({ error: 'อัปเดตล้มเหลว', details: err });
    }
  }
);

// PUT bulk update
router.put('/bulk',
  authenticateToken,
  body().isArray().withMessage('ข้อมูลต้องเป็น array'),
  body('*.program_id').notEmpty().isUUID().withMessage('program_id ต้องเป็น UUID'),
  body('*.program_name').trim().notEmpty().withMessage('กรุณากรอกชื่อโปรแกรมฝึกงาน').escape(),
  body('*.start_date').optional().isISO8601().withMessage('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง'),
  body('*.end_date').optional().isISO8601().withMessage('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง'),
  body('*.supervisor_id').optional().isUUID().withMessage('supervisor_id ต้องเป็น UUID'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      await InternshipProgram.bulkUpdatePrograms(req.body);
      res.json({ message: `อัปเดตโปรแกรมฝึกงาน ${req.body.length} รายการสำเร็จ` });
    } catch (err) {
      res.status(500).json({ error: 'อัปเดตล้มเหลว', details: err });
    }
  }
);

// DELETE one
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await InternshipProgram.deleteProgram(id);
    res.json({ message: 'ลบโปรแกรมฝึกงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: 'ลบล้มเหลว', details: err });
  }
});

// DELETE bulk
router.delete('/bulk', authenticateToken, async (req, res) => {
  const ids = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ต้องส่ง array ของ program_id' });
  try {
    const result = await InternshipProgram.bulkDeletePrograms(ids);
    res.json({ message: `ลบโปรแกรมฝึกงาน ${result.affectedRows} รายการสำเร็จ` });
  } catch (err) {
    res.status(500).json({ error: 'ลบล้มเหลว', details: err });
  }
});

// POST CSV import
router.post(
  '/import',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'กรุณาแนบไฟล์ CSV' });
    try {
      const programs = await csv().fromFile(req.file.path);
      const result = await InternshipProgram.bulkImportPrograms(programs);
      fs.unlink(req.file.path, () => {});
      res.json({ message: `นำเข้าโปรแกรมฝึกงานสำเร็จ ${result.affectedRows} รายการ` });
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ error: 'แปลงไฟล์ CSV ล้มเหลว', details: error.message });
    }
  }
);

module.exports = router;
