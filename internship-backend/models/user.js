// models/user.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ฟังก์ชันสร้างผู้ใช้ใหม่
const createUser = async ({ username, password, email, role }) => {
  const user_id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (user_id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)';
  const values = [user_id, username, hashedPassword, email, role];

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve({ user_id, username, email, role });
    });
  });
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ตาม user_id
const getUserById = (user_id) => {
  const sql = 'SELECT * FROM users WHERE user_id = ?';

  return new Promise((resolve, reject) => {
    db.query(sql, [user_id], (err, results) => {
      if (err) reject(err);
      if (results.length === 0) reject(new Error('User not found'));
      resolve(results[0]);
    });
  });
};

// ฟังก์ชันอัปเดตข้อมูลผู้ใช้
const updateUser = async (user_id, { username, password, email, role }) => {
  let sql = 'UPDATE users SET username = ?, email = ?, role = ? WHERE user_id = ?';
  const values = [username, email, role, user_id];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql = 'UPDATE users SET username = ?, password_hash = ?, email = ?, role = ? WHERE user_id = ?';
    values.splice(1, 0, hashedPassword);
  }

  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      resolve({ user_id, username, email, role });
    });
  });
};

// ฟังก์ชันลบผู้ใช้
const deleteUser = (user_id) => {
  const sql = 'DELETE FROM users WHERE user_id = ?';

  return new Promise((resolve, reject) => {
    db.query(sql, [user_id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
const getAllUsers = () => {
  const sql = 'SELECT * FROM users';

  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers
};
