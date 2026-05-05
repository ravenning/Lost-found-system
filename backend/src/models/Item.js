const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['LOST', 'FOUND'],
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g., 'Electronics', 'Pets', 'Documents', 'Other'
  },
  categorySpecificFields: {
    type: Map,
    of: String, // Dynamic fields e.g., { "IMEI": "123456789012345" }
    default: {},
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true, // The date it was lost or found
  },
  images: [{
    url: String,
    public_id: String,
  }],
  status: {
    type: String,
    enum: ['LOST', 'FOUND', 'CLAIMED', 'RESOLVED', 'ARCHIVED'],
    required: true,
  },
}, { timestamps: true });

// Add transition logic method
itemSchema.methods.transitionStatus = function (newStatus) {
  const validTransitions = {
    'LOST': ['RESOLVED', 'ARCHIVED'],
    'FOUND': ['CLAIMED', 'ARCHIVED'],
    'CLAIMED': ['RESOLVED', 'FOUND', 'ARCHIVED'], // FOUND if claim falls through
    'RESOLVED': ['ARCHIVED'],
    'ARCHIVED': [] // Terminal state
  };

  const allowed = validTransitions[this.status];
  if (allowed && allowed.includes(newStatus)) {
    this.status = newStatus;
    return true;
  }
  return false;
};

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
