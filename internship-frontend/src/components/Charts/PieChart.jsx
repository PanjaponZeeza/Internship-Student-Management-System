import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ปรับสีสดใสสวยงาม (ขยายชุดสีให้พอสำหรับ user type หลายกลุ่ม)
const COLORS = [
  "#6366F1", "#7C3AED", "#EC4899", "#22C55E", "#F97316",
  "#FBBF24", "#06B6D4", "#A3E635", "#F472B6"
];

export default function PieChart({ data }) {
  return (
    <div className="w-full h-72 bg-gradient-to-br from-[#F3F4F6] to-[#F1F5F9] rounded-2xl shadow-md p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="role"
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={45}
            paddingAngle={4}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(1)}%`
            }
            labelLine={false}
            isAnimationActive={true}
            animationDuration={750}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              borderColor: "#7C3AED",
              background: "#fff",
              boxShadow: "0 2px 10px #7c3aed22",
            }}
            labelStyle={{ color: "#7C3AED", fontWeight: "bold" }}
            itemStyle={{ color: "#7C3AED", fontWeight: 500 }}
            formatter={(value, name, props) => [
              value,
              props.payload.role || name,
            ]}
          />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ marginTop: 10 }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
