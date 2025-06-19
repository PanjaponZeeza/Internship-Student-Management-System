
// models/feedback.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function formatDate(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 10);
}

// ดึง feedback ตามสิทธิ์
const getFeedback = async (user, student_id = null) => {
  let sql = '';
  let params = [];

  if (user.role === 'student') {
    sql = `
      SELECT f.*
      FROM feedback f
      JOIN students s ON f.student_id = s.student_id
      WHERE s.user_id = ?
    `;
    params = [user.user_id];
  } else if (user.role === 'supervisor') {
    sql = `
      SELECT f.* FROM feedback f
      JOIN students s ON f.student_id = s.student_id
      JOIN internship_programs ip ON s.program_id = ip.program_id
      WHERE ip.supervisor_id = ?
    `;
    params = [user.user_id];
    if (student_id) {
      sql += ' AND f.student_id = ?';
      params.push(student_id);
    }
  } else if (user.role === 'admin') {
    if (student_id) {
      sql = 'SELECT * FROM feedback WHERE student_id = ?';
      params = [student_id];
    } else {
      sql = 'SELECT * FROM feedback';
      params = [];
    }
  } else {
    throw new Error('Access denied');
  }

  const [results] = await db.promise().query(sql, params);
  return results.map(item => ({
    ...item,
    feedback_date: item.feedback_date ? item.feedback_date.toISOString().slice(0, 10) : null,
  }));
};

// สร้าง feedback
const createFeedback = async ({ student_id, feedback, rating, feedback_date, supervisor_id }) => {
  const feedback_id = uuidv4();
  const sql =
    'INSERT INTO feedback (feedback_id, student_id, supervisor_id, feedback, rating, feedback_date) VALUES (?, ?, ?, ?, ?, ?)';
  await db
    .promise()
    .query(sql, [feedback_id, student_id, supervisor_id, feedback, rating, formatDate(feedback_date)]);
  return feedback_id;
};

// อัปเดต feedback
const updateFeedback = async (feedback_id, user, data) => {
  // หา feedback record
  const [rows] = await db.promise().query('SELECT * FROM feedback WHERE feedback_id = ?', [feedback_id]);
  if (rows.length === 0) throw new Error('Feedback not found');
  const feedbackRecord = rows[0];

  if (user.role !== 'admin') {
    // เช็คสิทธิ์ supervisor
    const [studentRows] = await db.promise().query(
      `SELECT s.student_id FROM students s
       JOIN internship_programs ip ON s.program_id = ip.program_id
       WHERE s.student_id = ? AND ip.supervisor_id = ?`,
      [feedbackRecord.student_id, user.user_id]
    );
    if (studentRows.length === 0) throw new Error('Not authorized to edit this feedback');
  }

  // เตรียม fields ที่จะอัปเดต (dynamic)
  const fields = [];
  const params = [];

  if (data.feedback !== undefined) {
    fields.push('feedback = ?');
    params.push(data.feedback);
  }
  if (data.rating !== undefined) {
    fields.push('rating = ?');
    params.push(data.rating);
  }
  if (data.feedback_date !== undefined) {
    fields.push('feedback_date = ?');
    params.push(formatDate(data.feedback_date));
  }
  if (fields.length === 0) throw new Error('No fields to update');
  params.push(feedback_id);

  const sql = `UPDATE feedback SET ${fields.join(', ')} WHERE feedback_id = ?`;
  await db.promise().query(sql, params);
  return true;
};

// ลบ feedback
const deleteFeedback = async (feedback_id, user) => {
  const [rows] = await db.promise().query('SELECT * FROM feedback WHERE feedback_id = ?', [feedback_id]);
  if (rows.length === 0) throw new Error('Feedback not found');
  const feedbackRecord = rows[0];

  if (user.role !== 'admin') {
    // เช็คสิทธิ์ supervisor
    const [studentRows] = await db.promise().query(
      `SELECT s.student_id FROM students s
       JOIN internship_programs ip ON s.program_id = ip.program_id
       WHERE s.student_id = ? AND ip.supervisor_id = ?`,
      [feedbackRecord.student_id, user.user_id]
    );
    if (studentRows.length === 0) throw new Error('Not authorized to delete this feedback');
  }

  await db.promise().query('DELETE FROM feedback WHERE feedback_id = ?', [feedback_id]);
  return true;
};

module.exports = {
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
