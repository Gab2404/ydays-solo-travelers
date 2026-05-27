import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import StarRating from './StarRating';
import useQuestReview from '../hooks/useQuestReview';

const COLORS = {
  orange: '#ED6F2D',
  teal: '#43868D',
  tealDark: '#214347',
  tealLight: '#AECED1',
  ink: '#1A1A1A',
  ink2: '#4A4642',
  ink3: '#9C9590',
  background: '#FAF8F5',
  white: '#FFFFFF',
  rule: '#EAE6E1',
  overlay: 'rgba(26, 26, 26, 0.6)',
};

/**
 * QuestReviewModal — Modal complète de notation post-complétion.
 *
 * Props :
 *  - visible    : boolean
 *  - onClose    : () => void
 *  - onSuccess  : (review) => void  — appelé après soumission réussie
 *  - questId    : string
 *  - questTitle : string
 */
const QuestReviewModal = ({ visible, onClose, onSuccess, questId, questTitle }) => {
  const {
    rating,
    comment,
    isSubmitting,
    error,
    submitted,
    canSubmit,
    setRating,
    setComment,
    submit,
    reset,
    loadExistingReview,
  } = useQuestReview(questId);

  // Charge un éventuel avis existant à l'ouverture
  useEffect(() => {
    if (visible && questId) {
      loadExistingReview();
    }
  }, [visible, questId]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const result = await submit();
      if (onSuccess) onSuccess(result?.data);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch {
      // L'erreur est déjà dans le state via le hook
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.sheet}>
              {/* ── Drag Handle ── */}
              <View style={styles.dragHandle} />

              {/* ── Header ── */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerTag}>ÉVALUATION</Text>
                  <Text style={styles.headerTitle} numberOfLines={2}>
                    {questTitle || 'Étape terminée'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeBtn}
                  disabled={isSubmitting}
                >
                  <X size={16} color={COLORS.ink3} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* ── Success State ── */}
              {submitted ? (
                <View style={styles.successBlock}>
                  <View style={styles.successIcon}>
                    <Check size={28} color={COLORS.tealLight} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.successTitle}>Merci !</Text>
                  <Text style={styles.successSub}>Votre avis a bien été enregistré.</Text>
                  <StarRating rating={rating} readonly showLabel={false} size={28} />
                </View>
              ) : (
                <>
                  {/* ── Divider ── */}
                  <View style={styles.divider} />

                  {/* ── Stars ── */}
                  <View style={styles.starsSection}>
                    <Text style={styles.starsPrompt}>
                      Comment s'est passée cette étape ?
                    </Text>
                    <StarRating
                      rating={rating}
                      onRate={setRating}
                      size={44}
                      showLabel
                      gap={8}
                    />
                  </View>

                  {/* ── Comment Input ── */}
                  <View style={styles.commentSection}>
                    <Text style={styles.commentLabel}>
                      Votre avis{' '}
                      <Text style={styles.commentLabelOptional}>(optionnel)</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.commentInput,
                        rating === 0 && styles.commentInputDisabled,
                      ]}
                      placeholder={
                        rating === 0
                          ? "Sélectionnez d'abord une note..."
                          : "Partagez votre expérience, vos conseils..."
                      }
                      placeholderTextColor={rating === 0 ? '#C8C4BF' : COLORS.ink3}
                      multiline
                      numberOfLines={4}
                      maxLength={1000}
                      value={comment}
                      onChangeText={setComment}
                      editable={rating > 0}
                      textAlignVertical="top"
                    />
                    {comment.length > 900 && (
                      <Text style={styles.charCount}>
                        {comment.length}/1000
                      </Text>
                    )}
                  </View>

                  {/* ── Error ── */}
                  {error && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* ── Submit Button ── */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      !canSubmit && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Check size={16} color="#fff" strokeWidth={2.5} />
                        <Text style={styles.submitBtnText}>
                          {rating === 0
                            ? "Choisissez une note d'abord"
                            : "Publier mon évaluation"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <View style={{ height: Platform.OS === 'ios' ? 24 : 16 }} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },

  // Handle
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.rule,
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  headerTag: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: COLORS.orange,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 18,
    color: COLORS.ink,
    lineHeight: 24,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.rule,
    marginBottom: 24,
  },

  // Stars
  starsSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsPrompt: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: COLORS.ink2,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Comment
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.ink3,
    marginBottom: 8,
  },
  commentLabelOptional: {
    fontFamily: 'Poppins_400Regular',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 10,
    color: COLORS.ink3,
  },
  commentInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    borderRadius: 12,
    padding: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.ink,
    minHeight: 100,
    lineHeight: 20,
  },
  commentInputDisabled: {
    backgroundColor: '#F5F3F0',
    borderColor: '#EAE6E1',
    color: '#C8C4BF',
  },
  charCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.ink3,
    textAlign: 'right',
    marginTop: 4,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(220, 53, 69, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#DC3545',
    textAlign: 'center',
  },

  // Submit Button
  submitBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#D8D4CF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },

  // Success State
  successBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 22,
    color: COLORS.ink,
  },
  successSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.ink3,
    marginBottom: 8,
  },
});

export default QuestReviewModal;
