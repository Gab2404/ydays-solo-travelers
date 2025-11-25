const router = require('express').Router();
const User = require('../models/User');

// INSCRIPTION
router.post('/register', async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json("Cet email est déjà utilisé.");

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, 
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CONNEXION
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("Utilisateur non trouvé !");

    // Vérification mot de passe simple
    if (user.password !== req.body.password) {
      return res.status(400).json("Mot de passe incorrect !");
    }

    // On renvoie les infos utiles
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;