// Textarea.jsx: ช่องข้อความหลายบรรทัด (textarea) ที่ใช้ซ้ำได้ทั่วระบบ รองรับไอคอน, error, disabled และ className เพิ่มเติม

export default function Textarea({ icon, error, disabled, className = "", ...props }) {
  return (
    <div className="relative">
      {/* แสดงไอคอน (ถ้ามี) ตำแหน่งซ้ายใน textarea */}
      {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
      <textarea
        disabled={disabled}
        className={`w-full px-10 py-2 border rounded resize-y transition focus:outline-none
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"}
          ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
          ${className}`}
        {...props} // รับ prop อื่น ๆ เช่น placeholder, onChange, value
      />
      {/* แสดง error message ถ้ามี error */}
      {error && <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>}
    </div>
  );
}
