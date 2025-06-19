import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

// โทนสีหลัก (ปรับสีได้)
const BAR_COLOR = "#6366F1";
const GRID_COLOR = "#E0E7FF";

export default function BarChart({ data }) {
  return (
    <div className="w-full h-72 bg-gradient-to-br from-[#EEF2FF] to-[#FAF5FF] rounded-2xl shadow-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart
          data={data}
          margin={{ top: 18, right: 24, bottom: 14, left: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6366F1", fontWeight: 500, fontSize: 13 }}
            axisLine={{ stroke: "#C4B5FD" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#7C3AED", fontSize: 13 }}
            axisLine={{ stroke: "#C4B5FD" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              borderColor: BAR_COLOR,
              background: "#fff",
              boxShadow: "0 2px 10px #7c3aed22",
            }}
            labelStyle={{ color: "#7C3AED", fontWeight: "bold" }}
            itemStyle={{ color: BAR_COLOR, fontWeight: 500 }}
          />
          <Legend />
          <Bar
            dataKey="count"
            name="Feedback"
            fill={BAR_COLOR}
            barSize={40}
            radius={[12, 12, 0, 0]}
            isAnimationActive={true}
            animationDuration={700}
          >
            {/* แสดง label ด้านบนแท่ง */}
            <LabelList
              dataKey="count"
              position="top"
              fill="#7C3AED"
              fontWeight="bold"
              fontSize={13}
            />
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
