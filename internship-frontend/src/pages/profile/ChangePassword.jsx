import { useState } from "react";
import axios from "../../api/axiosInstance";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  FaLock,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ฟังก์ชัน submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccess(res.data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setLoading(false);
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        "เกิดข้อผิดพลาด"
      );
      setLoading(false);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ede9fe] to-[#f3f4f6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#e0e7ff]">
        <div className="flex flex-col items-center gap-2 mb-4">
          <FaLock className="text-4xl text-[#7C3AED]" />
          <h2 className="text-2xl font-semibold text-[#7C3AED] tracking-tight">เปลี่ยนรหัสผ่าน</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 justify-center mb-4 text-red-600 text-sm">
            <FaTimesCircle className="text-base" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 justify-center mb-4 text-green-600 text-sm">
            <FaCheckCircle className="text-base" />
            {success}
          </div>
        )}

        {loading && <Loader />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="password"
            placeholder="รหัสผ่านเก่า"
            icon={<FaKey className="text-[#7C3AED]" />}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
            icon={<FaLock className="text-[#16A34A]" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />

          <Input
            type="password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            icon={<FaLock className="text-[#F59E42]" />}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            minLength={6}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] transition"
            >
              บันทึกรหัสผ่านใหม่
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
