// Button.jsx: ปุ่ม UI ที่ใช้ซ้ำได้ทั่วทั้งระบบ สามารถกำหนดข้อความ, type, สถานะ disabled และเพิ่ม className เพิ่มเติมได้

export default function Button({ children, type = "button", disabled, className = "", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition
        ${disabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" :
          "bg-[#7C3AED] text-white hover:bg-[#5B21B6]"}
        ${className}`}
      {...props} // รองรับ prop อื่น ๆ ที่ส่งมา เช่น onClick
    >
      {children} {/* เนื้อหาภายในปุ่ม (เช่น ข้อความ หรือไอคอน) */}
    </button>
  );
}
