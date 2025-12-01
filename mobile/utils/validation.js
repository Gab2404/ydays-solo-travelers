import { VALIDATION_RULES } from '../constants';

/**
 * Utilitaires de validation côté client
 */
const validation = {
  /**
   * Valide une adresse email
   * @param {String} email - Email à valider
   * @returns {Boolean} True si valide
   */
  isValidEmail: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  },

  /**
   * Valide un numéro de téléphone français
   * @param {String} phone - Téléphone à valider
   * @returns {Boolean} True si valide
   */
  isValidPhone: (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/\s/g, '');
    return VALIDATION_RULES.PHONE_REGEX.test(cleaned);
  },

  /**
   * Valide un mot de passe
   * @param {String} password - Mot de passe à valider
   * @returns {Object} {isValid, errors}
   */
  validatePassword: (password) => {
    const errors = [];
    
    if (!password) {
      errors.push('Le mot de passe est requis');
      return { isValid: false, errors };
    }

    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caractères`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Valide un formulaire d'inscription
   * @param {Object} formData - Données du formulaire
   * @returns {Object} {isValid, errors}
   */
  validateRegistrationForm: (formData) => {
    const errors = {};

    // Validation email
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!validation.isValidEmail(formData.email)) {
      errors.email = 'Email invalide';
    }

    // Validation password
    const passwordValidation = validation.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    // Validation nom et prénom
    if (!formData.lastname?.trim()) {
      errors.lastname = 'Le nom est requis';
    }

    if (!formData.firstname?.trim()) {
      errors.firstname = 'Le prénom est requis';
    }

    // Validation téléphone (si fourni)
    if (formData.phone && !validation.isValidPhone(formData.phone)) {
      errors.phone = 'Numéro de téléphone invalide';
    }

    // Validation âge (si fourni)
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 0 || age > 120) {
        errors.age = 'Âge invalide';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Valide un formulaire de connexion
   * @param {Object} formData - Données du formulaire
   * @returns {Object} {isValid, errors}
   */
  validateLoginForm: (formData) => {
    const errors = {};

    if (!formData.login?.trim()) {
      errors.login = 'Email ou téléphone requis';
    }

    if (!formData.password) {
      errors.password = 'Mot de passe requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Valide des coordonnées GPS
   * @param {Object} location - {lat, lng}
   * @returns {Boolean} True si valide
   */
  isValidLocation: (location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return false;
    }

    return (
      location.lat >= -90 && 
      location.lat <= 90 &&
      location.lng >= -180 && 
      location.lng <= 180
    );
  },

  /**
   * Nettoie et valide une saisie de texte
   * @param {String} text - Texte à nettoyer
   * @param {Number} maxLength - Longueur maximale
   * @returns {String} Texte nettoyé
   */
  sanitizeText: (text, maxLength = 1000) => {
    if (!text) return '';
    return text.trim().substring(0, maxLength);
  }
};

export default validation;