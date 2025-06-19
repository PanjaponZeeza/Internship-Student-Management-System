// Toast.jsx: กล่องแจ้งเตือน popup ชั่วคราว (toast) มุมขวาล่าง ใช้แจ้งเตือนสถานะ info/success/error/warning

import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  // type: "info", "success", "error", "warning"

  // ปิด Toast อัตโนมัติหลัง 3 วินาที (หรือเมื่อ unmount)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // กำหนดสีพื้นหลังแต่ละ type
  const bgColors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 px-4 py-2 rounded text-white shadow-lg ${bgColors[type]}`}
      role="alert"
    >
      {message}
    </div>
  );
}
