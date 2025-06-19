// App.jsx — กำหนด Routing หลักของแอปฯ ระบบฝึกงานด้วย React Router พร้อมป้องกันหน้าที่ต้องล็อกอิน

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboards/Dashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import SupervisorDashboard from "./pages/dashboards/SupervisorDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageStudents from "./pages/admin/ManageStudents";
import ManagePrograms from "./pages/admin/ManagePrograms";
import ChangePassword from "./pages/profile/ChangePassword";
import { AuthProvider, useAuth } from "./context/AuthContext";

// 🔔 Toast
import { Toaster } from 'react-hot-toast';

// PrivateRoute ป้องกัน route ที่ต้องล็อกอิน (เช็ค token)
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      {/* เพิ่ม Toaster ตรงนี้ ใช้ได้ทุกหน้าทันที */}
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* 🔒 หน้าแรก = Login (ไม่มี Register) */}
          <Route path="/" element={<Login />} />

          {/* ✅ Dashboard (เป็น Layout หลัก) มี Outlet สำหรับ route ย่อยของแต่ละ role */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/* 👇 Routing ย่อยแสดงผ่าน <Outlet /> ใน Dashboard.jsx */}
            {/* Student Dashboard */}
            <Route path="student" element={<StudentDashboard />} />
            {/* Supervisor Dashboard */}
            <Route path="supervisor" element={<SupervisorDashboard />} />
            {/* Admin Overview (หน้าหลัก admin) */}
            <Route path="admin" element={<AdminOverview />} />
            {/* Admin จัดการผู้ใช้ */}
            <Route path="admin/manage-users" element={<ManageUsers />} />
            {/* Admin จัดการนักศึกษา */}
            <Route path="admin/manage-students" element={<ManageStudents />} />
            {/* Admin จัดการโปรแกรมฝึกงาน */}
            <Route path="admin/manage-programs" element={<ManagePrograms />} />
          </Route>

          {/* ✅ Route เปลี่ยนรหัสผ่าน (ทุก role ใช้ path นี้ร่วมกัน) */}
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
