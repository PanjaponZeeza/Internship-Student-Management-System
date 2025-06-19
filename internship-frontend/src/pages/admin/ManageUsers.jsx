import { useEffect, useState } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserTag,
  FaToggleOn,
  FaEdit,
  FaTrash,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import axios from "../../api/axiosInstance";
import Modal from "../../components/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { CSVLink } from "react-csv";
import Papa from "papaparse";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// สีสำหรับ Status และ Role
const statusColors = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};
const roleColors = {
  admin: "bg-purple-100 text-purple-700",
  supervisor: "bg-blue-100 text-blue-700",
  student: "bg-gray-100 text-gray-700",
};

// ฟังก์ชัน Advanced Pagination ไม่มีซ้ำ ไม่มี ... ติดกัน
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

  // remove duplicate pages (เช่น 1 ... 3 4 5 ... 10)
  return pages.filter((item, idx, arr) => item !== arr[idx - 1]);
}

export default function ManageUsers() {
  // ==== State หลัก ====
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "student",
    status: "active",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==== โหลดข้อมูล ====
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
      setError("");
    } catch {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==== Sort ตาราง ====
  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
  };
  const getSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  // ==== Filter/Search/Sort ====
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const valA = (a[sortColumn] || "").toString().toLowerCase();
      const valB = (b[sortColumn] || "").toString().toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // ==== Pagination Logic ====
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const showFrom = filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1;
  const showTo = indexOfLastUser > filteredUsers.length ? filteredUsers.length : indexOfLastUser;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, sortColumn, sortDirection, usersPerPage, users.length]);

  // ==== Pagination UI (ellipsis style) ====
  const renderPagination = () => {
    const pages = getPagination(currentPage, totalPages, 1);
    return (
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
        <div className="flex items-center text-sm text-gray-700 mb-2 md:mb-0">
          <span>
            แสดง {showFrom} ถึง {showTo} จาก {filteredUsers.length} รายการ&nbsp;
          </span>
          <label className="ml-2">แสดง:&nbsp;</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={usersPerPage}
            onChange={e => setUsersPerPage(Number(e.target.value))}
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

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  // ==== Modal ฟอร์ม เพิ่ม/แก้ไข ====
  const openAddModal = () => {
    setEditUser(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      role: "student",
      status: "active",
    });
    setFormError("");
    setModalOpen(true);
  };
  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({
      username: user.username,
      password: "",
      email: user.email || "",
      role: user.role,
      status: user.status || "active",
    });
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // ==== อัปเดตค่าในฟอร์ม ====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==== Validate ฟอร์ม ====
  const validateForm = () => {
    if (!formData.username.trim()) return "กรุณากรอกชื่อผู้ใช้";
    if (!editUser && !formData.password.trim()) return "กรุณากรอกรหัสผ่าน";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "รูปแบบอีเมลไม่ถูกต้อง";
    if (!["admin", "supervisor", "student"].includes(formData.role)) return "บทบาทไม่ถูกต้อง";
    if (!["active", "inactive"].includes(formData.status)) return "สถานะไม่ถูกต้อง";
    return "";
  };

  // ==== เพิ่ม/แก้ไข User ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const msg = validateForm();
    if (msg) return setFormError(msg);
    try {
      setLoading(true);
      if (editUser) {
        // PUT
        const payload = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        };
        if (formData.password.trim()) payload.password = formData.password;
        await axios.put(`/users/${editUser.user_id}`, payload);
        toast.success("แก้ไขผู้ใช้สำเร็จ");
      } else {
        await axios.post("/users", formData);
        toast.success("เพิ่มผู้ใช้สำเร็จ");
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      toast.error(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ==== ลบ User ====
  const handleDelete = async (user_id) => {
    if (!window.confirm("คุณแน่ใจว่าต้องการลบผู้ใช้นี้?")) return;
    try {
      setLoading(true);
      await axios.delete(`/users/${user_id}`);
      toast.success("ลบผู้ใช้สำเร็จ");
      fetchUsers();
    } catch {
      toast.error("ลบผู้ใช้ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  // ==== Import CSV ====
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        try {
          const res = await axios.post("/users/import", results.data);
          toast.success(res.data.message || "นำเข้าข้อมูลสำเร็จ");
          fetchUsers();
        } catch (error) {
          toast.error(error.response?.data?.message || "นำเข้าข้อมูลล้มเหลว");
        } finally {
          setLoading(false);
        }
      },
      error: function (err) {
        toast.error("อ่านไฟล์ CSV ผิดพลาด: " + err.message);
        setLoading(false);
      },
    });
    event.target.value = null;
  };

  // ==== Render UI ====
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-[#7C3AED] flex items-center space-x-2">
        <FaUser />
        <span>จัดการผู้ใช้งาน</span>
      </h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* ฟิลเตอร์ + ค้นหา */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อหรืออีเมล..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/3"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/4"
        >
          <option value="all">ทุกบทบาท</option>
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="student">Student</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/4"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button onClick={resetFilters} className="bg-gray-200 hover:bg-gray-300">
          🔄 เคลียร์
        </Button>
      </div>

      {/* ปุ่มเพิ่ม, Import, Export */}
      <div className="flex justify-between items-center mb-4">
        <Button onClick={openAddModal}>+ เพิ่มผู้ใช้ใหม่</Button>
        <div className="flex items-center gap-4">
          <label
            htmlFor="import-csv"
            className="text-sm text-[#7C3AED] hover:underline flex items-center gap-2 cursor-pointer"
            title="Import CSV"
          >
            <FaUpload />
            Import CSV
          </label>
          <input
            type="file"
            id="import-csv"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <CSVLink
            data={filteredUsers}
            filename="users.csv"
            className="text-sm text-[#7C3AED] hover:underline flex items-center gap-2"
            title="Export CSV"
          >
            <FaDownload />
            Export CSV
          </CSVLink>
        </div>
      </div>

      {/* ตารางแสดงผู้ใช้ */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <table className="w-full border text-sm shadow rounded-md overflow-hidden">
            <thead className="bg-[#E0E7FF] text-[#1E40AF]">
              <tr>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => handleSort("username")}>Username {getSortIcon("username")}</th>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => handleSort("email")}>Email {getSortIcon("email")}</th>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => handleSort("role")}>Role {getSortIcon("role")}</th>
                <th className="border px-3 py-2 text-left cursor-pointer" onClick={() => handleSort("status")}>Status {getSortIcon("status")}</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.user_id} className="odd:bg-white even:bg-gray-50 hover:bg-yellow-50">
                  <td className="border px-3 py-2">{user.username}</td>
                  <td className="border px-3 py-2">{user.email || "-"}</td>
                  <td className="border px-3 py-2 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="border px-3 py-2 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700" title="แก้ไข">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(user.user_id)} className="text-red-500 hover:text-red-700" title="ลบ">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">ไม่พบข้อมูลผู้ใช้งาน</td>
                </tr>
              )}
            </tbody>
          </table>
          {renderPagination()}
        </>
      )}

      {/* Modal ฟอร์มเพิ่ม/แก้ไขผู้ใช้ */}
      {modalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-semibold mb-4">{editUser ? "✏️ แก้ไขผู้ใช้" : "➕ เพิ่มผู้ใช้ใหม่"}</h2>
          {formError && <p className="text-red-600 mb-3">{formError}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={<FaUser />}
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              disabled={!!editUser}
              required
            />
            <Input
              icon={<FaLock />}
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required={!editUser}
            />
            <Input
              icon={<FaEnvelope />}
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <Select
              icon={<FaUserTag />}
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { label: "Admin", value: "admin" },
                { label: "Supervisor", value: "supervisor" },
                { label: "Student", value: "student" },
              ]}
            />
            <Select
              icon={<FaToggleOn />}
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button type="submit">บันทึก</Button>
              <Button type="button" onClick={closeModal} className="bg-gray-300 hover:bg-gray-400">ยกเลิก</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
