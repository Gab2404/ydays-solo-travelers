import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  ScrollView, Image, Dimensions, Alert, Modal, Pressable
} from 'react-native';
import { ArrowLeft, Download, Calendar, MapPin, X, Award } from 'lucide-react-native';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import galleryService from '../services/galleryService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

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

export default function GalleryScreen({ route, navigation }) {
  const { pathId } = route.params;
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchGallery();
  }, [pathId]);

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      const data = await galleryService.getPathGallery(pathId);
      setGallery(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger la galerie');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!gallery || gallery.photos.length === 0) return;
    Alert.alert(
      '📸 Enregistrer',
      `Sauvegarder ces ${gallery.photos.length} photos dans votre téléphone ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, enregistrer',
          onPress: async () => {
            try {
              setIsDownloading(true);
              await galleryService.saveAllPhotosToLibrary(gallery.photos);
              Alert.alert('✅ Succès', 'Photos enregistrées !');
            } catch (error) {
              errorHandler.handle(error, 'Erreur sauvegarde');
            } finally {
              setIsDownloading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '–';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getImgUri = (photo) => {
    if (!photo?.photoUrl) return null;
    return photo.photoUrl.startsWith('http')
      ? photo.photoUrl
      : `${serverURL}${photo.photoUrl.startsWith('/') ? '' : '/'}${photo.photoUrl}`;
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  if (!gallery) return null;

  const xpGained = gallery.xpGained || gallery.totalQuests * 30 || 0;

  return (
    <View style={styles.container}>

      {/* ── FULLSCREEN MODAL ── */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setSelectedPhoto(null)}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPhoto(null)}>
            <X size={22} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedPhoto }}
            style={styles.modalImg}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={14} color={COLORS.ink} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.topBarText}>
          <Text style={styles.topBarEyebrow}>Ma Galerie</Text>
          <Text style={styles.topBarTitle} numberOfLines={1}>{gallery.pathTitle}</Text>
        </View>
      </View>

      <View style={styles.rule} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── SUMMARY CARD ── */}
        <View style={styles.summaryCard}>

          {/* Completed banner */}
          <View style={styles.completedBanner}>
            <Award size={16} color={COLORS.orange} strokeWidth={1.8} />
            <Text style={styles.completedText}>Parcours terminé !</Text>
          </View>

          {/* Info pills */}
          <View style={styles.infoPills}>
            <View style={styles.infoPill}>
              <MapPin size={13} color={COLORS.ink3} strokeWidth={1.8} />
              <View>
                <Text style={styles.pillLbl}>Ville</Text>
                <Text style={styles.pillVal}>{gallery.pathCity || '–'}</Text>
              </View>
            </View>
            <View style={styles.infoPill}>
              <Calendar size={13} color={COLORS.ink3} strokeWidth={1.8} />
              <View>
                <Text style={styles.pillLbl}>Date</Text>
                <Text style={styles.pillVal}>{formatDate(gallery.completedAt)}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{gallery.photos.length}</Text>
              <Text style={styles.statLbl}>Photos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{gallery.totalQuests}</Text>
              <Text style={styles.statLbl}>Étapes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>+{xpGained}</Text>
              <Text style={styles.statLbl}>XP gagnés</Text>
            </View>
          </View>

          {/* Download */}
          <TouchableOpacity
            style={[styles.dlBtn, isDownloading && { opacity: 0.6 }]}
            onPress={handleDownload}
            disabled={isDownloading}
            activeOpacity={0.88}
          >
            {isDownloading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Download size={16} color="#fff" strokeWidth={2} />
            }
            <Text style={styles.dlBtnText}>
              {isDownloading ? 'Enregistrement…' : 'Enregistrer dans mes photos'}
            </Text>
          </TouchableOpacity>

        </View>

        {/* ── PHOTOS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes souvenirs</Text>
          <Text style={styles.sectionCount}>{gallery.photos.length} photos</Text>
        </View>

        <View style={styles.photoGrid}>
          {gallery.photos.map((photo, index) => {
            const uri = getImgUri(photo);
            return (
              <TouchableOpacity
                key={photo.questId || index}
                style={styles.photoItem}
                onPress={() => uri && setSelectedPhoto(uri)}
                activeOpacity={0.9}
              >
                {/* Thumb */}
                <View style={styles.photoThumb}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.photoImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.photoImg, { backgroundColor: COLORS.tealDark }]} />
                  )}
                  <View style={styles.photoOverlay} />
                  <View style={styles.photoNum}>
                    <Text style={styles.photoNumText}>#{index + 1}</Text>
                  </View>
                  {photo.questTitle ? (
                    <Text style={styles.photoPlace} numberOfLines={1}>{photo.questTitle}</Text>
                  ) : null}
                </View>

                {/* Labels below */}
                <Text style={styles.photoLabel}>Étape {index + 1}</Text>
                {photo.questTitle ? (
                  <Text style={styles.photoSublabel} numberOfLines={1}>{photo.questTitle}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Gallery" currentPathId={pathId} />
    </View>
  );
}

const PHOTO_SIZE = (width - 22 * 2 - 10) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 22, paddingBottom: 16,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  topBarText: { flex: 1 },
  topBarEyebrow: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 1.2,
    textTransform: 'uppercase', color: COLORS.teal, marginBottom: 1,
  },
  topBarTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 18, color: COLORS.ink,
  },

  rule: { height: 1, backgroundColor: COLORS.rule, marginHorizontal: 22, marginBottom: 18 },

  scrollContent: { paddingBottom: 100 },

  // Summary card
  summaryCard: {
    marginHorizontal: 22, marginBottom: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 14, padding: 16,
  },
  completedBanner: {
    backgroundColor: 'rgba(237,111,45,0.08)',
    borderWidth: 1, borderColor: 'rgba(237,111,45,0.15)',
    borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 14,
  },
  completedText: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 14, color: COLORS.orange,
  },

  // Info pills
  infoPills: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  infoPill: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 8, padding: 9,
    flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  pillLbl: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8.5, letterSpacing: 0.8,
    textTransform: 'uppercase', color: COLORS.ink3,
  },
  pillVal: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12, color: COLORS.ink,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1,
    borderWidth: 1.5, borderColor: COLORS.rule,
    borderStyle: 'dashed',
    borderRadius: 8, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 24, color: COLORS.orange,
    lineHeight: 28, marginBottom: 4,
  },
  statLbl: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5, letterSpacing: 1,
    textTransform: 'uppercase', color: COLORS.ink3,
  },

  // Download
  dlBtn: {
    height: 44, borderRadius: 10,
    backgroundColor: COLORS.orange,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    shadowColor: COLORS.orange, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  dlBtnText: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13, color: '#fff',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5, letterSpacing: 1.2,
    textTransform: 'uppercase', color: COLORS.ink3,
  },
  sectionCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11, color: COLORS.ink3,
  },

  // Photo grid
  photoGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 22, gap: 10,
  },
  photoItem: { width: PHOTO_SIZE },
  photoThumb: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    borderRadius: 10, overflow: 'hidden',
    marginBottom: 7, position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
    // gradient simulation
    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
  },
  photoNum: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2,
  },
  photoNumText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, color: 'rgba(255,255,255,0.85)',
  },
  photoPlace: {
    position: 'absolute', bottom: 8, left: 9, right: 9,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5, color: 'rgba(255,255,255,0.9)',
  },
  photoLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11, color: COLORS.ink2,
  },
  photoSublabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10, color: COLORS.ink3, marginTop: 1,
  },

  // Modal
  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalClose: {
    position: 'absolute', top: 52, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(60,60,60,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalImg: { width, height: height * 0.8 },
});