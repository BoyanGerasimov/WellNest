const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  chatWithCoach,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

router.post('/', chatWithCoach);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;

