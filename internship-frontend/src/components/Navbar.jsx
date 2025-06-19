import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { FaUserCog, FaSignOutAlt } from "react-icons/fa"; // ใช้ไอคอนที่เกี่ยวข้องกับการออกจากระบบ
import Button from "./ui/Button";

export default function Navbar({ hideActions = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ฟังก์ชันออกจากระบบ: logout แล้ว redirect ไปหน้าแรก
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white text-gray-800 px-6 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
      {/* โลโก้/ชื่อระบบ */}
      <h1 className="text-lg font-semibold flex items-center gap-2 text-[#7C3AED]">
        <FaUserCog className="text-xl" />
        <span>Internship 🌱</span>
      </h1>

      {/* เมนูฝั่งขวา: เปลี่ยนรหัสผ่าน + ออกจากระบบ (ซ่อนได้ถ้า hideActions=true) */}
      {!hideActions && (
        <div className="flex items-center gap-4">
          <Link
            to="/change-password"
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            เปลี่ยนรหัสผ่าน
          </Link>
          <Button onClick={handleLogout} className="flex items-center gap-2 text-sm px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            <FiLogOut size={18} />
            ออกจากระบบ
          </Button>
        </div>
      )}
    </nav>
  );
}
