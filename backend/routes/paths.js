const router = require('express').Router();
const {
  getAllPaths,
  getPathById,
  getPathsByCity,
  createPath,
  updatePath,
  deletePath
} = require('../controllers/pathController');
const { protect, admin } = require('../middleware/auth');

// Routes publiques
router.get('/', getAllPaths);
router.get('/:id', getPathById);
router.get('/city/:city', getPathsByCity);

// Routes protégées (Admin uniquement)
router.post('/', protect, admin, createPath);
router.put('/:id', protect, admin, updatePath);
router.delete('/:id', protect, admin, deletePath);

module.exports = router;