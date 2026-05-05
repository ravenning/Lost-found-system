const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

const initConversation = async (req, res) => {
  try {
    const { claimId } = req.body;
    const claim = await Claim.findById(claimId).populate('itemId');
    
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    
    const ownerId = claim.itemId.userId;
    const claimantId = claim.claimantId;

    if (req.user._id.toString() !== ownerId.toString() && req.user._id.toString() !== claimantId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let conversation = await Conversation.findOne({ claimId });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [ownerId, claimantId],
        itemId: claim.itemId._id,
        claimId: claim._id
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'email')
      .populate('itemId', 'title images')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    if (req.user.role !== 'admin') {
      await Message.updateMany(
        { conversationId, senderId: { $ne: req.user._id }, isRead: false },
        { isRead: true }
      );
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (conversation.blockedBy) {
      return res.status(403).json({ message: 'This conversation is blocked' });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      content
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    const recipientId = conversation.participants.find(p => p.toString() !== req.user._id.toString());
    await Notification.create({
      recipientId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `You have a new message.`,
      link: `/inbox`
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (conversation.blockedBy && conversation.blockedBy.toString() === req.user._id.toString()) {
      conversation.blockedBy = null;
    } else if (!conversation.blockedBy) {
      conversation.blockedBy = req.user._id;
    }

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reportUser = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { reason } = req.body;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reportedId = conversation.participants.find(p => p.toString() !== req.user._id.toString());

    const report = await Report.create({
      reporterId: req.user._id,
      targetType: 'Conversation',
      targetId: conversationId,
      reason
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'email')
      .populate('reportedId', 'email')
      .populate({ path: 'conversationId', populate: { path: 'itemId', select: 'title' } })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id });
    const convIds = conversations.map(c => c._id);
    const count = await Message.countDocuments({
      conversationId: { $in: convIds },
      senderId: { $ne: req.user._id },
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initConversation,
  getConversations,
  getMessages,
  sendMessage,
  blockUser,
  reportUser,
  getReports,
  getUnreadCount
};
