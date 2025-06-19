// Layout.jsx: โครงร่างหลักของหน้าทั้งระบบ (หน้า Dashboard หลัก)
// ใส่ Sidebar (เมนูซ้าย), Navbar (แถบบน), และวาง children ไว้ตรงกลาง

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { token } = useAuth();
  if (!token) return null; // ถ้าไม่มี token (ยังไม่ได้ล็อกอิน) จะไม่ render อะไรเลย

  // ====== ดึง role จาก JWT token (decode) ======
  let role = "guest";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    role = payload?.role || "guest";
  } catch {
    role = "guest";
  }

  return (
    <div className="flex bg-[#F3F4F6] text-gray-800 min-h-screen">
      {/* ===== Sidebar (ซ้ายมือ, ติดขอบ, ยึดจอ, ส่ง role ไปแสดงเมนูตามสิทธิ์) ===== */}
      <aside className="w-64 bg-white shadow-lg z-10 fixed h-full">
        <Sidebar role={role} />
      </aside>

      {/* ===== ส่วนเนื้อหาหลัก (Main content) ===== */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* ===== Navbar (บนสุด) ===== */}
        <header className="sticky top-0 z-20 bg-white shadow-md">
          <Navbar />
        </header>

        {/* ===== children: เนื้อหาหลักของแต่ละหน้า ===== */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
