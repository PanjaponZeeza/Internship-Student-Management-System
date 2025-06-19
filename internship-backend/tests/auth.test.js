const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../middleware/auth'); // เชื่อมกับ middleware

const app = express();

// สร้าง route สำหรับการทดสอบ
app.use(express.json());
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'คุณสามารถเข้าถึงข้อมูลนี้ได้' });
});

app.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: 'คุณเป็น admin สามารถเข้าถึงข้อมูลนี้ได้' });
});

// ฟังก์ชันสำหรับสร้าง JWT Token จำลอง
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, 'your_secret_key_here', { expiresIn: '1h' });
};

describe('Middleware tests', () => {
  // ทดสอบ authenticateToken
  test('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('ไม่มี Token, โปรดเข้าสู่ระบบ');
  });

  test('should return 403 if token is invalid', async () => {
    const invalidToken = 'invalidtoken';
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${invalidToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Token ไม่ถูกต้องหรือหมดอายุ');
  });

  test('should allow access with valid token', async () => {
    const validToken = generateToken('880f285d-f7ff-4c6f-b261-c9d75cfc82d7', 'admin'); // ใช้ user_id และ role จากข้อมูลที่ให้มา
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('คุณสามารถเข้าถึงข้อมูลนี้ได้');
  });

  // ทดสอบ authorizeRoles
  test('should return 403 if user does not have the correct role', async () => {
    const validTokenForStudent = generateToken('880f285d-f7ff-4c6f-b261-c9d75cfc82d7', 'student'); // ใช้ user_id แต่ role เป็น 'student'
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${validTokenForStudent}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
  });

  test('should allow access for users with the correct role (admin)', async () => {
    const validTokenForAdmin = generateToken('880f285d-f7ff-4c6f-b261-c9d75cfc82d7', 'admin'); // ใช้ user_id และ role เป็น 'admin'
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${validTokenForAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('คุณเป็น admin สามารถเข้าถึงข้อมูลนี้ได้');
  });
});

// ทดสอบ Routes ของ auth.js (register, login)
const appRoutes = require('../routes/auth'); // นำเข้ารูทจาก auth.js
app.use('/api/auth', appRoutes);

describe('Auth Routes tests', () => {
  test('should register a new user', async () => {
    const newUser = {
      username: 'testuser',
      password: 'Test1234',
      email: 'test@example.com',
      role: 'student'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);
    
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('ลงทะเบียนสำเร็จ');
  });

  test('should login a user and return a token', async () => {
    const userCredentials = {
      username: 'testuser',
      password: 'Test1234'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(userCredentials);
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();  // ต้องการตรวจสอบว่า token ถูกส่งมา
  });
});
