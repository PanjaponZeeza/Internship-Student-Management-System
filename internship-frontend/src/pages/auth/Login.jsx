import { useState } from "react";
import axios from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaGraduationCap, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { username, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ede9fe] to-[#f3f4f6] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-[#e0e7ff] flex flex-col items-center gap-3"
      >
        {/* โลโก้/ไอคอนกล่องบน (กลับมาใช้ FaGraduationCap) */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow mb-3">
          <FaGraduationCap className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-semibold text-[#7C3AED] mb-2 tracking-tight">เข้าสู่ระบบ</h2>
        <p className="mb-4 text-gray-400 text-sm">ระบบเก็บข้อมูลนักศึกษาฝึกงาน</p>

        {error && (
          <p className="text-red-600 text-sm mb-2 text-center w-full">{error}</p>
        )}

        <div className="mb-3 w-full relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C3AED] outline-none transition text-sm bg-[#F8FAFC]"
            placeholder="ชื่อผู้ใช้"
            required
            autoFocus
          />
        </div>

        <div className="mb-5 w-full relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C3AED] outline-none transition text-sm bg-[#F8FAFC]"
            placeholder="รหัสผ่าน"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white py-2 rounded-lg font-semibold shadow-sm transition"
        >
          <span className="inline-flex items-center gap-2 justify-center">
            <FaSignInAlt className="text-base" />
            เข้าสู่ระบบ
          </span>
        </button>
      </form>
    </div>
  );
}
