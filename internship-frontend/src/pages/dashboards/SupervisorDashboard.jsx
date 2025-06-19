import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaCommentDots, FaSearch } from "react-icons/fa";
import axios from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// สี Badge สำหรับสถานะ
const statusBadge = {
  "กำลังฝึก": "bg-blue-100 text-blue-700 border-blue-300",
  "เสร็จสิ้น": "bg-green-100 text-green-700 border-green-300",
  "ยกเลิก": "bg-red-100 text-red-700 border-red-300",
};

// Pagination helper เหมือน ManageStudents.jsx
function getPagination(currentPage, totalPages, siblings = 1) {
  const pages = [];
  const range = (start, end) => {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };
  if (totalPages <= 7) return range(1, totalPages);
  const left = Math.max(currentPage - siblings, 2);
  const right = Math.min(currentPage + siblings, totalPages - 1);
  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages.filter((item, idx, arr) => item !== arr[idx - 1]);
}

export default function SupervisorDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ดึงข้อมูล
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/supervisor/students");
      setStudents(res.data);
      setError("");
    } catch {
      setError("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackForStudent = async (student_id) => {
    try {
      const res = await axios.get(`/feedback?student_id=${student_id}`);
      if (res.data.length > 0) {
        const fb = res.data[0];
        setEditingFeedback(fb);
        setFeedbackText(fb.feedback);
        setRating(fb.rating);
      } else {
        setEditingFeedback(null);
        setFeedbackText("");
        setRating(5);
      }
    } catch {
      alert("โหลด feedback ล้มเหลว");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openFeedbackModal = (student) => {
    setSelectedStudent(student);
    fetchFeedbackForStudent(student.student_id);
  };

  const handleFeedbackSubmit = async () => {
    try {
      if (editingFeedback) {
        await axios.put(`/feedback/${editingFeedback.feedback_id}`, {
          feedback: feedbackText,
          rating,
          feedback_date: new Date().toISOString().slice(0, 10),
        });
        toast.success("แก้ไขความคิดเห็นสำเร็จ");
      } else {
        await axios.post("/feedback", {
          student_id: selectedStudent.student_id,
          feedback: feedbackText,
          rating,
          feedback_date: new Date().toISOString().slice(0, 10),
        });
        toast.success("ส่งความคิดเห็นสำเร็จ");
      }
      resetModal();
      fetchStudents();
    } catch {
      toast.error("บันทึกความคิดเห็นล้มเหลว");
    }
  };

  const handleDeleteFeedback = async () => {
    if (!editingFeedback) return;
    if (!window.confirm("ต้องการลบความคิดเห็นนี้หรือไม่?")) return;
    try {
      await axios.delete(`/feedback/${editingFeedback.feedback_id}`);
      toast.success("ลบความคิดเห็นสำเร็จ");
      resetModal();
      fetchStudents();
    } catch {
      toast.error("ลบความคิดเห็นล้มเหลว");
    }
  };

  const resetModal = () => {
    setSelectedStudent(null);
    setEditingFeedback(null);
    setFeedbackText("");
    setRating(5);
  };

  // filter + search
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (s.program_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const showFrom = filteredStudents.length === 0 ? 0 : indexOfFirst + 1;
  const showTo = indexOfLast > filteredStudents.length ? filteredStudents.length : indexOfLast;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, studentsPerPage, students.length]);

  // Pagination UI
  const renderPagination = () => {
    const pages = getPagination(currentPage, totalPages, 1);
    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
        <div className="flex items-center text-sm text-gray-700 mb-2 md:mb-0">
          <span>
            แสดง {showFrom} ถึง {showTo} จาก {filteredStudents.length} รายการ&nbsp;
          </span>
          <label className="ml-2">แสดง:&nbsp;</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={studentsPerPage}
            onChange={e => setStudentsPerPage(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="ml-1">รายการ</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className={`px-3 py-1 rounded border ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-purple-100 text-purple-600"}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >{"<"}</button>
          {pages.map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-purple-500">...</span>
            ) : (
              <button
                key={`page-${page}`}
                className={`px-3 py-1 rounded border
                  ${currentPage === page
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-gray-100 hover:bg-purple-100 text-purple-600"}`}
                onClick={() => setCurrentPage(page)}
                disabled={currentPage === page}
              >{page}</button>
            )
          )}
          <button
            className={`px-3 py-1 rounded border ${currentPage === totalPages || totalPages === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-purple-100 text-purple-600"}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >{">"}</button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-[#7C3AED] mb-6 border-b border-[#C4B5FD] pb-3">
        🧑‍🏫 Supervisor Dashboard
      </h1>

      {/* Search & filter */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อนักศึกษา หรือชื่อโปรแกรม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-full focus:ring-[#7C3AED] focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded focus:ring-[#7C3AED] focus:outline-none"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="กำลังฝึก">กำลังฝึก</option>
          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
          <option value="ยกเลิก">ยกเลิก</option>
        </select>
      </div>

      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center my-10">
          <Loader />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-[#E0E7FF] text-[#1E40AF]">
                <tr>
                  <th className="px-4 py-3 text-left">ชื่อ</th>
                  <th className="px-4 py-3 text-left">โปรแกรม</th>
                  <th className="px-4 py-3 text-left">ปี</th>
                  <th className="px-4 py-3 text-left">สถานะ</th>
                  <th className="px-4 py-3 text-left">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s) => (
                  <tr
                    key={`${s.student_id}-${s.feedback_id || "nofb"}`}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{s.first_name} {s.last_name}</td>
                    <td className="px-4 py-2">{s.program_name}</td>
                    <td className="px-4 py-2">{s.internship_year}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-3 py-1 rounded-full border font-medium text-xs ${statusBadge[s.status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {s.feedback_id ? (
                        <button
                          className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 font-medium px-3 py-1 rounded-full hover:bg-orange-100 border border-orange-300 transition"
                          onClick={() => openFeedbackModal(s)}
                        >
                          <FaEdit className="text-base" /> แก้ไข
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 font-medium px-3 py-1 rounded-full hover:bg-purple-200 border border-purple-300 transition"
                          onClick={() => openFeedbackModal(s)}
                        >
                          <FaCommentDots className="text-base" /> ให้ความคิดเห็น
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-4">
                      ไม่พบข้อมูลนักศึกษา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}

      {/* Modal สำหรับ feedback */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingFeedback ? "แก้ไขความคิดเห็น" : "ให้ความคิดเห็น"} แก่: {selectedStudent.first_name} {selectedStudent.last_name}
            </h2>
            <label className="block mb-1 text-sm font-medium text-gray-700">คะแนน (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={isNaN(rating) ? 1 : rating}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setRating(isNaN(val) ? 1 : val);
              }}
              className="border border-gray-300 px-3 py-2 rounded w-24 mb-4 focus:ring-2 focus:ring-[#7C3AED] outline-none transition"
            />
            <label className="block mb-1 text-sm font-medium text-gray-700">ความคิดเห็น</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded w-full mb-6 resize-y max-h-40 focus:ring-2 focus:ring-[#7C3AED] outline-none transition"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleFeedbackSubmit}
                className="bg-[#7C3AED] text-white px-5 py-2 rounded hover:bg-[#5B21B6] transition"
              >
                บันทึก
              </button>
              {editingFeedback && (
                <button
                  onClick={handleDeleteFeedback}
                  className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
                >
                  ลบ
                </button>
              )}
              <button
                onClick={resetModal}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
