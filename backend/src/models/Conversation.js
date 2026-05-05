const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // If set, the conversation is blocked by this user
  }
}, { timestamps: true });

// Ensure we don't have duplicate conversations for the same claim
conversationSchema.index({ claimId: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
