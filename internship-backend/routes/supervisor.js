const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const Supervisor = require("../models/supervisor");

// ===========================
// GET /api/supervisor/students
// ===========================
router.get(
  "/students",
  authenticateToken,
  authorizeRoles("supervisor"),
  async (req, res) => {
    const supervisorId = req.user.user_id;
    try {
      const students = await Supervisor.getStudentsForSupervisor(supervisorId);
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: "ดึงข้อมูลนักศึกษาล้มเหลว", details: err });
    }
  }
);

module.exports = router;
