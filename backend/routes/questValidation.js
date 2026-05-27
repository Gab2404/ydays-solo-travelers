const router = require('express').Router();
const {
  checkProximity,
  validateQuestWithGPS,
  getNearbyQuests
} = require('../controllers/questValidationController');

// Routes publiques (sans authentification pour le dev)
router.post('/check-proximity/:questId', checkProximity);
router.post('/validate/:questId', validateQuestWithGPS);
router.post('/nearby', getNearbyQuests);

module.exports = router;