const express = require('express');
const router = express.Router();
const { allMessages, sendMessage, updateOfferStatus, updateMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { detectSpam } = require('../middleware/spamDetection');

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, detectSpam, sendMessage);
router.route('/:id/offer').put(protect, updateOfferStatus);
router.route('/:id').put(protect, updateMessage).delete(protect, deleteMessage);

module.exports = router;
