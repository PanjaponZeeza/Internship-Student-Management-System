// AuthContext.jsx: Context สำหรับจัดการ auth (token, login, logout) ทั้งระบบ
// ใช้ร่วมกับ useAuth() เพื่อดึงสถานะการล็อกอินในทุกหน้า

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// AuthProvider: ครอบ App เพื่อให้ทุก component ดึงข้อมูล token, login, logout ได้
export function AuthProvider({ children }) {
  // เริ่มต้น token จาก localStorage (ถ้ามี)
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // login: บันทึก token ใหม่ ทั้งใน state และ localStorage
  const login = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  // logout: เคลียร์ token ออกจาก state และ localStorage
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // เผยแพร่ค่า context ให้ลูก component ใช้
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth: hook สำหรับเรียกใช้ auth context ใน component ใดก็ได้
export function useAuth() {
  return useContext(AuthContext);
}
