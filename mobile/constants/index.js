/**
 * Constantes globales de l'application
 */

// Configuration API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api', // À modifier pour la production
  TIMEOUT: 10000,
};

// Catégories de parcours
export const CATEGORIES = [
  { value: 'Culturel', label: 'Culturel', icon: '🏛️', color: '#8b5cf6' },
  { value: 'Sportif', label: 'Sportif', icon: '⚽', color: '#ef4444' },
  { value: 'Culinaire', label: 'Culinaire', icon: '🍽️', color: '#f59e0b' },
  { value: 'Détente', label: 'Détente', icon: '🧘', color: '#10b981' },
  { value: 'Mixte', label: 'Mixte', icon: '🎯', color: '#3b82f6' }
];

// Configuration de géolocalisation
export const LOCATION_CONFIG = {
  PROXIMITY_THRESHOLD_KM: 0.1, // 100 mètres
  UPDATE_INTERVAL_MS: 5000, // 5 secondes
  ACCURACY: 'high'
};

// Système d'XP
export const XP_CONFIG = {
  POINTS_PER_QUEST: 50,
  POINTS_PER_LEVEL: 500,
  MAX_LEVEL: 100
};

// Badges/Achievements
export const BADGES = [
  { 
    id: 'first_quest', 
    name: 'Première Quête', 
    description: 'Complète ta première quête',
    icon: '🎯', 
    requirement: 1 
  },
  { 
    id: 'explorer', 
    name: 'Explorateur', 
    description: 'Complète 10 quêtes',
    icon: '🗺️', 
    requirement: 10 
  },
  { 
    id: 'adventurer', 
    name: 'Aventurier', 
    description: 'Complète 50 quêtes',
    icon: '⛰️', 
    requirement: 50 
  },
  { 
    id: 'legend', 
    name: 'Légende', 
    description: 'Complète 100 quêtes',
    icon: '👑', 
    requirement: 100 
  }
];

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  NOT_FOUND: 'Ressource introuvable.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION: 'Données invalides. Vérifiez vos informations.',
  LOCATION_PERMISSION: 'Permission de localisation requise.'
};

// Styles/Couleurs globales
export const COLORS = {
  primary: '#d97706',
  secondary: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#1e293b',
  light: '#f8fafc',
  gray: '#64748b',
  white: '#ffffff',
  background: '#fffbeb'
};

// Tailles
export const SIZES = {
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16
  },
  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32
  }
};

// Validations
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^(\+33|0)[1-9](\d{2}){4}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Villes disponibles (exemples)
export const AVAILABLE_CITIES = [
  { name: 'Bordeaux', emoji: '🍷' },
  { name: 'Paris', emoji: '🗼' },
  { name: 'Lyon', emoji: '🦁' },
  { name: 'Marseille', emoji: '⚓' },
  { name: 'Toulouse', emoji: '✈️' },
  { name: 'Nice', emoji: '🌴' }
];

export default {
  API_CONFIG,
  CATEGORIES,
  LOCATION_CONFIG,
  XP_CONFIG,
  BADGES,
  ERROR_MESSAGES,
  COLORS,
  SIZES,
  VALIDATION_RULES,
  AVAILABLE_CITIES
};