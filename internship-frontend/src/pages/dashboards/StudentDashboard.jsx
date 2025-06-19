// ไฟล์นี้ใช้สำหรับแสดงหน้าหลักนักศึกษาฝึกงาน (Student Dashboard)
// โชว์ข้อมูลส่วนตัว เช่น ชื่อ-นามสกุล สาขา โปรแกรมฝึกงาน ปีฝึกงาน และปุ่มดู/ซ่อนความคิดเห็นจากผู้ดูแล (Feedback)

import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import StudentFeedback from "../student/StudentFeedback";
import {
  FaUserGraduate,
  FaBuilding,
  FaClipboardList,
  FaInfoCircle,
  FaCalendarAlt,
  FaCommentDots,
} from "react-icons/fa";

// ===== เพิ่ม Loader และ react-hot-toast =====
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  // state สำหรับเก็บข้อมูลนักศึกษา
  const [student, setStudent] = useState(null);
  // state สำหรับ error message
  // const [error, setError] = useState("");
  // state สำหรับแสดง spinner ระหว่างโหลดข้อมูล
  const [loading, setLoading] = useState(true);
  // state สำหรับควบคุมการโชว์/ซ่อน feedback
  const [showFeedback, setShowFeedback] = useState(false);

  // โหลดข้อมูลเมื่อนำ component นี้มาใช้ (แค่ครั้งแรก)
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // เรียก API เพื่อดึงข้อมูลของนักศึกษาคนที่ล็อกอิน
        const res = await axios.get("/students/me");
        setStudent(res.data); // เซตข้อมูลนักศึกษา
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลนักศึกษาได้");
        // setError("ไม่สามารถโหลดข้อมูลนักศึกษาได้");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* หัวข้อหน้า */}
        <h1 className="text-2xl font-semibold text-[#7C3AED] mb-6 border-b border-[#C4B5FD] pb-3 flex items-center gap-2">
          <FaUserGraduate /> หน้าหลักนักศึกษา
        </h1>

        {/* ถ้ายังโหลดข้อมูล แสดง Loader */}
        {loading ? (
          <div className="flex justify-center my-10">
            <Loader />
          </div>
        ) : !student ? (
          // ถ้าโหลด error
          <p className="text-center text-red-600 font-medium">
            ไม่สามารถโหลดข้อมูลนักศึกษาได้
          </p>
        ) : (
          // แสดงข้อมูลนักศึกษาเมื่อโหลดสำเร็จ
          <>
            <div className="bg-white shadow-md rounded-2xl p-6 mb-8 border border-gray-200 transition hover:shadow-lg">
              <p className="mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-[#6366F1]" />
                <span className="font-medium">ชื่อ-นามสกุล:</span>{" "}
                {student.first_name} {student.last_name}
              </p>
              <p className="mb-3 flex items-center gap-2">
                <FaBuilding className="text-[#6366F1]" />
                <span className="font-medium">สาขา:</span> {student.department}
              </p>
              <p className="mb-3 flex items-center gap-2">
                <FaClipboardList className="text-[#6366F1]" />
                <span className="font-medium">โปรแกรมฝึกงาน:</span>{" "}
                {student.program_name || "ไม่มีข้อมูล"}
              </p>
              <p className="mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-[#6366F1]" />
                <span className="font-medium">สถานะ:</span> {student.status}
              </p>
              <p className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#6366F1]" />
                <span className="font-medium">ปีฝึกงาน:</span>{" "}
                {student.internship_year}
              </p>
            </div>

            {/* ปุ่ม toggle ดู/ซ่อนความคิดเห็นจากผู้ดูแล */}
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-medium px-6 py-2 rounded-xl shadow hover:bg-[#5B21B6] transition"
            >
              <FaCommentDots />
              {showFeedback
                ? "ซ่อนความคิดเห็นจากผู้ดูแล"
                : "ดูความคิดเห็นจากผู้ดูแล"}
            </button>

            {/* หากกดดู feedback จะแสดงคอมโพเนนต์ StudentFeedback */}
            {showFeedback && (
              <div className="mt-6">
                <StudentFeedback />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ไฟล์ถัดไปที่แนะนำให้เพิ่ม Toast & Loader คือ: SupervisorDashboard.jsx
