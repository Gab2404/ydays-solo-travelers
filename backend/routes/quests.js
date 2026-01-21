const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const {
  getQuestsByPath,
  createQuest,
  updateQuest,
  deleteQuest,
  validateQuest
} = require('../controllers/questController');
const { protect, admin } = require('../middleware/auth');

// Configuration Multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/quests/'); // Assurez-vous que ce dossier existe
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `quest-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images JPEG/PNG sont autorisées'));
    }
  }
});

// Routes publiques
router.get('/path/:pathId', getQuestsByPath);

// Route de validation de quête avec photo (protégée)
router.post('/:id/validate', protect, upload.single('photo'), validateQuest);

// Routes protégées (Admin uniquement)
router.post('/', protect, admin, createQuest);
router.put('/:id', protect, admin, updateQuest);
router.delete('/:id', protect, admin, deleteQuest);

module.exports = router;