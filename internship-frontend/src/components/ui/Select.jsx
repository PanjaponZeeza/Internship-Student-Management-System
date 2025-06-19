// Select.jsx: Select dropdown ที่ใช้ซ้ำได้ รองรับไอคอน, error, disabled, options และ className เพิ่มเติม

export default function Select({ icon, options = [], error, disabled, className = "", ...props }) {
  return (
    <div className="relative">
      {/* แสดง icon (ถ้ามี) ตำแหน่งซ้ายใน select */}
      {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
      <select
        disabled={disabled}
        className={`w-full px-10 py-2 border rounded transition focus:outline-none
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"}
          ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
          ${className}`}
        {...props} // รองรับ props เพิ่มเติม เช่น onChange, value
      >
        {/* วน options ทั้งหมด ถ้า opt เป็น object จะใช้ value/label, ถ้า string จะใช้เลย */}
        {options.map((opt, i) => (
          <option key={i} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {/* แสดง error ถ้ามี */}
      {error && <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>}
    </div>
  );
}
