/**
 * Utilitaires de formatage pour l'affichage
 */
const formatters = {
  /**
   * Formatte un numéro de téléphone français
   * @param {String} phone - Numéro brut
   * @returns {String} Numéro formaté
   */
  formatPhone: (phone) => {
    if (!phone) return '';
    
    // Retirer tous les espaces et caractères spéciaux
    const cleaned = phone.replace(/\D/g, '');
    
    // Formater par paires de 2 chiffres
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    return phone;
  },

  /**
   * Formatte une date relative (il y a X jours)
   * @param {Date|String} date - Date à formater
   * @returns {String} Date formatée
   */
  formatRelativeDate: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return past.toLocaleDateString('fr-FR');
  },

  /**
   * Formatte un pourcentage de progression
   * @param {Number} value - Valeur entre 0 et 100
   * @returns {String} Pourcentage formaté
   */
  formatProgress: (value) => {
    return `${Math.round(value)}%`;
  },

  /**
   * Formatte l'XP avec séparateurs de milliers
   * @param {Number} xp - Points d'expérience
   * @returns {String} XP formaté
   */
  formatXP: (xp) => {
    return xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  },

  /**
   * Formatte le niveau d'un utilisateur
   * @param {Number} level - Niveau
   * @returns {String} Niveau formaté
   */
  formatLevel: (level) => {
    return `Niv. ${level}`;
  },

  /**
   * Tronque un texte avec ellipse
   * @param {String} text - Texte à tronquer
   * @param {Number} maxLength - Longueur maximale
   * @returns {String} Texte tronqué
   */
  truncate: (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Capitalise la première lettre
   * @param {String} str - Chaîne à capitaliser
   * @returns {String} Chaîne capitalisée
   */
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Formatte une durée en minutes/heures
   * @param {Number} minutes - Durée en minutes
   * @returns {String} Durée formatée
   */
  formatDuration: (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  },

  /**
   * Retourne l'emoji correspondant à une catégorie
   * @param {String} category - Catégorie du parcours
   * @returns {String} Emoji
   */
  getCategoryEmoji: (category) => {
    const emojis = {
      'Culturel': '🏛️',
      'Sportif': '⚽',
      'Culinaire': '🍽️',
      'Détente': '🧘',
      'Mixte': '🎯'
    };
    return emojis[category] || '📍';
  },

  /**
   * Retourne la couleur correspondant à une catégorie
   * @param {String} category - Catégorie du parcours
   * @returns {String} Code couleur
   */
  getCategoryColor: (category) => {
    const colors = {
      'Culturel': '#8b5cf6',
      'Sportif': '#ef4444',
      'Culinaire': '#f59e0b',
      'Détente': '#10b981',
      'Mixte': '#3b82f6'
    };
    return colors[category] || '#d97706';
  }
};

export default formatters;