import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert 
} from 'react-native';
import { 
  LogOut, Camera, MapPin, CheckCircle, Clock, ChevronRight, 
  Settings, User as UserIcon, Bell, Lock, Download, Map
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import galleryService from '../services/galleryService';
import userService from '../services/userService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';
import { useFonts, AoboshiOne_400Regular } from '@expo-google-fonts/aoboshi-one';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

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
  danger: '#C03030',
};

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [allPhotos, setAllPhotos] = useState([]);

  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');
  const getUri = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${serverURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  let [fontsLoaded] = useFonts({
    AoboshiOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchUserHistory();
    fetchAllPhotos();
  }, []);

  const fetchAllPhotos = async () => {
    try {
      const data = await userService.getUserHistory();
      const completed = (data?.history || []).filter(h => h.percentage === 100);
      if (completed.length === 0) return;

      // Fetch all completed galleries in parallel
      const results = await Promise.allSettled(
        completed.map(h => galleryService.getPathGallery(h.path._id))
      );

      // Flatten all photos
      const all = [];
      results.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.photos?.length > 0) {
          all.push(...res.value.photos);
        }
      });

      // Shuffle and take 3
      const shuffled = all.sort(() => Math.random() - 0.5);
      setAllPhotos(shuffled.slice(0, 3));
    } catch (err) {
      // silently fail
    }
  };

  const fetchUserHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const data = await userService.getUserHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Erreur historique:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Nous avons besoin d'accéder à vos photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) handleUpload(result.assets[0]);
  };

  const handleUpload = async (asset) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: `avatar_${user._id}.jpg`,
        type: 'image/jpeg',
      });
      const updatedData = await userService.updateProfile(formData);
      updateUser(updatedData);
      Alert.alert("Succès", "Photo de profil mise à jour !");
    } catch (err) {
      errorHandler.handle(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !fontsLoaded) return null;

  const inProgressPath = history.find(h => h.percentage < 100);
  const completedPaths = history.filter(h => h.percentage === 100);
  const totalQuests = history.length;
  const totalXP = history.reduce((sum, h) => sum + (h.xpGained || 0), 0);
  const totalCities = [...new Set(history.map(h => h.path?.city).filter(Boolean))].length;
  const totalPhotos = history.reduce((sum, h) => sum + (h.photosCount || 0), 0);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <View style={styles.container}>

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Mon Profil</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Settings size={15} color={COLORS.ink2} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── AVATAR SECTION ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${serverURL}${user.avatar}` }}
                  style={styles.avatarImg}
                />
              ) : (
                <Text style={styles.avatarInitials}>{initials || <UserIcon size={28} color={COLORS.tealLight} />}</Text>
              )}
              {loading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator color={COLORS.white} size="small" />
                </View>
              )}
            </View>
            <View style={styles.avatarCam}>
              <Camera size={11} color="#fff" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>
            {(user.firstName || user.username || 'Voyageur')}{user.lastName ? ' ' + user.lastName : ''}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.profileBadges}>
            <View style={styles.badgeLevel}>
              <Text style={styles.badgeLevelText}>Explorateur · Niv.4</Text>
            </View>
            <View style={styles.badgeCity}>
              <Text style={styles.badgeCityText}>{user.city || 'Bordeaux'}</Text>
            </View>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalQuests}</Text>
            <Text style={styles.statLbl}>Quêtes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: COLORS.orange }]}>{totalXP || 142}</Text>
            <Text style={styles.statLbl}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalCities || 3}</Text>
            <Text style={styles.statLbl}>Villes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalPhotos || 24}</Text>
            <Text style={styles.statLbl}>Photos</Text>
          </View>
        </View>

        {/* ── GALLERY ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ma Galerie</Text>
          <TouchableOpacity onPress={() => navigation.navigate('GalleryAll')}>
            <Text style={styles.sectionLink}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        {allPhotos.length > 0 ? (
          <View style={styles.galleryGrid}>
            {/* Large cell — first photo */}
            <TouchableOpacity style={styles.galleryMain} activeOpacity={0.88}
              onPress={() => navigation.navigate('GalleryAll')}>
              <Image source={{ uri: getUri(allPhotos[0]?.photoUrl) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={styles.galleryOverlay} />
              <Text style={styles.galleryLabel} numberOfLines={2}>{allPhotos[0]?.questTitle || ''}</Text>
            </TouchableOpacity>

            {/* Small cells column */}
            <View style={styles.gallerySmallCol}>
              <TouchableOpacity style={styles.gallerySmall} activeOpacity={0.88}
                onPress={() => navigation.navigate('GalleryAll')}>
                {allPhotos[1] ? (
                  <Image source={{ uri: getUri(allPhotos[1]?.photoUrl) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.tealDark }]} />
                )}
                <View style={styles.galleryOverlay} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.gallerySmall} activeOpacity={0.88}
                onPress={() => navigation.navigate('GalleryAll')}>
                {allPhotos[2] ? (
                  <Image source={{ uri: getUri(allPhotos[2]?.photoUrl) }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.tealDark }]} />
                )}
                {allPhotos.length > 3 && (
                  <View style={styles.galleryMoreOverlay}>
                    <Text style={styles.galleryMoreNum}>+{allPhotos.length - 3}</Text>
                    <Text style={styles.galleryMoreLbl}>photos</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.galleryGrid, { alignItems: 'center', justifyContent: 'center' }]}>
            <View style={styles.galleryMain}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.tealDark, borderRadius: 8 }]} />
              <View style={styles.galleryOverlay} />
              <Text style={[styles.galleryLabel, { opacity: 0.5 }]}>Aucune photo</Text>
            </View>
            <View style={styles.gallerySmallCol}>
              <View style={[styles.gallerySmall, { backgroundColor: '#2C3828', borderRadius: 8 }]} />
              <View style={[styles.gallerySmall, { backgroundColor: '#1A2E40', borderRadius: 8 }]} />
            </View>
          </View>
        )}

        {/* Download button */}
        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={14} color={COLORS.teal} strokeWidth={2} />
          <Text style={styles.downloadText}>Télécharger la galerie du voyage</Text>
        </TouchableOpacity>

        {/* ── ADVENTURES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Aventures</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Tout voir →</Text>
          </TouchableOpacity>
        </View>

        {isHistoryLoading ? (
          <ActivityIndicator color={COLORS.orange} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.advList}>
            {inProgressPath && (
              <TouchableOpacity
                style={styles.advItem}
                onPress={() => navigation.navigate('Roadmap', { id: inProgressPath.path._id })}
                activeOpacity={0.85}
              >
                <View style={[styles.advIcon, styles.advIconOn]}>
                  <Map size={15} color={COLORS.tealLight} strokeWidth={1.7} />
                </View>
                <View style={styles.advBody}>
                  <Text style={[styles.advStatus, { color: COLORS.orange }]}>En cours</Text>
                  <Text style={styles.advName} numberOfLines={1}>{inProgressPath.path.title}</Text>
                  <View style={styles.advProgBar}>
                    <View style={[styles.advProgFill, { width: `${inProgressPath.percentage}%` }]} />
                  </View>
                  <Text style={styles.advMeta}>
                    {(() => {
                      const total = inProgressPath.path?.quests?.length || inProgressPath.totalQuests || 0;
                      const current = total > 0 ? Math.round((inProgressPath.percentage / 100) * total) : 0;
                      return `Étape ${current} sur ${total} · ${inProgressPath.percentage}%`;
                    })()}
                  </Text>
                </View>
                <ChevronRight size={10} color={COLORS.ink3} />
              </TouchableOpacity>
            )}

            {completedPaths.slice(0, 3).map((item, index) => (
              <TouchableOpacity
                key={item.path._id}
                style={[styles.advItem, index === completedPaths.slice(0, 3).length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => navigation.navigate('Gallery', { pathId: item.path._id })}
                activeOpacity={0.85}
              >
                <View style={[styles.advIcon, styles.advIconDone]}>
                  <CheckCircle size={15} color={COLORS.teal} strokeWidth={1.7} />
                </View>
                <View style={styles.advBody}>
                  <Text style={[styles.advStatus, { color: COLORS.teal }]}>Complété</Text>
                  <Text style={styles.advName} numberOfLines={1}>{item.path.title}</Text>
                  <Text style={styles.advMeta}>{item.path.city || 'Ville inconnue'} · {item.path.quests?.length || '?'} étapes</Text>
                </View>
                <ChevronRight size={10} color={COLORS.ink3} />
              </TouchableOpacity>
            ))}

            {history.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎒</Text>
                <Text style={styles.emptyText}>Aucune aventure pour le moment.</Text>
                <Text style={styles.emptySubtext}>Explorez la carte pour commencer !</Text>
              </View>
            )}
          </View>
        )}

        {/* ── SETTINGS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
        </View>

        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: 'rgba(237,111,45,0.1)' }]}>
              <UserIcon size={14} color={COLORS.orange} strokeWidth={1.8} />
            </View>
            <Text style={styles.settingsLabel}>Modifier le profil</Text>
            <ChevronRight size={10} color={COLORS.ink3} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: 'rgba(67,134,141,0.1)' }]}>
              <Bell size={14} color={COLORS.teal} strokeWidth={1.8} />
            </View>
            <Text style={styles.settingsLabel}>Notifications</Text>
            <View style={styles.settingsTag}>
              <Text style={styles.settingsTagText}>Activé</Text>
            </View>
            <ChevronRight size={10} color={COLORS.ink3} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsRow}>
            <View style={[styles.settingsIcon, { backgroundColor: 'rgba(26,26,26,0.06)' }]}>
              <Lock size={14} color={COLORS.ink2} strokeWidth={1.8} />
            </View>
            <Text style={styles.settingsLabel}>Confidentialité</Text>
            <ChevronRight size={10} color={COLORS.ink3} />
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          <TouchableOpacity style={styles.settingsRow} onPress={logout}>
            <View style={[styles.settingsIcon, { backgroundColor: 'rgba(200,48,48,0.08)' }]}>
              <LogOut size={14} color={COLORS.danger} strokeWidth={1.8} />
            </View>
            <Text style={[styles.settingsLabel, { color: COLORS.danger }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Top bar
  topBar: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  topBarTitle: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 20,
    color: COLORS.ink,
  },
  iconBtn: {
    width: 34, height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    alignItems: 'center', justifyContent: 'center',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 22,
  },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.tealDark,
    borderWidth: 3, borderColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: COLORS.tealDark,
    shadowOpacity: 0.22, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 22, color: COLORS.tealLight,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCam: {
    position: 'absolute', bottom: 1, right: 1,
    width: 23, height: 23, borderRadius: 12,
    backgroundColor: COLORS.orange,
    borderWidth: 2.5, borderColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 19, color: COLORS.ink, marginBottom: 3,
  },
  profileEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11, color: COLORS.ink3, marginBottom: 12,
  },
  profileBadges: { flexDirection: 'row', gap: 6 },
  badgeLevel: {
    backgroundColor: 'rgba(33,67,71,0.08)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4,
  },
  badgeLevelText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 0.7,
    textTransform: 'uppercase', color: COLORS.tealDark,
  },
  badgeCity: {
    backgroundColor: 'rgba(237,111,45,0.1)',
    borderWidth: 1, borderColor: 'rgba(237,111,45,0.2)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4,
  },
  badgeCityText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 0.7,
    textTransform: 'uppercase', color: COLORS.orange,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 22, marginBottom: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 12, overflow: 'hidden',
  },
  statItem: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.rule },
  statVal: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 19, color: COLORS.ink,
    lineHeight: 22, marginBottom: 3,
  },
  statLbl: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8, letterSpacing: 1,
    textTransform: 'uppercase', color: COLORS.ink3,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5, letterSpacing: 1.1,
    textTransform: 'uppercase', color: COLORS.ink3,
  },
  sectionLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11, color: COLORS.orange,
  },

  // Gallery
  galleryGrid: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 130,
    gap: 3,
  },
  galleryMain: {
    flex: 2,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  gallerySmallCol: {
    flex: 1,
    gap: 3,
  },
  gallerySmall: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  galleryBg: {
    ...StyleSheet.absoluteFillObject,
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
    background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)',
  },
  galleryLabel: {
    position: 'absolute', bottom: 8, left: 9,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9, color: 'rgba(255,255,255,0.9)', lineHeight: 13,
  },
  galleryMoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
    alignItems: 'center', justifyContent: 'center',
  },
  galleryMoreNum: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 17, color: '#fff',
  },
  galleryMoreLbl: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9, color: 'rgba(255,255,255,0.65)',
  },

  // Download
  downloadBtn: {
    marginHorizontal: 22, marginBottom: 28,
    height: 40, borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.rule,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  downloadText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11, color: COLORS.ink2,
  },

  // Adventures list
  advList: {
    marginHorizontal: 22,
    marginBottom: 22,
  },
  advItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.rule,
  },
  advIcon: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  advIconOn: { backgroundColor: COLORS.tealDark },
  advIconDone: { backgroundColor: '#EEF4F4' },
  advBody: { flex: 1, minWidth: 0 },
  advStatus: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 2,
  },
  advName: {
    fontFamily: 'AoboshiOne_400Regular',
    fontSize: 13, color: COLORS.ink, marginBottom: 4,
  },
  advProgBar: {
    height: 2.5, backgroundColor: COLORS.rule,
    borderRadius: 10, overflow: 'hidden', marginBottom: 3,
  },
  advProgFill: {
    height: '100%', backgroundColor: COLORS.orange, borderRadius: 10,
  },
  advMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10, color: COLORS.ink3,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 30, marginBottom: 10 },
  emptyText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14, color: COLORS.teal, textAlign: 'center', marginBottom: 4,
  },
  emptySubtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12, color: COLORS.ink3, textAlign: 'center',
  },

  // Settings
  settingsGroup: {
    marginHorizontal: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.rule,
    borderRadius: 12, overflow: 'hidden',
    marginBottom: 28,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 13,
  },
  settingsDivider: { height: 1, backgroundColor: COLORS.rule },
  settingsIcon: {
    width: 30, height: 30, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, color: COLORS.ink, flex: 1,
  },
  settingsTag: {
    backgroundColor: 'rgba(67,134,141,0.1)',
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4,
  },
  settingsTagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9, color: COLORS.teal,
  },
});