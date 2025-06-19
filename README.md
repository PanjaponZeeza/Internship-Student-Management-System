# Internship Student Management System

ระบบบริหารจัดการนักศึกษาฝึกงาน (Internship Student Management System)  
สำหรับดูแล จัดการข้อมูลนักศึกษา โปรแกรมฝึกงาน อาจารย์ที่ปรึกษา และ feedback แบบครบวงจร

---

## 🔧 Tech Stack (เทคโนโลยีที่ใช้)

**Backend:**
- Node.js (v18.x)
- Express.js
- MySQL 8+
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- dotenv
- multer (สำหรับอัปโหลดไฟล์)
- uuid

**Frontend:**
- React (ผ่าน Vite)
- React Router v7+
- Axios
- TailwindCSS
- FontAwesome
- React Icons, Recharts, react-hot-toast, react-csv, papaparse

**Testing/Dev:**
- Jest, Supertest (backend)
- ESLint (frontend)

---

## 🚀 วิธีติดตั้งและรันระบบ

### 1. Clone/ดาวน์โหลดโปรเจกต์
```sh
git clone <your-repo-url>
cd <project-root>


2. เตรียม .env (สำคัญ!)
backend:
คัดลอกไฟล์ backend/.env.example เป็น backend/.env แล้วกรอกค่าตามเครื่องตัวเอง

frontend:
คัดลอกไฟล์ frontend/.env.example เป็น frontend/.env
(ปกติ API URL ใช้ http://localhost:3000/api)

3. ติดตั้ง dependencies
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

4. เตรียมฐานข้อมูล
สร้างฐานข้อมูลและตารางตามไฟล์ตัวอย่างนี้ (หรือใช้ไฟล์ database/internship_db.sql ถ้ามี)

ใช้ MySQL (phpMyAdmin, MySQL Workbench หรือ command line)

ตัวอย่างคำสั่ง CLI
mysql -u root -p < database/internship_db.sql
ถ้าไม่มีไฟล์ .sql, ให้นำ script ด้านล่างไปวางใน phpMyAdmin หรือ command line

<details> <summary>ดู CREATE TABLE script ที่ใช้ในโปรเจกต์นี้</summary>

-- สร้างฐานข้อมูล (ถ้ายังไม่ได้สร้าง)
CREATE DATABASE IF NOT EXISTS internship_db;
USE internship_db;

-- ตาราง users
CREATE TABLE users (
    user_id VARCHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ตาราง internship_programs
CREATE TABLE internship_programs (
    program_id VARCHAR(36) NOT NULL PRIMARY KEY,
    program_name VARCHAR(100) NOT NULL,
    program_code VARCHAR(50),
    start_date DATE,
    end_date DATE,
    supervisor_id VARCHAR(36),
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES users(user_id)
);
-- ตาราง students
CREATE TABLE students (
    student_id VARCHAR(36) NOT NULL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    university VARCHAR(100),
    department VARCHAR(100),
    internship_department VARCHAR(100),
    internship_start_date DATE,
    internship_end_date DATE,
    email VARCHAR(100),
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    comments TEXT,
    user_id VARCHAR(36),
    program_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    internship_year YEAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (program_id) REFERENCES internship_programs(program_id)
);
-- ตาราง feedback
CREATE TABLE feedback (
    feedback_id VARCHAR(36) NOT NULL PRIMARY KEY,
    student_id VARCHAR(36),
    supervisor_id VARCHAR(36),
    feedback TEXT,
    rating INT,
    feedback_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (supervisor_id) REFERENCES users(user_id)
);



5. รัน Backend และ Frontend
Backend
cd backend
node index.js
# หรือ npm start (ถ้ามี script เพิ่ม)

Frontend
cd frontend
npm run dev

Backend: เปิดที่ http://localhost:3000
Frontend: เปิดที่ http://localhost:5173

👤 User ตัวอย่าง (login สำหรับทดสอบ)แต่ต้องมีข้อมูลในฐานข้อมูลก่อน
Username: admin001
Password: admin1234

📋 ฟีเจอร์หลัก
ระบบลงทะเบียน/ล็อกอิน (JWT Auth)

จัดการข้อมูลนักศึกษา โปรแกรมฝึกงาน อาจารย์ และ feedback

Dashboard สำหรับ admin (สถิติ, ภาพรวม)

Import/Export ข้อมูลเป็น CSV

ฟอร์มกรอกข้อมูลด้วย validation อัตโนมัติ

ระบบสิทธิ์ user (admin, supervisor, student)

รองรับ responsive (mobile/desktop)

⚠️ หมายเหตุ/ข้อควรรู้
ต้องติดตั้ง MySQL ในเครื่อง และตั้งค่าตรงกับ .env

หากมีปัญหา database connection หรือ login, เช็คพอร์ต, user, password ใน .env

หาก deploy จริง ควรเปลี่ยน JWT_SECRET และไม่ใช้รหัสผ่านง่าย ๆ

หากใช้งานบน server จริง, ควรใส่ HTTPS/SSL ด้วย

📬 ช่องทางติดต่อ
Email: panjaponpuakinsang2004@gmail.com

📂 ตัวอย่างไฟล์ .env.example
backend/.env.example

DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret
PORT=3000


frontend/.env.example
VITE_API_URL=http://localhost:3000/api

