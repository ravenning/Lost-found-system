const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proofText: {
    type: String,
    required: true,
  },
  proofImages: [{
    url: String,
    public_id: String,
  }],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
}, { timestamps: true });

// Prevent a user from having multiple active/pending claims on the SAME item
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
