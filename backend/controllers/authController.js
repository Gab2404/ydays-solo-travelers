const User = require('../models/User');
const { isValidEmail, isValidPhone, isValidPassword } = require('../utils/validation');
const { generateToken } = require('../utils/tokenUtils');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { successResponse, errorResponse, formatUserResponse } = require('../utils/responseFormatter');

const register = async (req, res) => {
  try {
    const { email, password, lastname, firstname, age, nationality, sex, phone, role, username } = req.body;

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email déjà utilisé');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      email,
      password: hashedPassword,
      lastName: lastname,  
      firstName: firstname, 
      age,
      username: username || email.split('@')[0] + Math.floor(Math.random() * 1000),
      role: role === 'joueur' ? 'user' : role
    });

    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);

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

const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return errorResponse(res, 400, 'Veuillez fournir un email/téléphone et un mot de passe');
    }

    const user = await User.findOne({
      $or: [{ email: login }, { phone: login }]
    });

    if (!user) {
      return errorResponse(res, 404, 'Utilisateur introuvable');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 400, 'Mot de passe incorrect');
    }

    const token = generateToken(user._id);

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