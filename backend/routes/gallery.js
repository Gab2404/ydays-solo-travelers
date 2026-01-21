const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getPathGallery,
  downloadPathGalleryZip
} = require('../controllers/galleryController');

// @route   GET /api/gallery/path/:pathId
// @desc    Récupérer toutes les photos d'un parcours complété
// @access  Private
router.get('/path/:pathId', protect, getPathGallery);

// @route   GET /api/gallery/path/:pathId/download
// @desc    Télécharger un ZIP de toutes les photos d'un parcours
// @access  Private
router.get('/path/:pathId/download', protect, downloadPathGalleryZip);

module.exports = router;