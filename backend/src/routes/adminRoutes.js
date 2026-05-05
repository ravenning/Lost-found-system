const express = require('express');
const { 
  getDashboardStats, getUsers, toggleUserBan, toggleUserTrusted, getAllItems, bulkDeleteItems, 
  getAllClaims, bulkUpdateClaims, updateReportStatus, getReports, getAuditLogs 
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/ban', toggleUserBan);
router.put('/users/:userId/trusted', toggleUserTrusted);
router.get('/items', getAllItems);
router.delete('/items/bulk', bulkDeleteItems);
router.get('/claims', getAllClaims);
router.put('/claims/bulk', bulkUpdateClaims);
router.get('/reports', getReports);
router.put('/reports/:reportId/status', updateReportStatus);
router.get('/audit', getAuditLogs);

module.exports = router;
