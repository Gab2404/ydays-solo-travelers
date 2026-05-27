const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  upsertReview,
  getQuestReviews,
  getMyReview,
  deleteReview,
} = require('../controllers/reviewController');

// Routes publiques
router.get('/:questId', getQuestReviews);

// Routes protégées (utilisateur connecté)
router.get('/:questId/mine', protect, getMyReview);
router.post('/:questId', protect, upsertReview);
router.delete('/:questId', protect, deleteReview);

module.exports = router;
