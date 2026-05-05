const Notification = require('../models/Notification');
const User = require('../models/User');

const BLOCKED_KEYWORDS = ['viagra', 'casino', 'porn', 'http://spam'];

const detectSpam = async (req, res, next) => {
  let contentToCheck = '';
  
  if (req.body.title) contentToCheck += req.body.title + ' ';
  if (req.body.description) contentToCheck += req.body.description + ' ';
  if (req.body.proofText) contentToCheck += req.body.proofText + ' ';

  const lowerContent = contentToCheck.toLowerCase();
  
  const isSpam = BLOCKED_KEYWORDS.some(keyword => lowerContent.includes(keyword));

  if (isSpam) {
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      const alerts = admins.map(admin => ({
        recipientId: admin._id,
        type: 'ADMIN_ALERT',
        title: 'Spam Detected',
        message: `Spam filter caught a submission from ${req.user?.email || 'Unknown User'}. Content contained blocked keywords.`,
        link: '/admin/dashboard'
      }));
      await Notification.insertMany(alerts);
    }

    return res.status(400).json({ message: 'Content flagged as inappropriate or spam.' });
  }

  next();
};

module.exports = { detectSpam };
