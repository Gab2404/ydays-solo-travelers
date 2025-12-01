// Validation email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation téléphone (format français)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validation password (min 6 caractères)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validation des coordonnées GPS
const isValidLocation = (lat, lng) => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

// Validation des données de parcours
const validatePathData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Le titre est obligatoire');
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push('La ville est obligatoire');
  }

  const validDifficulties = ['Culturel', 'Sportif', 'Culinaire', 'Détente', 'Mixte'];
  if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
    errors.push('Catégorie invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de quête
const validateQuestData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Le titre est obligatoire');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('La description est obligatoire');
  }

  if (!data.pathId) {
    errors.push('Le parcours est obligatoire');
  }

  if (data.location) {
    if (!isValidLocation(data.location.lat, data.location.lng)) {
      errors.push('Coordonnées GPS invalides');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidLocation,
  validatePathData,
  validateQuestData
};