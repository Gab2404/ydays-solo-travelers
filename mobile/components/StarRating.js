import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const COLORS = {
  starActive: '#FFD060',
  starHover: '#FFC030',
  starInactive: '#E8E4DF',
  starBorder: '#D8D4CF',
};

/**
 * StarRating — Composant de sélection de note en étoiles (1 à 5).
 *
 * Props :
 *  - rating       : note courante (0-5)
 *  - onRate       : (newRating: number) => void
 *  - size         : taille de chaque étoile (défaut : 36)
 *  - readonly     : désactive l'interaction (affichage seul)
 *  - showLabel    : affiche un libellé textuel sous les étoiles
 */
const LABELS = ['', 'Décevant', 'Pas top', 'Correct', 'Bien', 'Excellent !'];

const StarRating = ({
  rating = 0,
  onRate,
  size = 36,
  readonly = false,
  showLabel = true,
  gap = 6,
}) => {
  const handlePress = useCallback((index) => {
    if (readonly || !onRate) return;
    // Clic sur la même étoile → dé-sélectionne
    onRate(rating === index ? 0 : index);
  }, [readonly, onRate, rating]);

  return (
    <View style={styles.container}>
      <View style={[styles.starsRow, { gap }]}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= rating;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(index)}
              disabled={readonly}
              activeOpacity={readonly ? 1 : 0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              style={[
                styles.starWrapper,
                { width: size, height: size, borderRadius: size / 2 },
                isFilled && !readonly && styles.starWrapperActive,
              ]}
            >
              <Text style={[styles.star, { fontSize: size * 0.7 }]}>
                {isFilled ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showLabel && !readonly && (
        <Text style={styles.label}>
          {LABELS[rating] || 'Sélectionnez une note'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  starWrapperActive: {
    // Un très léger fond pour feedback visuel
  },
  star: {
    color: COLORS.starActive,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: undefined,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C9590',
    letterSpacing: 0.2,
    height: 18,
  },
});

export default StarRating;
