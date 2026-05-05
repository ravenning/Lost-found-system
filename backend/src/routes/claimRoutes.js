const express = require('express');
const { submitClaim, getClaimsForItem, getUserClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { detectSpam } = require('../middlewares/moderationMiddleware');

const router = express.Router();

router.post('/', protect, upload.array('proofImages', 5), detectSpam, submitClaim);
router.get('/my-claims', protect, getUserClaims);
router.get('/item/:itemId', protect, getClaimsForItem);
router.put('/:claimId/status', protect, updateClaimStatus);

module.exports = router;
