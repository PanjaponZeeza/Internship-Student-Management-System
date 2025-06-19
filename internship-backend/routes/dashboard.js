const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const Dashboard = require("../models/dashboard");

/**
 * GET /admin/overview
 * - ใช้สำหรับดึงข้อมูล overview ของ admin ในหน้า dashboard
 * - ต้องเป็น admin เท่านั้นถึงเข้าถึงได้ (middleware auth + authorizeRoles)
 * - รับ query param: year (ปีที่ต้องการดูข้อมูล, default = ปีปัจจุบัน)
 */
router.get(
  "/admin/overview",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    try {
      const stats = await Dashboard.getAdminOverview(year);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "dashboard query failed", details: err.message });
    }
  }
);

module.exports = router;
