const Notification = require('../models/Notification');
const User = require('../models/User');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'all') {
      await Notification.updateMany(
        { recipientId: req.user._id, isRead: false },
        { isRead: true }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user._id },
        { isRead: true }
      );
    }
    
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { emailNotifications, inAppNotifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.preferences = { emailNotifications, inAppNotifications };
    await user.save();
    
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, updatePreferences };
