const router = require('express').Router();
const {
  getQuestsByPath,
  createQuest,
  updateQuest,
  deleteQuest
} = require('../controllers/questController');
const { protect, admin } = require('../middleware/auth');

// Routes publiques
router.get('/path/:pathId', getQuestsByPath);

// Routes protégées (Admin uniquement)
router.post('/', protect, admin, createQuest);
router.put('/:id', protect, admin, updateQuest);
router.delete('/:id', protect, admin, deleteQuest);

module.exports = router;