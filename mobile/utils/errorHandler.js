import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '../constants';

/**
 * Gestionnaire d'erreurs centralisé pour le frontend
 */
const errorHandler = {
  /**
   * Gère une erreur et affiche un message approprié
   * @param {Error} error - Erreur à gérer
   * @param {String} customMessage - Message personnalisé (optionnel)
   */
  handle: (error, customMessage = null) => {
    console.error('Error:', error);

    let message = customMessage || ERROR_MESSAGES.SERVER_ERROR;

    // Erreur réseau
    if (!error.response) {
      message = ERROR_MESSAGES.NETWORK;
    }
    // Erreur HTTP avec réponse du serveur
    else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          message = data?.message || ERROR_MESSAGES.VALIDATION;
          break;
        case 401:
          message = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 404:
          message = data?.message || ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
          message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
      }
    }

    Alert.alert('Erreur', message);
  },

  /**
   * Affiche un message d'erreur de validation
   * @param {Object} errors - Objet contenant les erreurs
   */
  showValidationErrors: (errors) => {
    const errorMessages = Object.values(errors).join('\n');
    Alert.alert('Erreur de validation', errorMessages);
  },

  /**
   * Gère les erreurs de permission
   * @param {String} permissionType - Type de permission
   */
  handlePermissionError: (permissionType) => {
    let message;
    
    switch (permissionType) {
      case 'location':
        message = ERROR_MESSAGES.LOCATION_PERMISSION;
        break;
      default:
        message = `Permission ${permissionType} requise`;
    }

    Alert.alert('Permission requise', message);
  },

  /**
   * Affiche un message de succès
   * @param {String} message - Message de succès
   */
  showSuccess: (message) => {
    Alert.alert('Succès', message);
  },

  /**
   * Affiche un message d'information
   * @param {String} title - Titre
   * @param {String} message - Message
   */
  showInfo: (title, message) => {
    Alert.alert(title, message);
  },

  /**
   * Affiche une confirmation avec action
   * @param {String} title - Titre
   * @param {String} message - Message
   * @param {Function} onConfirm - Callback si confirmé
   * @param {Function} onCancel - Callback si annulé (optionnel)
   */
  showConfirmation: (title, message, onConfirm, onCancel = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Annuler',
          onPress: onCancel,
          style: 'cancel'
        },
        {
          text: 'Confirmer',
          onPress: onConfirm
        }
      ],
      { cancelable: false }
    );
  }
};

export default errorHandler;