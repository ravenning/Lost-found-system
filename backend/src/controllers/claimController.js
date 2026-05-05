const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const submitClaim = async (req, res) => {
  try {
    const { itemId, proofText } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'FOUND') {
      return res.status(400).json({ message: 'You can only claim items marked as FOUND' });
    }
    
    const existingClaim = await Claim.findOne({ itemId, claimantId: req.user._id });
    if (existingClaim) {
      return res.status(409).json({ message: 'You have already submitted a claim for this item' });
    }

    const proofImages = req.files ? req.files.map(f => ({ url: f.path, public_id: f.filename })) : [];

    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      proofText,
      proofImages,
    });

    await Notification.create({
      recipientId: item.userId,
      type: 'CLAIM_UPDATE',
      title: 'New Claim Received',
      message: `Someone has submitted a claim for your item: ${item.title}.`,
      link: `/items/${item._id}`
    });

    res.status(201).json(claim);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already submitted a claim for this item' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getClaimsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view claims for this item' });
    }

    const claims = await Claim.find({ itemId }).populate('claimantId', 'email');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id }).populate('itemId', 'title status images type');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body; 

    const claim = await Claim.findById(claimId).populate('itemId');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const item = claim.itemId;

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (claim.status !== 'PENDING') {
      return res.status(400).json({ message: `Claim is already ${claim.status}` });
    }

    claim.status = status;
    await claim.save();

    if (status === 'APPROVED') {
      await Claim.updateMany(
        { itemId: item._id, _id: { $ne: claim._id }, status: 'PENDING' },
        { status: 'REJECTED' }
      );

      if (item.transitionStatus('CLAIMED')) {
        await item.save();
      }
    }

    await Notification.create({
      recipientId: claim.claimantId,
      type: 'CLAIM_UPDATE',
      title: `Claim ${status}`,
      message: `Your claim for ${item.title} has been ${status.toLowerCase()}.`,
      link: `/my-claims`
    });

    res.json({ message: `Claim ${status}`, claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitClaim, getClaimsForItem, getUserClaims, updateClaimStatus };
