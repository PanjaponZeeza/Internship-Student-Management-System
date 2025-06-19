import axios from "axios";

// ใช้ baseURL จาก .env (VITE_API_URL) ถ้าไม่มีจะ fallback เป็น "/api"
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Interceptor ก่อนส่ง request =====
// - เพิ่ม Authorization header อัตโนมัติทุก request ถ้ามี token ใน localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Interceptor เมื่อรับ response =====
// - ถ้า status เป็น 401 (token หมดอายุหรือไม่ได้ auth) จะลบ token, redirect กลับหน้าแรก และ alert เตือน
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");       // เคลียร์ token ออก
      window.location.href = "/";             // redirect ไปหน้า login หรือ root
      alert("Session หมดอายุ โปรดล็อกอินใหม่");
    }
    return Promise.reject(error); // ส่ง error ต่อให้ handle ในแต่ละหน้า
  }
);

export default api; // export instance นี้ไปใช้เรียกทุก API ใน frontend



