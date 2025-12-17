const bcrypt = require('bcryptjs');

/**
 * Hash un mot de passe
 * @param {String} password - Mot de passe en clair
 * @returns {Promise<String>} Mot de passe hashé
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare un mot de passe avec son hash
 * @param {String} password - Mot de passe en clair
 * @param {String} hashedPassword - Mot de passe hashé
 * @returns {Promise<Boolean>} True si correspond, false sinon
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};