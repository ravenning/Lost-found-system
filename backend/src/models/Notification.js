const mongoose = require('mongoose');
const { sendNotificationEmail } = require('../utils/emailService');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['NEW_MATCH', 'CLAIM_UPDATE', 'NEW_MESSAGE', 'ADMIN_ALERT'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

notificationSchema.post('save', async function(doc) {
  try {
    const user = await mongoose.model('User').findById(doc.recipientId);
    if (user && user.preferences?.emailNotifications) {
      await sendNotificationEmail(user, doc);
    }
  } catch(err) {
    console.error('Email hook error:', err);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
