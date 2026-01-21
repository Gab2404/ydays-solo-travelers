const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Configuration du stockage pour les avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/'); // Le dossier que vous venez de créer
  },
  filename: (req, file, cb) => {
    // Nom unique : avatar-ID_USER.extension
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}${extension}`);
  }
});

const upload = multer({ storage });

router.get('/profile', protect, userController.getUserProfile);
// On ajoute le middleware upload.single('avatar') ici
router.put('/profile', protect, upload.single('avatar'), userController.updateUserProfile);
router.get('/history', protect, userController.getUserHistory);

module.exports = router;