const request = require('supertest');
const app = require('../index'); // ใช้แอปพลิเคชันของคุณ

let feedbackId;

describe('Feedback API', () => {
  
  // Test: GET feedback for a student
  it('should get feedback for a student', async () => {
    const res = await request(app)
      .get('/api/feedback')
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2U3MjY3ZjUtZGVlZC00ZDJiLThlMTEtYmZhZjNjNzE1ZjdmIiwidXNlcm5hbWUiOiJzdXBlcnZpc29yMDAxIiwicm9sZSI6InN1cGVydmlzb3IiLCJpYXQiOjE3NDkxODQzODgsImV4cCI6MTc0OTIxMzE4OH0.m_n5PJw811BAYCn4_e5SfoKVNKvR9Meovj1t24oSAso`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test: POST create a new feedback
  it('should create a new feedback', async () => {
    const newFeedback = {
      student_id: '785e8b93-9842-41ff-ae0e-0a32cda2fa2f',  // ตัวอย่าง student_id
      feedback: 'มาสายบ่อยครั้งคราว เป็นคนเรียนรู้ไว',
      rating: 1,
      feedback_date: '2025-06-05',
    };

    const res = await request(app)
      .post('/api/feedback')
      .send(newFeedback)
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2U3MjY3ZjUtZGVlZC00ZDJiLThlMTEtYmZhZjNjNzE1ZjdmIiwidXNlcm5hbWUiOiJzdXBlcnZpc29yMDAxIiwicm9sZSI6InN1cGVydmlzb3IiLCJpYXQiOjE3NDkxODQzODgsImV4cCI6MTc0OTIxMzE4OH0.m_n5PJw811BAYCn4_e5SfoKVNKvR9Meovj1t24oSAso`);

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Feedback created');
    feedbackId = res.body.feedback_id; // เก็บ ID สำหรับทดสอบอัปเดตและลบ
  });

  // Test: PUT update a feedback
  it('should update an existing feedback', async () => {
    const updatedFeedback = {
      feedback: 'มาสายบ่อยครั้ง แต่พัฒนาตัวเองได้เร็วขึ้น',
      rating: 4,
      feedback_date: '2025-06-06',
    };

    const res = await request(app)
      .put(`/api/feedback/${feedbackId}`)
      .send(updatedFeedback)
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2U3MjY3ZjUtZGVlZC00ZDJiLThlMTEtYmZhZjNjNzE1ZjdmIiwidXNlcm5hbWUiOiJzdXBlcnZpc29yMDAxIiwicm9sZSI6InN1cGVydmlzb3IiLCJpYXQiOjE3NDkxODQzODgsImV4cCI6MTc0OTIxMzE4OH0.m_n5PJw811BAYCn4_e5SfoKVNKvR9Meovj1t24oSAso`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Feedback updated');
  });

  // Test: DELETE a feedback
  it('should delete a feedback', async () => {
    const res = await request(app)
      .delete(`/api/feedback/${feedbackId}`)
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2U3MjY3ZjUtZGVlZC00ZDJiLThlMTEtYmZhZjNjNzE1ZjdmIiwidXNlcm5hbWUiOiJzdXBlcnZpc29yMDAxIiwicm9sZSI6InN1cGVydmlzb3IiLCJpYXQiOjE3NDkxODQzODgsImV4cCI6MTc0OTIxMzE4OH0.m_n5PJw811BAYCn4_e5SfoKVNKvR9Meovj1t24oSAso`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Feedback deleted');
  });
});
