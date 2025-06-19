import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import {
  FaUsers,
  FaUserGraduate,
  FaLayerGroup,
  FaChartBar,
} from "react-icons/fa";
import { BarChart, PieChart } from "../../components/Charts";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ===== เพิ่ม Loader และ react-hot-toast =====
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/dashboard/admin/overview?year=${selectedYear}`);
        setStats(res.data);
      } catch (err) {
        toast.error("โหลดข้อมูลภาพรวมล้มเหลว");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedYear]);

  if (loading || !stats) {
    return <Loader />;
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-semibold text-[#7C3AED] flex items-center gap-2">
        <FaChartBar />
        ภาพรวมระบบฝึกงาน
      </h2>

      {/* === Summary Cards: การ์ดแสดงสรุปยอดรวมต่าง ๆ === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUsers />}
          label="จำนวนผู้ใช้"
          value={stats.totalUsers}
          percentage={5}
          color="from-[#6366F1] to-[#A5B4FC]"
        />
        <StatCard
          icon={<FaUserGraduate />}
          label="จำนวนนักศึกษา"
          value={stats.totalStudents}
          percentage={-3}
          color="from-[#F472B6] to-[#C4B5FD]"
        />
        <StatCard
          icon={<FaLayerGroup />}
          label="โปรแกรมฝึกงาน"
          value={stats.totalPrograms}
          percentage={10}
          color="from-[#6EE7B7] to-[#D1FAE5]"
        />
        <StatCard
          icon={<FaChartBar />}
          label="ความพึงพอใจเฉลี่ย"
          value={`${Number(stats.averageRating || 0).toFixed(2)} / 5`}
          color="from-[#FBBF24] to-[#FDE68A]"
        />
      </div>

      {/* === Charts section === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* ===== BarChart: จำนวน Feedback รายเดือน + Filter ปี ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E0E7FF]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-[#4B5563]">
              จำนวน Feedback รายเดือน
            </h2>
            <select
              className="border rounded px-3 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-[#7C3AED]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2025, 2024, 2023].map((year) => (
                <option key={year} value={year}>
                  ปี {year + 543}
                </option>
              ))}
            </select>
          </div>
          <BarChart data={stats.monthlyFeedbacks} />
        </div>

        {/* ===== PieChart: สัดส่วนผู้ใช้แต่ละประเภท ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E0E7FF]">
          <h2 className="text-lg font-semibold text-[#4B5563] mb-2">
            สัดส่วนผู้ใช้แต่ละประเภท
          </h2>
          <PieChart data={stats.roleDistribution} />
        </div>

        {/* ===== BarChart: จำนวนนักศึกษาแยกตามปีฝึกงาน ===== */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-[#E0E7FF] col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#4B5563] mb-2">
            จำนวนนักศึกษาแยกตามปีฝึกงาน
          </h2>
          {stats.studentsPerYear && stats.studentsPerYear.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart
                data={stats.studentsPerYear.map((item) => ({
                  ...item,
                  year: item.year.toString()
                }))}
                margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "ปีฝึกงาน",
                    position: "insideBottom",
                    offset: -5,
                    style: { fill: "#7C3AED", fontSize: 13 },
                  }}
                  tick={{ fill: "#6366F1" }}
                />
                <YAxis tick={{ fill: "#6366F1" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderRadius: 8, borderColor: "#7C3AED" }}
                  labelStyle={{ color: "#7C3AED", fontWeight: "bold" }}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar
                  dataKey="count"
                  fill="#A78BFA"
                  barSize={40}
                  radius={[10, 10, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={700}
                  label={{
                    position: "top",
                    fill: "#6366F1",
                    fontSize: 13,
                  }}
                />
              </ReBarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">ไม่มีข้อมูลนักศึกษาแยกตามปีฝึกงาน</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Subcomponent: การ์ดสรุปตัวเลข (Summary card) - ปรับสวยขึ้น, มีไอคอน background =====
function StatCard({ icon, label, value, percentage, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} border border-gray-100 shadow-md rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden`}
    >
      <div className="absolute top-3 right-3 opacity-10 text-5xl pointer-events-none">
        {icon}
      </div>
      <div className="z-10 flex items-center gap-2">
        <span className="bg-white/80 rounded-full p-2 text-xl text-[#7C3AED] shadow">{icon}</span>
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-gray-800 z-10">{value}</div>
      {typeof percentage === "number" && (
        <div
          className={`text-xs font-bold z-10 ${percentage >= 0 ? "text-green-500" : "text-red-500"}`}
        >
          {percentage >= 0 ? "+" : ""}
          {percentage}%
        </div>
      )}
    </div>
  );
}
