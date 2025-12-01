const User = require('../models/User');
const { isValidEmail, isValidPhone, isValidPassword } = require('../utils/validation');
const { generateToken } = require('../utils/tokenUtils');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { successResponse, errorResponse, formatUserResponse } = require('../utils/responseFormatter');

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, lastname, firstname, age, nationality, sex, phone, role } = req.body;

    // Validations
    if (!email || !password || !lastname || !firstname) {
      return errorResponse(res, 400, 'Tous les champs obligatoires doivent être remplis');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, 'Email invalide');
    }

    if (!isValidPassword(password)) {
      return errorResponse(res, 400, 'Le mot de passe doit contenir au moins 6 caractères');
    }

    if (phone && !isValidPhone(phone)) {
      return errorResponse(res, 400, 'Numéro de téléphone invalide');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = new User({
      email,
      password: hashedPassword,
      lastname,
      firstname,
      age,
      nationality,
      sex,
      phone,
      role: role || 'joueur'
    });

    const savedUser = await newUser.save();

    // Générer le token
    const token = generateToken(savedUser._id);

    // Formatter et envoyer la réponse
    return successResponse(
      res, 
      201, 
      'Inscription réussie', 
      formatUserResponse(savedUser, token)
    );
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'Erreur serveur lors de l\'inscription');
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return errorResponse(res, 400, 'Veuillez fournir un email/téléphone et un mot de passe');
    }

    // Rechercher par email ou téléphone
    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) {
      return errorResponse(res, 404, 'Utilisateur introuvable');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 400, 'Mot de passe incorrect');
    }

    // Générer le token
    const token = generateToken(user._id);

    // Formatter et envoyer la réponse
    return successResponse(
      res, 
      200, 
      'Connexion réussie', 
      formatUserResponse(user, token)
    );
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'Erreur serveur lors de la connexion');
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return errorResponse(res, 404, 'Utilisateur introuvable');
    }
    
    return successResponse(res, 200, 'Profil récupéré', user);
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, 'Erreur serveur');
  }
};

module.exports = {
  register,
  login,
  getMe
};