// ManagePrograms.jsx: หน้า Admin สำหรับ "จัดการโปรแกรมฝึกงาน" (CRUD + ค้นหา/กรอง/Sort + Import/Export CSV)
// ใช้ Tailwind CSS + UI Kit + มี Toast แจ้งเตือน/Modal แก้ไข/ลบ และตารางข้อมูล

import { useEffect, useState, useRef } from "react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaUserTie,
  FaAlignLeft,
  FaToggleOn,
  FaSearch,
  FaDownload,
  FaSortUp,
  FaSortDown,
  FaUpload,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import axios from "../../api/axiosInstance";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

// ===== เพิ่ม Loader และ react-hot-toast =====
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// Badge สีสำหรับ Status
const statusColors = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};

// ===== ฟังก์ชัน Pagination =====
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

export default function ManagePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [newProgram, setNewProgram] = useState({
    program_name: "",
    start_date: "",
    end_date: "",
    supervisor_id: "",
    details: "",
    status: "active",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fileInputRef = useRef(null);

  // ==== Pagination State ====
  const [programsPerPage, setProgramsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==== โหลดข้อมูลโปรแกรมฝึกงานและ supervisor ====
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/internship_programs");
      setPrograms(res.data);
    } catch {
      toast.error("โหลดโปรแกรมฝึกงานล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data.filter((u) => u.role === "supervisor"));
    } catch {
      toast.error("โหลดข้อมูลผู้ดูแลล้มเหลว");
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSupervisors();
  }, []);

  // ==== ฟังก์ชัน Modal เพิ่ม/แก้ไข ====
  const openAddModal = () => {
    setEditingProgramId(null);
    setNewProgram({
      program_name: "",
      start_date: "",
      end_date: "",
      supervisor_id: "",
      details: "",
      status: "active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (program) => {
    setEditingProgramId(program.program_id);
    setNewProgram({
      program_name: program.program_name || "",
      start_date: program.start_date?.slice(0, 10) || "",
      end_date: program.end_date?.slice(0, 10) || "",
      supervisor_id: program.supervisor_id || "",
      details: program.details || "",
      status: program.status || "active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ==== Validate ฟอร์ม ====
  const validateForm = () => {
    if (!newProgram.program_name.trim()) return "กรุณากรอกชื่อโปรแกรม";
    if (!newProgram.supervisor_id) return "กรุณาเลือกผู้ดูแล";
    return "";
  };

  // ==== เพิ่ม/แก้ไขข้อมูล (Save) ====
  const handleSaveProgram = async () => {
    setFormError("");
    const msg = validateForm();
    if (msg) return setFormError(msg);

    try {
      setLoading(true);
      if (editingProgramId) {
        await axios.put(`/internship_programs/${editingProgramId}`, newProgram);
        toast.success("แก้ไขโปรแกรมสำเร็จ");
      } else {
        await axios.post("/internship_programs", newProgram);
        toast.success("เพิ่มโปรแกรมสำเร็จ");
      }
      closeModal();
      fetchPrograms();
    } catch {
      toast.error("บันทึกโปรแกรมล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  // ==== ลบข้อมูล ====
  const handleDelete = async (id) => {
    if (!window.confirm("แน่ใจว่าต้องการลบโปรแกรมนี้?")) return;
    try {
      setLoading(true);
      await axios.delete(`/internship_programs/${id}`);
      toast.success("ลบโปรแกรมสำเร็จ");
      fetchPrograms();
    } catch {
      toast.error("ลบโปรแกรมล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  // ==== ฟิลเตอร์และ Sort ตาราง ====
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase();
    const bVal = b[sortConfig.key]?.toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // ==== Pagination Logic ====
  const totalPages = Math.ceil(sortedPrograms.length / programsPerPage);
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = sortedPrograms.slice(indexOfFirstProgram, indexOfLastProgram);
  const showFrom = sortedPrograms.length === 0 ? 0 : indexOfFirstProgram + 1;
  const showTo = indexOfLastProgram > sortedPrograms.length ? sortedPrograms.length : indexOfLastProgram;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortConfig.key, sortConfig.direction, programsPerPage, programs.length]);

  // ==== Pagination UI ====
  const renderPagination = () => {
    const pages = getPagination(currentPage, totalPages, 1);
    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
        <div className="flex items-center text-sm text-gray-700 mb-2 md:mb-0">
          <span>
            แสดง {showFrom} ถึง {showTo} จาก {sortedPrograms.length} รายการ&nbsp;
          </span>
          <label className="ml-2">แสดง:&nbsp;</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={programsPerPage}
            onChange={e => setProgramsPerPage(Number(e.target.value))}
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

  // ==== ฟังก์ชัน Import CSV ====
  const handleFileChange = async (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ CSV เท่านั้น");
      e.target.value = "";
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("/internship_programs/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("นำเข้า CSV สำเร็จ");
      fetchPrograms();
      e.target.value = "";
    } catch {
      toast.error("นำเข้า CSV ล้มเหลว");
      e.target.value = "";
    } finally {
      setLoading(false);
    }
  };

  // ==== Render UI หลัก ====
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* หัวข้อ */}
      <h2 className="text-xl font-bold mb-4 text-[#7C3AED] flex items-center space-x-2">
        <FaClipboardList />
        <span>จัดการโปรแกรมฝึกงาน</span>
      </h2>

      {/* ช่องค้นหา + ฟิลเตอร์สถานะ */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาโปรแกรม..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ปุ่มเพิ่ม + Import/Export CSV */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAddModal}>+ เพิ่มโปรแกรมใหม่</Button>
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
            data={sortedPrograms}
            filename="programs.csv"
            className="text-sm text-[#7C3AED] hover:underline flex items-center gap-2"
          >
            <FaDownload /> Export CSV
          </CSVLink>
        </div>
      </div>

      {/* ตารางโปรแกรมฝึกงาน */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <table className="w-full border text-sm shadow rounded-md overflow-hidden">
            <thead className="bg-[#E0E7FF] text-[#1E40AF]">
              <tr>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => toggleSort("program_name")}>
                  ชื่อโปรแกรม {renderSortIcon("program_name")}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => toggleSort("start_date")}>
                  วันที่เริ่ม {renderSortIcon("start_date")}
                </th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => toggleSort("end_date")}>
                  วันที่สิ้นสุด {renderSortIcon("end_date")}
                </th>
                <th className="border px-3 py-2">ผู้ดูแล</th>
                <th className="border px-3 py-2">รายละเอียด</th>
                <th className="border px-3 py-2 cursor-pointer" onClick={() => toggleSort("status")}>
                  สถานะ {renderSortIcon("status")}
                </th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPrograms.map((p) => (
                <tr key={p.program_id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{p.program_name}</td>
                  <td className="border px-3 py-2">{p.start_date?.slice(0, 10)}</td>
                  <td className="border px-3 py-2">{p.end_date?.slice(0, 10)}</td>
                  <td className="border px-3 py-2">{p.supervisor_username || "-"}</td>
                  <td className="border px-3 py-2">{p.details}</td>
                  <td className="border px-3 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        statusColors[p.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="border px-3 py-2 space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                      title="แก้ไข"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(p.program_id)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                      title="ลบ"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentPrograms.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    ไม่พบข้อมูลโปรแกรมฝึกงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {renderPagination()}
        </>
      )}

      {/* Modal เพิ่ม/แก้ไขโปรแกรม */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <h3 className="text-lg font-semibold mb-4">
            {editingProgramId ? "✏️ แก้ไขโปรแกรม" : "➕ เพิ่มโปรแกรมใหม่"}
          </h3>
          {formError && <p className="text-red-600 mb-3">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input
              icon={<FaClipboardList />}
              placeholder="ชื่อโปรแกรม"
              value={newProgram.program_name}
              onChange={(e) =>
                setNewProgram({ ...newProgram, program_name: e.target.value })
              }
            />
            <Input
              icon={<FaCalendarAlt />}
              type="date"
              placeholder="วันที่เริ่ม"
              value={newProgram.start_date}
              onChange={(e) =>
                setNewProgram({ ...newProgram, start_date: e.target.value })
              }
            />
            <Input
              icon={<FaCalendarAlt />}
              type="date"
              placeholder="วันที่สิ้นสุด"
              value={newProgram.end_date}
              onChange={(e) =>
                setNewProgram({ ...newProgram, end_date: e.target.value })
              }
            />
            <Select
              value={newProgram.supervisor_id}
              onChange={(e) =>
                setNewProgram({ ...newProgram, supervisor_id: e.target.value })
              }
              options={[
                { label: "-- เลือกผู้ดูแล --", value: "" },
                ...users.map((u) => ({ label: u.username, value: u.user_id })),
              ]}
            />
            <Textarea
              icon={<FaAlignLeft />}
              placeholder="รายละเอียด"
              value={newProgram.details}
              onChange={(e) =>
                setNewProgram({ ...newProgram, details: e.target.value })
              }
              className="col-span-2"
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <Button onClick={handleSaveProgram}>
              {editingProgramId ? "บันทึกการแก้ไข" : "เพิ่มโปรแกรม"}
            </Button>
            <Button
              onClick={closeModal}
              className="bg-gray-400 hover:bg-gray-500"
            >
              ยกเลิก
            </Button>
          </div>
        </Modal>
      )}
      {loading && <Loader />}
    </div>
  );
}
