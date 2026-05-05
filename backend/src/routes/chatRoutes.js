const express = require('express');
const { initConversation, getConversations, getMessages, sendMessage, blockUser, reportUser, getReports, getUnreadCount } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/init', protect, initConversation);
router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, sendMessage);
router.put('/:conversationId/block', protect, blockUser);
router.post('/:conversationId/report', protect, reportUser);

// Admin only routes
router.get('/admin/reports', protect, authorize('admin'), getReports);

module.exports = router;
