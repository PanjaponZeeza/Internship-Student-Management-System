const request = require('supertest');
const app = require('../index'); // ใช้ path ที่ export app จริง

// Token สำหรับ admin (seed data ของคุณ)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODgwZjI4NWQtZjdmZi00YzZmLWIyNjEtYzlkNzVjZmM4MmQ3IiwidXNlcm5hbWUiOiJhZG1pbjAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTE3MzIzMCwiZXhwIjoxNzQ5MjAyMDMwfQ.vddx4SJ3BVpm0e-bgMF0P7Uy3M9yEsrR5pkt8_x1OlQ';

describe('Users API', () => {
  let createdUserId;

  // 1. ทดสอบการสร้างผู้ใช้ใหม่ (POST /api/users)
  it('should create a new user', async () => {
    const newUser = {
      username: 'testuser001',
      password: 'Password123!',
      email: 'testuser001@example.com',
      role: 'student'
    };
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/เพิ่มผู้ใช้/);

    // ดึง user id ล่าสุด (GET /api/users)
    const users = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);
    const user = users.body.find(u => u.username === 'testuser001');
    expect(user).toBeDefined();
    createdUserId = user.user_id;
  });

  // 2. ทดสอบ GET /api/users
  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // 3. ทดสอบ GET /api/users/:id
  it('should get user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user_id).toBe(createdUserId);
    expect(res.body.username).toBe('testuser001');
  });

  // 4. ทดสอบ PUT /api/users/:id (อัปเดต)
  it('should update user', async () => {
    const updatedData = {
      username: 'testuser001_updated',
      email: 'updateduser001@example.com',
      role: 'student'
      // ไม่ใส่ password
    };
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('อัปเดตผู้ใช้สำเร็จ');
    expect(res.body.user.username).toBe('testuser001_updated');
  });

  // 5. ทดสอบ DELETE /api/users/:id
  it('should delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('ลบผู้ใช้สำเร็จ');
  });

  // 6. ทดสอบ error (ขาด token)
  it('should return 401 if no token provided', async () => {
    const res = await request(app)
      .get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  // 7. ทดสอบ error (ไม่พบ user)
  it('should return 404 if user not found', async () => {
    const fakeId = '11111111-2222-3333-4444-555555555555';
    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    expect(res.statusCode).toBe(404);
  });

  // 8. ทดสอบ POST (validation fail)
  it('should return 400 for invalid input', async () => {
    const badUser = { email: 'bademail', role: '' };
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(badUser);

    expect(res.statusCode).toBe(400);
  });
});
