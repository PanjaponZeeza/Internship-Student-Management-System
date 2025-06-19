// AdminDashboard.jsx - หน้าหลัก Dashboard สำหรับผู้ดูแลระบบ (Admin)
// ทำหน้าที่เป็น Container/Wrapper เพื่อให้ <Outlet /> แสดงหน้าลูก (child routes) เช่น AdminOverview, ManageUsers ฯลฯ
// ใส่ padding และขยายเต็มพื้นที่ main layout

import { Outlet } from "react-router-dom";

// ===== เพิ่ม Toast & Loader =====
import { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  return (
    <div className="p-6 w-full">
      {/* เพิ่ม Toaster สำหรับการแจ้งเตือน */}
      <Toaster position="top-center" />
      
      <Outlet />
    </div>
  );
}

// ไฟล์ถัดไปที่แนะนำให้เพิ่ม Toast & Loader คือ: ManageUsers.jsx
