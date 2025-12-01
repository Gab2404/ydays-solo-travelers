/**
 * Formatte une réponse de succès standardisée
 * @param {Object} res - Objet response Express
 * @param {Number} statusCode - Code HTTP
 * @param {String} message - Message de succès
 * @param {Object} data - Données à renvoyer
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Formatte une réponse d'erreur standardisée
 * @param {Object} res - Objet response Express
 * @param {Number} statusCode - Code HTTP
 * @param {String} message - Message d'erreur
 * @param {Array} errors - Liste d'erreurs détaillées
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Formatte les données utilisateur pour la réponse (sans mot de passe)
 * @param {Object} user - Objet utilisateur
 * @param {String} token - Token JWT (optionnel)
 * @returns {Object} Données utilisateur formatées
 */
const formatUserResponse = (user, token = null) => {
  const userData = {
    _id: user._id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role,
    phone: user.phone,
    age: user.age,
    nationality: user.nationality,
    sex: user.sex
  };
  
  if (token) {
    userData.token = token;
  }
  
  return userData;
};

module.exports = {
  successResponse,
  errorResponse,
  formatUserResponse
};