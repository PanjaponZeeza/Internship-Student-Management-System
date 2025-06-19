// models/user.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const findUserByUsername = async (username) => {
  const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

const findUserById = async (user_id) => {
  const [rows] = await db.promise().query('SELECT * FROM users WHERE user_id = ?', [user_id]);
  return rows[0] || null;
};

const registerUser = async ({ username, password, email, role }) => {
  // check ซ้ำ
  const existing = await findUserByUsername(username);
  if (existing) throw new Error('ชื่อผู้ใช้นี้มีคนใช้แล้ว');
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  await db.promise().query(
    'INSERT INTO users (user_id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)',
    [userId, username, hashedPassword, email || null, role]
  );
  return true;
};

const checkPassword = async (user, password) => {
  return await bcrypt.compare(password, user.password_hash);
};

const changePassword = async (user_id, oldPassword, newPassword) => {
  const user = await findUserById(user_id);
  if (!user) throw new Error('ไม่พบผู้ใช้');
  const match = await bcrypt.compare(oldPassword, user.password_hash);
  if (!match) throw new Error('รหัสผ่านเก่าไม่ถูกต้อง');
  const newHash = await bcrypt.hash(newPassword, 10);
  await db.promise().query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, user_id]);
  return true;
};

module.exports = {
  findUserByUsername,
  findUserById,
  registerUser,
  checkPassword,
  changePassword,
};
