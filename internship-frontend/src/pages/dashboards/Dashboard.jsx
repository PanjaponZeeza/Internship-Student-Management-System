// Dashboard.jsx - Component ศูนย์กลางของระบบหลังบ้าน (dashboard) ทุก role
// ทำหน้าที่ตรวจสอบ token, role, และ routing ตามสิทธิ์
// ถ้า token หมดอายุ/ไม่ถูกต้อง → redirect ไป login
// ถ้า path เป็น /dashboard ตรงๆ → redirect ไปหน้า dashboard ตาม role (admin, student, supervisor)
// ถ้า token และ role ถูกต้อง → ครอบด้วย Layout และ render <Outlet /> เพื่อแสดงหน้าลูกในระบบ dashboard

import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";

// ฟังก์ชันตรวจสอบว่า JWT token หมดอายุหรือไม่
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  } catch {
    return true;
  }
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const location = useLocation();

  // ตรวจสอบ token: ถ้าไม่มีหรือหมดอายุ จะ logout และ redirect ไปหน้าหลัก
  if (!token || isTokenExpired(token)) {
    alert("Session หมดอายุ โปรดเข้าสู่ระบบใหม่");
    logout();
    return <Navigate to="/" />;
  }

  // ดึงข้อมูล payload จาก token เพื่อตรวจสอบ role
  let payload = {};
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token payload:", e);
    logout();
    return <Navigate to="/" />;
  }

  const role = payload?.role;

  // ถ้า role ไม่ถูกต้อง จะแสดง error
  if (!["admin", "student", "supervisor"].includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <p className="text-red-600 text-lg font-semibold">
          🚫 ไม่พบสิทธิ์การเข้าถึง (Invalid Role)
        </p>
      </div>
    );
  }

  // ถ้า path เป็น /dashboard ให้ redirect ไปหน้าหลักตาม role
  if (location.pathname === "/dashboard") {
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  // ถ้าเงื่อนไขทุกอย่างถูกต้อง จะแสดง Layout พร้อม Outlet (child routes)
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
