import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

/**
 * RatingBadge — Badge étoile cliquable, affiché sur les cartes et headers.
 *
 * Props :
 *  - rating       : number | null — note moyenne (null = pas encore d'avis)
 *  - reviewsCount : number        — nombre d'avis (optionnel)
 *  - onPress      : () => void    — action au clic (ouvrir la liste des avis)
 *  - variant      : 'dark' | 'light'
 *      'dark'  → fond semi-transparent blanc  (sur fond sombre : hero card, PathDetail header)
 *      'light' → fond jaune pâle              (sur fond clair  : liste Dashboard)
 *  - showCount    : boolean       — affiche le nombre d'avis entre parenthèses
 *  - size         : 'sm' | 'md'  — taille du badge
 */
const RatingBadge = ({
  rating = null,
  reviewsCount = 0,
  onPress,
  variant = 'dark',
  showCount = false,
  size = 'md',
  style,
}) => {
  const isEmpty = rating === null || rating === 0 || reviewsCount === 0;
  const displayRating = isEmpty ? null : parseFloat(rating).toFixed(1);

  const containerStyle = [
    styles.base,
    size === 'sm' ? styles.sm : styles.md,
    variant === 'dark' ? styles.dark : styles.light,
  ];

  const starStyle = [
    styles.star,
    size === 'sm' ? styles.starSm : styles.starMd,
    variant === 'dark' ? styles.starDark : styles.starLight,
  ];

  const textStyle = [
    styles.value,
    size === 'sm' ? styles.valueSm : styles.valueMd,
    variant === 'dark' ? styles.valueDark : styles.valueLight,
  ];

  const content = (
    <>
      <Text style={starStyle}>★</Text>
      {isEmpty ? (
        <Text style={[textStyle, styles.newLabel]}>Nouveau</Text>
      ) : (
        <Text style={textStyle}>
          {displayRating}
          {showCount && reviewsCount > 0 && (
            <Text style={styles.countText}> ({reviewsCount})</Text>
          )}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[containerStyle, style]}
        onPress={onPress}
        activeOpacity={0.75}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
  },

  // Sizes
  sm: { paddingHorizontal: 8, paddingVertical: 4 },
  md: { paddingHorizontal: 10, paddingVertical: 5 },

  // Variants
  dark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  light: {
    backgroundColor: 'transparent',
  },

  // Star
  star: { includeFontPadding: false },
  starSm: { fontSize: 11 },
  starMd: { fontSize: 13 },
  starDark: { color: '#FFD060' },
  starLight: { color: '#FFD060' },

  // Value text
  value: { includeFontPadding: false },
  valueSm: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  valueMd: { fontFamily: 'AoboshiOne_400Regular', fontSize: 13 },
  valueDark: { color: '#fff' },
  valueLight: { color: '#4A4642', fontFamily: 'Poppins_600SemiBold' },

  newLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.3,
  },

  countText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    opacity: 0.7,
  },
});

export default RatingBadge;
