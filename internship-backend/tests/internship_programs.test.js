const request = require('supertest');
const app = require('../index'); // ใช้แอปพลิเคชันของคุณ
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

let programId;

describe('Internship Programs API', () => {

  // Test: GET all programs
  it('should get all internship programs', async () => {
    const res = await request(app)
      .get('/api/internship_programs')
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODgwZjI4NWQtZjdmZi00YzZmLWIyNjEtYzlkNzVjZmM4MmQ3IiwidXNlcm5hbWUiOiJhZG1pbjAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTE3MzIzMCwiZXhwIjoxNzQ5MjAyMDMwfQ.vddx4SJ3BVpm0e-bgMF0P7Uy3M9yEsrR5pkt8_x1OlQ`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test: PUT update a program
  it('should update an existing internship program', async () => {
    const updatedProgram = {
      program_name: 'โปรแกรมเลี้ยงปลาใหม่',
      start_date: '2025-06-05',
      end_date: '2025-06-06',
      supervisor_id: '3e7267f5-deed-4d2b-8e11-bfaf3c715f7f', // ใช้ id ของ supervisor
      details: 'โปรแกรมเลี้ยงปลาดุกและปลานิล',
      status: 'active',
    };

    const res = await request(app)
      .put(`/api/internship_programs/${programId}`)
      .send(updatedProgram)
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODgwZjI4NWQtZjdmZi00YzZmLWIyNjEtYzlkNzVjZmM4MmQ3IiwidXNlcm5hbWUiOiJhZG1pbjAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTE3MzIzMCwiZXhwIjoxNzQ5MjAyMDMwfQ.vddx4SJ3BVpm0e-bgMF0P7Uy3M9yEsrR5pkt8_x1OlQ`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('อัปเดตโปรแกรมฝึกงานสำเร็จ');
  });

  // Test: DELETE a program
  it('should delete a program', async () => {
    const res = await request(app)
      .delete(`/api/internship_programs/${programId}`)
      .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODgwZjI4NWQtZjdmZi00YzZmLWIyNjEtYzlkNzVjZmM4MmQ3IiwidXNlcm5hbWUiOiJhZG1pbjAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTE3MzIzMCwiZXhwIjoxNzQ5MjAyMDMwfQ.vddx4SJ3BVpm0e-bgMF0P7Uy3M9yEsrR5pkt8_x1OlQ`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('ลบโปรแกรมฝึกงานสำเร็จ');
  });
});
