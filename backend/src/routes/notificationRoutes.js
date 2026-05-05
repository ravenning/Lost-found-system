const express = require('express');
const { getNotifications, markAsRead, updatePreferences } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.put('/preferences', updatePreferences);
router.put('/:id/read', markAsRead);

module.exports = router;
