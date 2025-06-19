const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/feedback');

// ===== Middleware ตรวจสอบ validation ของ request body =====
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ==================== GET /api/feedback ====================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.getFeedback(req.user, req.query.student_id);
    res.json(feedbacks);
  } catch (err) {
    if (err.message === 'Access denied') {
      return res.status(403).json({ error: 'Access denied' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== POST /api/feedback ====================
router.post(
  '/',
  authenticateToken,
  authorizeRoles('supervisor', 'admin'),
  body('student_id').notEmpty().isUUID(),
  body('feedback').notEmpty().trim().escape(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback_date').optional().isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const { student_id, feedback, rating, feedback_date } = req.body;
      const supervisor_id = req.user.user_id;
      const feedback_id = await Feedback.createFeedback({ student_id, feedback, rating, feedback_date, supervisor_id });
      res.status(201).json({ message: 'Feedback created', feedback_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==================== PUT /api/feedback/:id ====================
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('supervisor', 'admin'),
  body('feedback').optional().notEmpty().trim().escape(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('feedback_date').optional().isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      await Feedback.updateFeedback(req.params.id, req.user, req.body);
      res.json({ message: 'Feedback updated' });
    } catch (err) {
      if (err.message === 'Feedback not found') {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      if (err.message.startsWith('Not authorized')) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message === 'No fields to update') {
        return res.status(400).json({ error: 'No fields to update' });
      }
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ==================== DELETE /api/feedback/:id ====================
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('supervisor', 'admin'),
  async (req, res) => {
    try {
      await Feedback.deleteFeedback(req.params.id, req.user);
      res.json({ message: 'Feedback deleted' });
    } catch (err) {
      if (err.message === 'Feedback not found') {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      if (err.message.startsWith('Not authorized')) {
        return res.status(403).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
