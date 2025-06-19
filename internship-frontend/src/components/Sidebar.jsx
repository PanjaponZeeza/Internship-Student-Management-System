import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaLayerGroup,
  FaUserShield,
  FaChalkboardTeacher, // ไอคอนที่สอดคล้องกับการศึกษา
} from "react-icons/fa";

export default function Sidebar({ role }) {
  const location = useLocation();

  // NavItem: สร้างเมนูแต่ละอัน พร้อมเปลี่ยนสีถ้าอยู่หน้าปัจจุบัน
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
        location.pathname === to
          ? "bg-[#EDE9FE] text-[#7C3AED] font-semibold"  // ไฮไลท์เมนูที่เลือกอยู่
          : "text-gray-700 hover:bg-[#F3F4F6]"
      }`}
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="bg-white shadow-lg w-64 h-screen p-6 fixed top-0 left-0 z-50 flex flex-col">
      {/* ใช้ไอคอนแทนโลโก้ */}
      <div className="flex items-center mb-8">
        <FaChalkboardTeacher className="w-10 h-10 text-[#7C3AED] mr-3" />
        <span className="text-2xl font-bold text-[#7C3AED]">Internship</span>
      </div>

      {/* รายการเมนู */}
      <nav className="flex flex-col gap-2">
        <NavItem to="/dashboard" icon={FaHome} label="Dashboard" />

        {/* แสดงเมนูสำหรับ admin */}
        {role === "admin" && (
          <>
            <NavItem
              to="/dashboard/admin/manage-users"
              icon={FaUsers}
              label="จัดการผู้ใช้"
            />
            <NavItem
              to="/dashboard/admin/manage-students"
              icon={FaUserGraduate}
              label="จัดการนักศึกษา"
            />
            <NavItem
              to="/dashboard/admin/manage-programs"
              icon={FaLayerGroup}
              label="โปรแกรมฝึกงาน"
            />
          </>
        )}

        {/* แสดงเมนูสำหรับ supervisor */}
        {role === "supervisor" && (
          <NavItem
            to="/dashboard"
            icon={FaUserShield}
            label="ดูแลนักศึกษา"
          />
        )}
      </nav>
    </div>
  );
}
