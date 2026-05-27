import api from '../utils/api';

const reviewService = {
  /**
   * Créer ou mettre à jour un avis sur une quête.
   * La note (rating) est obligatoire. Le commentaire est optionnel.
   */
  upsertReview: async (questId, { rating, comment = null }) => {
    const response = await api.post(`/reviews/${questId}`, { rating, comment });
    return response.data;
  },

  /**
   * Récupérer tous les avis d'une quête (public).
   * Retourne { reviews, averageRating, totalReviews }
   */
  getQuestReviews: async (questId) => {
    const response = await api.get(`/reviews/${questId}`);
    return response.data.data;
  },

  /**
   * Récupérer l'avis de l'utilisateur connecté sur une quête.
   * Retourne null si aucun avis n'existe.
   */
  getMyReview: async (questId) => {
    const response = await api.get(`/reviews/${questId}/mine`);
    return response.data.data;
  },

  /**
   * Supprimer son avis sur une quête.
   */
  deleteReview: async (questId) => {
    const response = await api.delete(`/reviews/${questId}`);
    return response.data;
  },
};

export default reviewService;
