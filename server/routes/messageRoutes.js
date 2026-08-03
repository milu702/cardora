const express = require('express');
const router = express.Router();
const {
  getConversations,
  getChatMessages,
  sendMessage,
  deleteMessage,
  blockUser,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getChatMessages);
router.post('/:userId', sendMessage);
router.delete('/:messageId', deleteMessage);
router.post('/block/:userId', blockUser);

module.exports = router;
