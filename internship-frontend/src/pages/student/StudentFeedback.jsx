// StudentFeedback.jsx — แสดงผลความคิดเห็นและคะแนนจากผู้ดูแลของนักศึกษาคนปัจจุบัน (ใช้ในหน้า Student Dashboard)

import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { FaRegStickyNote } from "react-icons/fa";

// ===== เพิ่ม Loader และ react-hot-toast =====
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

export default function StudentFeedback() {
  // State สำหรับเก็บข้อมูล feedback, สถานะโหลด และ error
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // ฟังก์ชันโหลดข้อมูล feedback ของนักศึกษาคนปัจจุบัน
    const fetchFeedback = async () => {
      try {
        // ดึง student_id ของผู้ใช้ปัจจุบัน
        const studentRes = await axios.get("/students/me");
        const student_id = studentRes.data.student_id;

        // ดึง feedback ที่เกี่ยวข้องกับ student_id นี้
        const feedbackRes = await axios.get(`/feedback?student_id=${student_id}`);
        setFeedbacks(feedbackRes.data);
        setLoading(false);
      } catch (err) {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
        setError("ไม่สามารถโหลดข้อมูลได้");
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-[#7C3AED] mb-4 flex items-center gap-2">
        <FaRegStickyNote className="text-lg" />
        ข้อเสนอแนะจากผู้ดูแล
      </h2>

      {/* กรณีข้อมูลกำลังโหลด, เกิด error, ไม่มีข้อมูล, หรือแสดงรายการ feedback */}
      {loading ? (
        <p className="text-center text-[#7C3AED] font-medium">⏳ กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-center text-red-600 font-medium">{error}</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-500 font-normal">ยังไม่มีความคิดเห็น</p>
      ) : (
        <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {feedbacks.map((f) => (
            <li
              key={f.feedback_id}
              className="bg-[#F9FAFB] border border-gray-100 p-4 rounded-xl shadow-sm"
            >
              <p className="text-gray-800 leading-relaxed">{f.feedback}</p>
              <p className="text-sm text-gray-500 mt-2">
                ⭐ คะแนน: <span className="font-medium text-[#4F46E5]">{f.rating}</span> / 5 | 📅{" "}
                วันที่: {f.feedback_date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ไฟล์ถัดไปที่แนะนำให้เพิ่ม Toast & Loader คือ: AdminOverview.jsx
