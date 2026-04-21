const express = require('express');
const router = express.Router();
const { fetchChats, accessChat, archiveChat, reportChat, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, fetchChats).post(protect, accessChat);
router.route('/:id').delete(protect, deleteChat);
router.route('/:id/archive').put(protect, archiveChat);
router.route('/:id/report').post(protect, reportChat);

module.exports = router;
