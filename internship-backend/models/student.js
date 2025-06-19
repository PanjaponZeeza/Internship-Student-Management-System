const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// ===== CREATE =====
const createStudent = async ({
  first_name, last_name, university, department, internship_department,
  internship_start_date, internship_end_date, email, phone_number, status, comments,
  internship_year, user_id, program_id
}) => {
  const student_id = uuidv4();
  // Set default value for status
  const _status = typeof status === 'string' && status ? status : 'active';

  const sql = `
    INSERT INTO students (
      student_id, first_name, last_name, university, department, internship_department,
      internship_start_date, internship_end_date, email, phone_number, status, comments,
      internship_year, user_id, program_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    student_id, first_name, last_name, university, department, internship_department,
    internship_start_date, internship_end_date, email, phone_number, _status, comments,
    internship_year, user_id, program_id
  ];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ student_id, first_name, last_name, email, program_id });
    });
  });
};

// ===== GET ALL =====
const getAllStudents = () => {
  const sql = `
    SELECT 
      s.*, 
      u.username AS username, 
      ip.program_name AS program_name 
    FROM students s
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN internship_programs ip ON s.program_id = ip.program_id
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// ===== GET BY USER ID =====
const getStudentByUserId = (user_id) => {
  const sql = `
    SELECT s.*, ip.program_name
    FROM students s
    LEFT JOIN internship_programs ip ON s.program_id = ip.program_id
    WHERE s.user_id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(sql, [user_id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error('Student not found'));
      resolve(results[0]);
    });
  });
};

// ===== UPDATE =====
const updateStudent = async (student_id, {
  first_name, last_name, university, department, internship_department,
  internship_start_date, internship_end_date, email, phone_number, status, comments,
  internship_year, user_id, program_id
}) => {
  // Default status ถ้าไม่ได้ส่ง
  const _status = typeof status === 'string' && status ? status : 'active';

  const sql = `
    UPDATE students SET
      first_name = ?, last_name = ?, university = ?, department = ?, internship_department = ?,
      internship_start_date = ?, internship_end_date = ?, email = ?, phone_number = ?,
      status = ?, comments = ?, internship_year = ?, user_id = ?, program_id = ?
    WHERE student_id = ?`;

  const values = [
    first_name, last_name, university, department, internship_department,
    internship_start_date, internship_end_date, email, phone_number, _status, comments,
    internship_year, user_id, program_id, student_id
  ];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({ student_id, first_name, last_name, email, program_id });
    });
  });
};

// ===== DELETE =====
const deleteStudent = (student_id) => {
  const sql = 'DELETE FROM students WHERE student_id = ?';

  return new Promise((resolve, reject) => {
    db.query(sql, [student_id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// ===== BULK DELETE =====
const bulkDeleteStudents = (student_ids) => {
  const sql = 'DELETE FROM students WHERE student_id IN (?)';

  return new Promise((resolve, reject) => {
    db.query(sql, [student_ids], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentByUserId,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents
};
