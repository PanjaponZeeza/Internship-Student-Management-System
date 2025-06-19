// Modal.jsx: กล่อง modal กลางจอแบบ reusable ใช้ครอบเนื้อหาใด ๆ รองรับปิดด้วย ESC, คลิกพื้นหลัง หรือกดปุ่มปิด

import { useEffect } from "react";

export default function Modal({ children, onClose }) {
  // ปิด modal เมื่อกดปุ่ม ESC บนคีย์บอร์ด
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    // cleanup event เมื่อ unmount
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // คลุมทั้งจอด้วยพื้นหลังโปร่งใส (กดตรงนี้เพื่อปิด modal)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* กล่องเนื้อหา modal (กดข้างในจะไม่ปิด) */}
      <div
        className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()} // ป้องกันปิด modal เมื่อคลิกเนื้อหาด้านใน
      >
        {children}
        {/* ปุ่มปิดมุมขวาบน */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
