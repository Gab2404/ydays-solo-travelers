import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import StarRating from './StarRating';

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
};

/**
 * ReviewsListModal — Affiche la liste des avis d'un parcours.
 *
 * Props :
 *  - visible      : boolean
 *  - onClose      : () => void
 *  - reviews      : array
 *  - averageRating: number | null
 *  - totalReviews : number
 *  - questTitle   : string
 *  - isLoading    : boolean
 */
const ReviewsListModal = ({
  visible,
  onClose,
  reviews = [],
  averageRating = null,
  totalReviews = 0,
  questTitle = '',
  isLoading = false,
}) => {
  const renderReview = ({ item }) => {
    const author = item.userId?.firstName || item.userId?.username || 'Voyageur';
    const initials = author.slice(0, 2).toUpperCase();
    const date = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.reviewMeta}>
            <Text style={styles.reviewAuthor}>{author}</Text>
            <Text style={styles.reviewDate}>{date}</Text>
          </View>
          <StarRating rating={item.rating} readonly showLabel={false} size={14} gap={2} />
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTag}>AVIS</Text>
              <Text style={styles.headerTitle} numberOfLines={2}>{questTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={COLORS.ink3} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Summary */}
          {averageRating !== null && (
            <View style={styles.summary}>
              <Text style={styles.summaryScore}>{parseFloat(averageRating).toFixed(1)}</Text>
              <View style={styles.summaryRight}>
                <StarRating rating={Math.round(averageRating)} readonly showLabel={false} size={18} gap={2} />
                <Text style={styles.summaryCount}>
                  {totalReviews} avis
                </Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* List */}
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={COLORS.orange} />
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun avis pour le moment.</Text>
              <Text style={styles.emptySub}>Soyez le premier à évaluer ce parcours !</Text>
            </View>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item._id}
              renderItem={renderReview}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(26,26,26,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.rule,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  summaryScore: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 40,
    color: COLORS.ink,
    lineHeight: 48,
  },
  summaryRight: { gap: 4 },
  summaryCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.rule,
    marginBottom: 16,
  },
  loading: { paddingVertical: 40, alignItems: 'center' },
  empty: { paddingVertical: 40, alignItems: 'center', gap: 6 },
  emptyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: COLORS.ink2,
  },
  emptySub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.ink3,
    textAlign: 'center',
  },
  listContent: { paddingBottom: 40 },
  separator: { height: 1, backgroundColor: COLORS.rule, marginVertical: 12 },

  // Review item
  reviewItem: { gap: 8 },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: COLORS.tealLight,
  },
  reviewMeta: { flex: 1 },
  reviewAuthor: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.ink,
  },
  reviewDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: COLORS.ink3,
  },
  reviewComment: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.ink2,
    lineHeight: 18,
    paddingLeft: 42,
  },
});

export default ReviewsListModal;
