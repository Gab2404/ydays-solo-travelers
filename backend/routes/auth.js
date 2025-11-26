const router = require('express').Router();
const User = require('../models/User');

// INSCRIPTION COMPLÈTE
router.post('/register', async (req, res) => {
  try {
    const { email, password, lastname, firstname, age, nationality, sex, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json("Email déjà utilisé.");

    const newUser = new User({
      email, password, lastname, firstname, age, nationality, sex, phone, 
      role: role || 'joueur' // Par défaut joueur, sauf si précisé (pour tes tests mets 'admin')
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CONNEXION (Email ou Tel)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      $or: [{ email: req.body.login }, { phone: req.body.login }] 
    });
    
    if (!user) return res.status(404).json("Utilisateur introuvable");
    if (user.password !== req.body.password) return res.status(400).json("Mauvais mot de passe");

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;