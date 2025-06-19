// ไฟล์นี้คือ entry point หลักสำหรับแอป React (เช่นใน Vite หรือ CRA)
// ทำหน้าที่สร้าง React root และ render แอปหลักของคุณ
// รวมถึง import CSS ต่าง ๆ ที่ใช้ทั้งระบบ

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // ไฟล์ Tailwind CSS (base, components, utilities)
import App from "./App.jsx"; // ไฟล์ root component ของแอป
import "./assets/css/theme.css"; // ไฟล์ธีมเสริม (ถ้ามี)
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import ไอคอน FontAwesome แบบ global

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// - React.StrictMode ช่วยแจ้งเตือนปัญหา dev/debug ในระหว่างพัฒนา
// - สั่ง render <App /> (แอปของคุณ) ไปยัง element ที่มี id="root" ใน index.html
// - สามารถ import global css หรือ third-party css ที่ใช้ทั้งระบบได้ในไฟล์นี้
