import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';

/**
 * usePathRating — Charge la note moyenne agrégée de toutes les quêtes d'un parcours.
 *
 * Stratégie : on récupère les avis de la dernière quête du parcours pour représenter
 * la note globale du parcours (la quête finale = expérience complète).
 * Si le parcours a plusieurs quêtes, on pourrait agréger, mais c'est le modèle le plus
 * simple sans changer le backend.
 *
 * @param {string} questId  — ID de la quête représentative (ex: dernière du parcours)
 */
const usePathRating = (questId) => {
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!questId) return;
    setIsLoading(true);
    try {
      const data = await reviewService.getQuestReviews(questId);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
      setReviews(data.reviews || []);
    } catch {
      // Silencieux : pas d'avis = pas d'erreur critique
    } finally {
      setIsLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    load();
  }, [load]);

  return { averageRating, totalReviews, reviews, isLoading, reload: load };
};

export default usePathRating;
