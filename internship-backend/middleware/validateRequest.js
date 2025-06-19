//validateRequest.js ตรวจสอบความถูกต้องของข้อมูล
const { validationResult, body } = require('express-validator');

// ===== Middleware ตรวจสอบผล validation จาก express-validator =====
// ถ้า validation มี error จะส่งกลับ error ทั้งหมด (array) พร้อม HTTP 400
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ===== กฎ validate สำหรับการสมัครสมาชิก (/api/auth/register) =====
const validateRegister = [
  body('username')
    .notEmpty().withMessage('กรุณากรอก username')
    .isLength({ min: 3 }).withMessage('username ต้องมีอย่างน้อย 3 ตัวอักษร'),

  body('password')
    .notEmpty().withMessage('กรุณากรอก password')
    .isLength({ min: 6 }).withMessage('password ต้องมีอย่างน้อย 6 ตัวอักษร'),

  body('email')
    .optional()
    .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),

  body('role')
    .notEmpty().withMessage('กรุณากรอก role')
    .isIn(['admin', 'student', 'supervisor']).withMessage('role ต้องเป็น admin, student หรือ supervisor'),
];

// ===== กฎ validate สำหรับข้อมูล student (POST/PUT /api/students) =====
const validateStudent = [
  body('first_name')
    .notEmpty().withMessage('กรุณากรอกชื่อ'),

  body('last_name')
    .notEmpty().withMessage('กรุณากรอกนามสกุล'),

  body('email')
    .optional()
    .isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),

  body('internship_start_date')
    .optional()
    .isISO8601().withMessage('รูปแบบวันที่เริ่มต้นฝึกงานไม่ถูกต้อง'),

  body('internship_end_date')
    .optional()
    .isISO8601().withMessage('รูปแบบวันที่สิ้นสุดฝึกงานไม่ถูกต้อง'),

  body('internship_year')
    .optional()
    .isInt({ min: 2000 }).withMessage('ปีฝึกงานต้องเป็นจำนวนเต็มและไม่น้อยกว่า 2000'),

  body('user_id')
    .optional()
    .isUUID().withMessage('user_id ต้องเป็น UUID'),

  body('program_id')
    .optional()
    .isUUID().withMessage('program_id ต้องเป็น UUID'),
];

// ===== กฎ validate สำหรับ internship program (POST/PUT /api/internship_programs) =====
const validateInternshipProgram = [
  body('program_name')
    .notEmpty().withMessage('กรุณากรอกชื่อโปรแกรมฝึกงาน'),

  body('start_date')
    .optional()
    .isISO8601().withMessage('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง'),

  body('end_date')
    .optional()
    .isISO8601().withMessage('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง'),

  body('supervisor_id')
    .optional()
    .isUUID().withMessage('supervisor_id ต้องเป็น UUID'),
];

// ===== กฎ validate สำหรับ feedback (POST/PUT /api/feedback) =====
const validateFeedback = [
  body('student_id')
    .notEmpty().withMessage('กรุณาระบุ student_id')
    .isUUID().withMessage('student_id ต้องเป็น UUID'),

  body('supervisor_id')
    .notEmpty().withMessage('กรุณาระบุ supervisor_id')
    .isUUID().withMessage('supervisor_id ต้องเป็น UUID'),

  body('feedback')
    .notEmpty().withMessage('กรุณากรอก feedback'),

  body('rating')
    .notEmpty().withMessage('กรุณาระบุ rating')
    .isInt({ min: 1, max: 5 }).withMessage('rating ต้องอยู่ระหว่าง 1-5'),

  body('feedback_date')
    .optional()
    .isISO8601().withMessage('รูปแบบวันที่ feedback ไม่ถูกต้อง'),
];

// ===== Export middleware และ rules สำหรับนำไปใช้กับ route ต่าง ๆ =====
module.exports = {
  validateRequest,
  validateRegister,
  validateStudent,
  validateInternshipProgram,
  validateFeedback,
};
