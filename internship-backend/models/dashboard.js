// models/dashboard.js
const db = require('../db');

const monthNames = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

async function getAdminOverview(year) {
  // 1. จำนวนผู้ใช้ทั้งหมด และแยกตาม role
  const [users] = await db.promise().query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
  const totalUsers = users.reduce((sum, u) => sum + u.count, 0);
  const roleDistribution = users.map((u) => ({
    role: u.role,
    value: u.count,
  }));

  // 2. จำนวนโปรแกรมฝึกงาน
  const [programs] = await db.promise().query("SELECT COUNT(*) as count FROM internship_programs");
  const totalPrograms = programs[0].count;

  // 3. จำนวนนักศึกษา
  const [students] = await db.promise().query("SELECT COUNT(*) as count FROM students");
  const totalStudents = students[0].count;

  // 4. คะแนนเฉลี่ย feedback
  const [rating] = await db.promise().query("SELECT AVG(rating) as averageRating FROM feedback");
  const averageRating = rating[0]?.averageRating || 0;

  // 5. feedback รายเดือน
  const [feedbacks] = await db.promise().query(
    `SELECT MONTH(feedback_date) AS month, COUNT(*) AS count
     FROM feedback
     WHERE YEAR(feedback_date) = ?
     GROUP BY MONTH(feedback_date)
     ORDER BY MONTH(feedback_date)`,
    [year]
  );
  const monthlyFeedbacks = feedbacks.map(f => ({
    month: monthNames[f.month - 1],
    count: f.count
  }));

  // 6. นักศึกษาต่อปี
  const [studentYearData] = await db.promise().query(
    `SELECT internship_year AS year, COUNT(*) AS count
     FROM students
     GROUP BY internship_year
     ORDER BY internship_year DESC`
  );
  const studentsPerYear = studentYearData.map(row => ({
    year: row.year,
    count: row.count
  }));

  // รวม
  return {
    totalUsers,
    totalStudents,
    totalPrograms,
    averageRating,
    monthlyFeedbacks,
    roleDistribution,
    studentsPerYear
  };
}

module.exports = {
  getAdminOverview
};
