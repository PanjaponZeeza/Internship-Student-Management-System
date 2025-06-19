// ConfirmModal.jsx: Modal กล่องยืนยัน (เช่น ลบ/ยืนยันข้อมูล) ใช้ซ้ำได้ทั่วระบบ
// รับ props: title (หัวข้อ), message (ข้อความ), onConfirm (ฟังก์ชันยืนยัน), onCancel (ฟังก์ชันปิด/ยกเลิก)

import Modal from "./Modal";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    // ใช้ Modal หลัก (ซ้อนกล่อง)
    <Modal onClose={onCancel}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="mb-6">{message}</p>
      {/* ปุ่มยกเลิก/ยืนยัน (ด้านขวา) */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          ยกเลิก
        </button>
        <button
          onClick={() => {
            onConfirm();  // ยืนยัน (จะใช้กับลบ, ออกจากระบบ ฯลฯ)
            onCancel();   // ปิดกล่อง modal
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ยืนยัน
        </button>
      </div>
    </Modal>
  );
}
