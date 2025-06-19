// models/supervisor.js
const db = require('../db');

// ดึงรายชื่อนักศึกษาฝึกงานที่ supervisor ดูแล พร้อมเช็คว่ามี feedback หรือยัง
const getStudentsForSupervisor = (supervisorId) => {
  const sql = `
    SELECT s.*, ip.program_name, f.feedback_id
    FROM students s
    JOIN internship_programs ip ON s.program_id = ip.program_id
    LEFT JOIN feedback f ON s.student_id = f.student_id AND f.supervisor_id = ?
    WHERE ip.supervisor_id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(sql, [supervisorId, supervisorId], (err, results) => {
      if (err) return reject(err);
      // แปลงวันที่และเพิ่ม property feedback_given
      const formatted = results.map(s => ({
        ...s,
        internship_start_date: s.internship_start_date?.toISOString().slice(0, 10),
        internship_end_date: s.internship_end_date?.toISOString().slice(0, 10),
        feedback_given: !!s.feedback_id
      }));
      resolve(formatted);
    });
  });
};

module.exports = {
  getStudentsForSupervisor,
};
