// Input.jsx: อินพุต UI ที่ใช้ซ้ำได้ มีรองรับไอคอน, error message, สถานะ disabled และ className เพิ่มเติม

export default function Input({ icon, error, disabled, className = "", ...props }) {
  return (
    <div className="relative">
      {/* แสดงไอคอน (ถ้ามี) ที่ด้านซ้ายในช่องอินพุต */}
      {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
      <input
        disabled={disabled}
        className={`w-full px-10 py-2 border rounded transition focus:outline-none
          ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"}
          ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
          ${className}`}
        {...props} // รองรับ props เพิ่มเติม (เช่น onChange, placeholder)
      />
      {/* ถ้ามี error จะแสดงข้อความ error ใต้ input */}
      {error && <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>}
    </div>
  );
}
