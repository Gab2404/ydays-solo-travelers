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
const upload = require('../middleware/upload'); // Assure-toi que ce fichier existe bien

// Routes publiques
router.get('/', getAllPaths);
router.get('/:id', getPathById);
router.get('/city/:city', getPathsByCity);

// Routes protégées (Admin uniquement)

// CRÉATION : On intercepte l'image avec upload.single('image') AVANT le contrôleur
router.post('/', protect, admin, upload.single('image'), createPath);

// MODIFICATION : Idem, au cas où l'admin change l'image
router.put('/:id', protect, admin, upload.single('image'), updatePath);

// SUPPRESSION
router.delete('/:id', protect, admin, deletePath);

module.exports = router;