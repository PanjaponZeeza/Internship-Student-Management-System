import { useEffect, useState, useRef } from "react";
import {
  FaUser,
  FaUniversity,
  FaBuilding,
  FaGraduationCap,
  FaCalendarAlt,
  FaDownload,
  FaSortUp,
  FaSortDown,
  FaUpload,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import axios from "../../api/axiosInstance";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

// ===== เพิ่ม Loader และ react-hot-toast =====
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// สีสำหรับสถานะ
const statusBadge = {
  "กำลังฝึก": "bg-blue-100 text-blue-700",
  "เสร็จสิ้น": "bg-green-100 text-green-700",
  "ยกเลิก": "bg-red-100 text-red-700",
};

// ===== เพิ่มฟังก์ชัน Pagination =====
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

export default function ManageStudents() {
  // ==== State หลักของหน้า ====
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    university: "",
    department: "",
    internship_department: "",
    internship_year: new Date().getFullYear(),
    status: "กำลังฝึก",
    user_id: "",
    program_id: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // ==== Pagination State ====
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==== fetch/CRUD/Import CSV (เหมือนเดิม) ====
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/students");
      setStudents(res.data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดนักศึกษา");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data.filter((u) => u.role === "student"));
    } catch {
      toast.error("โหลดข้อมูลผู้ใช้ล้มเหลว");
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("/internship_programs");
      setPrograms(res.data);
    } catch {
      toast.error("โหลดโปรแกรมฝึกงานล้มเหลว");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchUsers();
    fetchPrograms();
  }, []);

  const openAddModal = () => {
    setEditingStudentId(null);
    setNewStudent({
      first_name: "",
      last_name: "",
      university: "",
      department: "",
      internship_department: "",
      internship_year: new Date().getFullYear(),
      status: "กำลังฝึก",
      user_id: "",
      program_id: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudentId(student.student_id);
    setNewStudent({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      university: student.university || "",
      department: student.department || "",
      internship_department: student.internship_department || "",
      internship_year: student.internship_year || new Date().getFullYear(),
      status: student.status || "กำลังฝึก",
      user_id: student.user_id || "",
      program_id: student.program_id || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const validateForm = () => {
    if (!newStudent.first_name.trim() || !newStudent.last_name.trim())
      return "กรุณากรอกชื่อและนามสกุล";
    if (!newStudent.user_id) return "กรุณาเลือก User";
    if (!newStudent.program_id) return "กรุณาเลือกโปรแกรมฝึกงาน";
    return "";
  };

  const handleSaveStudent = async () => {
    setFormError("");
    const msg = validateForm();
    if (msg) return setFormError(msg);

    try {
      setLoading(true);
      if (editingStudentId) {
        await axios.put(`/students/${editingStudentId}`, newStudent);
        toast.success("แก้ไขนักศึกษาสำเร็จ");
      } else {
        await axios.post("/students", [newStudent]);
        toast.success("เพิ่มนักศึกษาสำเร็จ");
      }
      closeModal();
      fetchStudents();
    } catch {
      toast.error("บันทึกข้อมูลนักศึกษาล้มเหลว");
      setFormError("บันทึกข้อมูลนักศึกษาล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจว่าต้องการลบนักศึกษานี้?")) return;
    try {
      setLoading(true);
      await axios.delete(`/students/${id}`);
      toast.success("ลบนักศึกษาสำเร็จ");
      fetchStudents();
    } catch {
      toast.error("ลบนักศึกษาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ฟิลเตอร์ + Sort ตาราง
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase();
    const bVal = b[sortConfig.key]?.toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // ==== Pagination Logic ====
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const showFrom = sortedStudents.length === 0 ? 0 : indexOfFirstStudent + 1;
  const showTo = indexOfLastStudent > sortedStudents.length ? sortedStudents.length : indexOfLastStudent;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortConfig.key, sortConfig.direction, studentsPerPage, students.length]);

  // ==== Pagination UI ====
  const renderPagination = () => {
    const pages = getPagination(currentPage, totalPages, 1);
    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
        <div className="flex items-center text-sm text-gray-700 mb-2 md:mb-0">
          <span>
            แสดง {showFrom} ถึง {showTo} จาก {sortedStudents.length} รายการ&nbsp;
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

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // ==== Import CSV ====
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const parsed = parseCSV(text);
        if (!parsed.length) {
          toast.error("ไฟล์ CSV ไม่มีข้อมูลหรือรูปแบบไม่ถูกต้อง");
          setLoading(false);
          return;
        }

        const requiredFields = [
          "first_name",
          "last_name",
          "university",
          "department",
          "internship_department",
          "internship_year",
          "status",
          "user_id",
          "program_id",
        ];
        for (const row of parsed) {
          for (const field of requiredFields) {
            if (!(field in row)) {
              toast.error(`ข้อมูล CSV ขาดคอลัมน์ '${field}'`);
              setLoading(false);
              return;
            }
          }
        }

        await axios.post("/students", parsed);
        toast.success("นำเข้านักศึกษาสำเร็จ");
        fetchStudents();
      } catch (error) {
        toast.error(`นำเข้า CSV ล้มเหลว: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1);
    return rows.map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] ?? "";
      });
      if (obj.internship_year) obj.internship_year = parseInt(obj.internship_year) || new Date().getFullYear();
      return obj;
    });
  };

  // ==== Render UI ====
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-[#7C3AED] flex items-center space-x-2">
        <FaGraduationCap />
        <span>จัดการนักศึกษา</span>
      </h2>

      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อ มหาวิทยาลัย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/3"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/4"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="กำลังฝึก">กำลังฝึก</option>
          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
          <option value="ยกเลิก">ยกเลิก</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAddModal}>+ เพิ่มนักศึกษาใหม่</Button>
        <div className="flex items-center gap-3">
          <label
            htmlFor="importCSVInput"
            className="cursor-pointer text-sm text-[#7C3AED] hover:underline flex items-center gap-2"
            title="Import CSV"
          >
            <FaUpload />
            Import CSV
          </label>
          <input
            type="file"
            id="importCSVInput"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <CSVLink
            data={sortedStudents}
            filename="students.csv"
            className="text-sm text-[#7C3AED] hover:underline flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </CSVLink>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <table className="w-full border text-sm shadow rounded-md overflow-hidden">
            <thead className="bg-[#E0E7FF] text-[#1E40AF]">
              <tr>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("first_name")}>
                  ชื่อ {renderSortIcon("first_name")}
                </th>
                <th className="border px-3 py-2 text-left">มหาวิทยาลัย</th>
                <th className="border px-3 py-2 text-left">แผนก</th>
                <th className="border px-3 py-2 text-left">ปี</th>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort("status")}>
                  สถานะ {renderSortIcon("status")}
                </th>
                <th className="border px-3 py-2 text-left">User</th>
                <th className="border px-3 py-2 text-left">โปรแกรมฝึกงาน</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((s) => (
                <tr key={s.student_id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="border px-3 py-2">{s.university}</td>
                  <td className="border px-3 py-2">{s.internship_department}</td>
                  <td className="border px-3 py-2">{s.internship_year}</td>
                  <td className="border px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="border px-3 py-2">{s.username || "-"}</td>
                  <td className="border px-3 py-2">{s.program_name || "-"}</td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="text-blue-500 hover:text-blue-700"
                      title="แก้ไข"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(s.student_id)}
                      className="text-red-500 hover:text-red-700"
                      title="ลบ"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-4">
                    ไม่พบข้อมูลนักศึกษา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {renderPagination()}
        </>
      )}

      {modalOpen && (
        <Modal onClose={closeModal}>
          <h3 className="text-lg font-semibold mb-4">
            {editingStudentId ? "✏️ แก้ไขนักศึกษา" : "➕ เพิ่มนักศึกษา"}
          </h3>
          {formError && <p className="text-red-600 mb-3">{formError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              icon={<FaUser />}
              placeholder="ชื่อ"
              value={newStudent.first_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, first_name: e.target.value })
              }
            />
            <Input
              icon={<FaUser />}
              placeholder="นามสกุล"
              value={newStudent.last_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, last_name: e.target.value })
              }
            />
            <Input
              icon={<FaUniversity />}
              placeholder="มหาวิทยาลัย"
              value={newStudent.university}
              onChange={(e) =>
                setNewStudent({ ...newStudent, university: e.target.value })
              }
            />
            <Input
              icon={<FaBuilding />}
              placeholder="คณะ / ภาควิชา"
              value={newStudent.department}
              onChange={(e) =>
                setNewStudent({ ...newStudent, department: e.target.value })
              }
            />
            <Input
              icon={<FaBuilding />}
              placeholder="แผนกฝึกงาน"
              value={newStudent.internship_department}
              onChange={(e) =>
                setNewStudent({ ...newStudent, internship_department: e.target.value })
              }
            />
            <Input
              icon={<FaCalendarAlt />}
              type="number"
              placeholder="ปีฝึกงาน"
              value={newStudent.internship_year}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  internship_year: parseInt(e.target.value) || new Date().getFullYear(),
                })
              }
            />
            <Select
              value={newStudent.status}
              onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
              options={["กำลังฝึก", "เสร็จสิ้น", "ยกเลิก"]}
            />
            <Select
              value={newStudent.user_id}
              onChange={(e) => setNewStudent({ ...newStudent, user_id: e.target.value })}
              options={[
                { label: "-- เลือก User --", value: "" },
                ...users
                  .filter((u) => {
                    const isUsed = students.some(
                      (s) => s.user_id === u.user_id && s.student_id !== editingStudentId
                    );
                    return !isUsed || u.user_id === newStudent.user_id;
                  })
                  .map((u) => ({ label: u.username, value: u.user_id })),
              ]}
            />
            <Select
              value={newStudent.program_id}
              onChange={(e) => setNewStudent({ ...newStudent, program_id: e.target.value })}
              options={[
                { label: "-- เลือกโปรแกรม --", value: "" },
                ...programs.map((p) => ({ label: p.program_name, value: p.program_id })),
              ]}
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button onClick={handleSaveStudent}>
              {editingStudentId ? "บันทึกการแก้ไข" : "เพิ่มนักศึกษา"}
            </Button>
            <Button onClick={closeModal} className="bg-gray-400 hover:bg-gray-500">
              ยกเลิก
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
