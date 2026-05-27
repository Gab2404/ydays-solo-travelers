import { useState, useCallback } from 'react';
import reviewService from '../services/reviewService';

/**
 * useQuestReview — Custom hook gérant toute la logique d'évaluation d'une quête.
 *
 * État géré :
 *  - rating       : note sélectionnée (0 = aucune, 1-5 = note)
 *  - comment      : texte de l'avis (optionnel)
 *  - isSubmitting : indicateur de soumission en cours
 *  - error        : dernière erreur
 *  - submitted    : true après une soumission réussie
 *
 * Règle métier : la soumission n'est possible que si rating >= 1.
 */
const useQuestReview = (questId) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  // Charge un éventuel avis déjà posté par l'utilisateur
  const loadExistingReview = useCallback(async () => {
    if (!questId) return;
    try {
      const review = await reviewService.getMyReview(questId);
      if (review) {
        setExistingReview(review);
        setRating(review.rating);
        setComment(review.comment || '');
      }
    } catch {
      // Silencieux : l'absence d'avis est un cas nominal
    }
  }, [questId]);

  const canSubmit = rating >= 1 && !isSubmitting;

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await reviewService.upsertReview(questId, {
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
      setExistingReview(result.data);
      return result;
    } catch (err) {
      const message = err?.message || 'Une erreur est survenue.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [questId, rating, comment, canSubmit]);

  const reset = useCallback(() => {
    setRating(0);
    setComment('');
    setError(null);
    setSubmitted(false);
  }, []);

  return {
    // State
    rating,
    comment,
    isSubmitting,
    error,
    submitted,
    existingReview,
    canSubmit,
    // Actions
    setRating,
    setComment,
    submit,
    reset,
    loadExistingReview,
  };
};

export default useQuestReview;
