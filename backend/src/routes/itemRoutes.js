const express = require('express');
const { createItem, getItems, getItemById, updateItem, deleteItem, markResolved } = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { detectSpam } = require('../middlewares/moderationMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, upload.array('images', 5), detectSpam, createItem)
  .get(getItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

router.post('/:id/resolve', protect, markResolved);

module.exports = router;
