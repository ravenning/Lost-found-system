const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const Report = require('../models/Report');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
