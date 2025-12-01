const router = require('express').Router();
const {
  getUserProfile,
  updateUserProfile,
  completeQuest,
  getUserHistory
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/complete-quest/:questId', protect, completeQuest);
router.get('/history', protect, getUserHistory);

module.exports = router;