const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

const logAudit = async (adminId, action, details) => {
  await AuditLog.create({ adminId, action, details });
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    const items = await Item.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const claims = await Claim.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const unresolvedReports = await Report.countDocuments({ status: 'PENDING' });

    res.json({
      users: { total: totalUsers, banned: bannedUsers },
      items,
      claims,
      reports: { unresolved: unresolvedReports }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot ban another admin' });

    user.isBanned = !user.isBanned;
    await user.save();

    await logAudit(req.user._id, user.isBanned ? 'BANNED_USER' : 'UNBANNED_USER', { targetUserId: user._id, email: user.email });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserTrusted = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isTrusted = !user.isTrusted;
    await user.save();

    await logAudit(req.user._id, user.isTrusted ? 'TRUSTED_USER' : 'UNTRUSTED_USER', { targetUserId: user._id, email: user.email });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('userId', 'email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkDeleteItems = async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'No item IDs provided' });
    }

    const result = await Item.deleteMany({ _id: { $in: itemIds } });
    await logAudit(req.user._id, 'BULK_DELETED_ITEMS', { count: result.deletedCount, itemIds });

    res.json({ message: `Deleted ${result.deletedCount} items` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate('claimantId', 'email')
      .populate('itemId', 'title')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdateClaims = async (req, res) => {
  try {
    const { claimIds, status } = req.body; // status: APPROVED or REJECTED
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    let updatedCount = 0;
    for (const claimId of claimIds) {
      const claim = await Claim.findById(claimId).populate('itemId');
      if (claim && claim.status === 'PENDING') {
        claim.status = status;
        await claim.save();
        updatedCount++;
        
        if (status === 'APPROVED') {
          await Claim.updateMany(
            { itemId: claim.itemId._id, _id: { $ne: claim._id }, status: 'PENDING' },
            { status: 'REJECTED' }
          );
          if (claim.itemId.transitionStatus('CLAIMED')) {
            await claim.itemId.save();
          }
        }
      }
    }

    await logAudit(req.user._id, `BULK_${status}_CLAIMS`, { count: updatedCount, claimIds });
    res.json({ message: `Successfully updated ${updatedCount} claims` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body; // REVIEWED
    
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    await report.save();

    await logAudit(req.user._id, 'UPDATED_REPORT_STATUS', { reportId: report._id, newStatus: status });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('adminId', 'email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserBan,
  toggleUserTrusted,
  getAllItems,
  bulkDeleteItems,
  getAllClaims,
  bulkUpdateClaims,
  updateReportStatus,
  getReports,
  getAuditLogs
};
