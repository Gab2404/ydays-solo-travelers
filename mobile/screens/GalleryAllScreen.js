import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Dimensions, ActivityIndicator, Modal, Pressable, FlatList
} from 'react-native';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import galleryService from '../services/galleryService';
import userService from '../services/userService';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');
const COLS = 3;
const CELL = (width - 4) / COLS; // 2px gaps

const COLORS = {
  orange: '#ED6F2D',
  teal: '#43868D',
  tealDark: '#214347',
  ink: '#1A1A1A',
  ink2: '#4A4642',
  ink3: '#9C9590',
  background: '#FAF8F5',
  white: '#FFFFFF',
  rule: '#EAE6E1',
};

export default function GalleryAllScreen({ navigation }) {
  const [groups, setGroups] = useState([]); // [{ pathTitle, pathId, photos: [] }]
  const [allFlat, setAllFlat] = useState([]); // flat list for modal nav
  const [isLoading, setIsLoading] = useState(true);
  const [modalIndex, setModalIndex] = useState(null); // null = closed

  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      // 1. Get user history to find completed paths
      const historyData = await userService.getUserHistory();
      const completed = (historyData?.history || []).filter(h => h.percentage === 100);

      if (completed.length === 0) {
        setGroups([]);
        setAllFlat([]);
        return;
      }

      // 2. Fetch gallery for each completed path
      const results = await Promise.allSettled(
        completed.map(h => galleryService.getPathGallery(h.path._id))
      );

      const grouped = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled' && res.value?.photos?.length > 0) {
          grouped.push({
            pathId: completed[i].path._id,
            pathTitle: res.value.pathTitle || completed[i].path.title,
            photos: res.value.photos,
          });
        }
      });

      setGroups(grouped);
      const flat = grouped.flatMap(g => g.photos.map(p => ({ ...p, pathTitle: g.pathTitle })));
      setAllFlat(flat);
    } catch (err) {
      console.error('Erreur galerie all:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUri = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${serverURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const openPhoto = (flatIndex) => setModalIndex(flatIndex);
  const closeModal = () => setModalIndex(null);
  const prevPhoto = () => setModalIndex(i => Math.max(0, i - 1));
  const nextPhoto = () => setModalIndex(i => Math.min(allFlat.length - 1, i + 1));

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  // Build flat index map: for each group photo, its global flat index
  let flatIdx = 0;
  const groupsWithIndex = groups.map(g => ({
    ...g,
    photos: g.photos.map(p => ({ ...p, _flatIdx: flatIdx++ }))
  }));

  const currentPhoto = modalIndex !== null ? allFlat[modalIndex] : null;

  return (
    <View style={styles.container}>

      {/* ── FULLSCREEN MODAL ── */}
      <Modal visible={modalIndex !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalBg}>
          {/* Close */}
          <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
            <X size={20} color="#fff" strokeWidth={2} />
          </TouchableOpacity>

          {/* Photo */}
          {currentPhoto && (
            <Image
              source={{ uri: getUri(currentPhoto.photoUrl) }}
              style={styles.modalImg}
              resizeMode="contain"
            />
          )}

          {/* Caption */}
          {currentPhoto?.questTitle && (
            <View style={styles.modalCaption}>
              <Text style={styles.modalCaptionTitle}>{currentPhoto.questTitle}</Text>
              {currentPhoto.pathTitle && (
                <Text style={styles.modalCaptionSub}>{currentPhoto.pathTitle}</Text>
              )}
            </View>
          )}

          {/* Nav arrows */}
          {modalIndex > 0 && (
            <TouchableOpacity style={[styles.modalNav, styles.modalNavLeft]} onPress={prevPhoto}>
              <ChevronLeft size={22} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          )}
          {modalIndex < allFlat.length - 1 && (
            <TouchableOpacity style={[styles.modalNav, styles.modalNavRight]} onPress={nextPhoto}>
              <ChevronRight size={22} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Counter */}
          <View style={styles.modalCounter}>
            <Text style={styles.modalCounterText}>{modalIndex + 1} / {allFlat.length}</Text>
          </View>
        </View>
      </Modal>

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={14} color={COLORS.ink} strokeWidth={2.2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.topBarEyebrow}>Profil</Text>
          <Text style={styles.topBarTitle}>Ma Galerie</Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.topBarCount}>{allFlat.length} photos</Text>
        </View>
      </View>

      <View style={styles.rule} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {allFlat.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>Aucune photo pour le moment.</Text>
            <Text style={styles.emptySub}>Terminez un parcours pour voir vos souvenirs ici.</Text>
          </View>
        ) : (
          groupsWithIndex.map((group, gi) => (
            <View key={gi}>
              {gi > 0 && <View style={styles.groupDivider} />}
              <View style={styles.group}>
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => navigation.navigate('Gallery', { pathId: group.pathId })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.groupTitle}>{group.pathTitle}</Text>
                  <Text style={styles.groupLink}>Voir détail →</Text>
                </TouchableOpacity>
                <View style={styles.grid}>
                  {group.photos.map((photo, pi) => {
                    const uri = getUri(photo.photoUrl);
                    return (
                      <TouchableOpacity
                        key={photo.questId || pi}
                        style={styles.cell}
                        onPress={() => openPhoto(photo._flatIdx)}
                        activeOpacity={0.88}
                      >
                        {uri ? (
                          <Image source={{ uri }} style={styles.cellImg} resizeMode="cover" />
                        ) : (
                          <View style={[styles.cellImg, { backgroundColor: COLORS.tealDark }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 22, paddingBottom: 14,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarEyebrow: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 1.2,
    textTransform: 'uppercase', color: COLORS.teal, marginBottom: 1,
  },
  topBarTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 18, color: COLORS.ink,
  },
  topBarRight: { marginLeft: 'auto' },
  topBarCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11, color: COLORS.ink3,
  },

  rule: { height: 1, backgroundColor: COLORS.rule },

  groupDivider: {
    height: 1, backgroundColor: COLORS.rule,
    marginHorizontal: 22, marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  groupTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 15, color: COLORS.ink,
  },
  groupLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11, color: COLORS.orange,
  },

  // Grid — 3 cols with 2px gaps, photos square
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 22,
    gap: 4,
  },
  cell: {
    width: (width - 44 - 8) / 3,
    height: (width - 44 - 8) / 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.tealDark,
  },
  cellImg: {
    width: '100%',
    height: '100%',
  },

  // Empty
  empty: {
    alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40,
    backgroundColor: COLORS.background,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14, color: COLORS.ink, textAlign: 'center', marginBottom: 6,
  },
  emptySub: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, color: COLORS.ink3, textAlign: 'center',
  },

  // Modal
  modalBg: {
    flex: 1, backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center',
  },
  modalClose: {
    position: 'absolute', top: 52, right: 20, zIndex: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(60,60,60,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalImg: { width, height: height * 0.75 },
  modalCaption: {
    position: 'absolute', bottom: 90, left: 0, right: 0,
    paddingHorizontal: 24, alignItems: 'center',
  },
  modalCaptionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14, color: '#fff', textAlign: 'center', marginBottom: 2,
  },
  modalCaptionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center',
  },
  modalNav: {
    position: 'absolute', top: '50%',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(60,60,60,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalNavLeft: { left: 16 },
  modalNavRight: { right: 16 },
  modalCounter: {
    position: 'absolute', bottom: 52,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  modalCounterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, color: 'rgba(255,255,255,0.7)',
  },
});