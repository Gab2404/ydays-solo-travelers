const Review = require('../models/Review');

// POST /api/reviews/:questId — Créer ou mettre à jour un avis
const upsertReview = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'La note doit être entre 1 et 5.' });
    }

    const review = await Review.findOneAndUpdate(
      { questId, userId },
      {
        rating: Number(rating),
        comment: comment?.trim() || null,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Avis enregistré.', data: review });
  } catch (err) {
    console.error('Erreur upsertReview:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// GET /api/reviews/:questId — Récupérer les avis d'une quête
const getQuestReviews = async (req, res) => {
  try {
    const { questId } = req.params;

    const reviews = await Review.find({ questId })
      .populate('userId', 'username firstName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: avgRating ? parseFloat(avgRating) : null,
        totalReviews: reviews.length,
      },
    });
  } catch (err) {
    console.error('Erreur getQuestReviews:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// GET /api/reviews/:questId/mine — Récupérer l'avis de l'utilisateur connecté
const getMyReview = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ questId, userId });
    return res.status(200).json({ success: true, data: review || null });
  } catch (err) {
    console.error('Erreur getMyReview:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// DELETE /api/reviews/:questId — Supprimer son avis
const deleteReview = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user._id;

    await Review.findOneAndDelete({ questId, userId });
    return res.status(200).json({ success: true, message: 'Avis supprimé.' });
  } catch (err) {
    console.error('Erreur deleteReview:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

module.exports = { upsertReview, getQuestReviews, getMyReview, deleteReview };
