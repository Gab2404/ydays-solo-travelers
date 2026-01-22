import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert 
} from 'react-native';
import { LogOut, Camera, MapPin, CheckCircle2, Clock, ChevronRight, User as UserIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

  // CHARTE VASCO
  const COLORS = {
    orange: '#ED6F2D', 
    darkGreen: '#214347', 
    teal: '#43868D', 
    bg: '#F8FAFC',
    white: '#FFFFFF',
    border: '#E2E8F0'
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

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

    if (!result.canceled) {
      handleUpload(result.assets[0]);
    }
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

  if (!user) return null;

  const inProgressPath = history.find(h => h.percentage < 100);
  const completedPaths = history.filter(h => h.percentage === 100);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      
      {/* EN-TÊTE */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: COLORS.darkGreen }]}>MON PROFIL</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
      >
        
        {/* CARTE PROFIL */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: COLORS.white, shadowColor: COLORS.orange }]}>
              {user.avatar ? (
                <Image 
                  source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${serverURL}${user.avatar}` }} 
                  style={styles.avatarImg} 
                />
              ) : (
                <View style={[styles.placeholderAvatar, { backgroundColor: COLORS.teal }]}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Text>
                </View>
              )}
              {loading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator color={COLORS.white} />
                </View>
              )}
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: COLORS.orange, borderColor: COLORS.white }]}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.identityContainer}>
            {/* Affichage Prénom + Nom en gros */}
            <Text style={[styles.userName, { color: COLORS.darkGreen }]}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={[styles.userHandle, { color: COLORS.teal }]}>@{user.username}</Text>
          </View>
        </View>

        {/* SECTION EMAIL (Info rapide) */}
        <View style={[styles.infoCard, { backgroundColor: COLORS.white }]}>
          <Text style={[styles.sectionLabel, { color: COLORS.teal }]}>Adresse email</Text>
          <Text style={[styles.sectionValue, { color: COLORS.darkGreen }]}>{user.email}</Text>
        </View>

        {/* SECTION AVENTURES */}
        <Text style={[styles.sectionTitle, { color: COLORS.darkGreen }]}>Mes Aventures</Text>
        
        {isHistoryLoading ? (
          <ActivityIndicator color={COLORS.orange} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.historyContainer}>
            
            {/* Parcours en cours */}
            {inProgressPath && (
              <TouchableOpacity 
                style={[styles.pathCard, { backgroundColor: COLORS.white, shadowColor: COLORS.orange }]}
                onPress={() => navigation.navigate('Roadmap', { id: inProgressPath.path._id })}
                activeOpacity={0.9}
              >
                <View style={styles.pathMainContent}>
                  <View style={styles.pathHeader}>
                    <Clock size={16} color={COLORS.orange} />
                    <Text style={[styles.statusText, { color: COLORS.orange }]}>EN COURS</Text>
                  </View>
                  
                  <Text style={[styles.pathTitle, { color: COLORS.darkGreen }]}>
                    {inProgressPath.path.title}
                  </Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${inProgressPath.percentage}%`, backgroundColor: COLORS.orange }]} />
                    </View>
                    <Text style={[styles.progressLabel, { color: COLORS.teal }]}>
                      {inProgressPath.percentage}% complété
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color={COLORS.teal} />
              </TouchableOpacity>
            )}

            {/* Parcours terminés */}
            {completedPaths.map((item) => (
              <TouchableOpacity 
                key={item.path._id}
                style={[styles.pathCard, { backgroundColor: COLORS.white, shadowColor: '#000' }]}
                onPress={() => navigation.navigate('Gallery', { pathId: item.path._id })}
                activeOpacity={0.9}
              >
                <View style={styles.pathMainContent}>
                  <View style={styles.pathHeader}>
                    <CheckCircle2 size={16} color={COLORS.teal} />
                    <Text style={[styles.statusText, { color: COLORS.teal }]}>COMPLÉTÉ</Text>
                  </View>
                  
                  <Text style={[styles.pathTitle, { color: COLORS.darkGreen }]}>
                    {item.path.title}
                  </Text>
                  
                  <View style={styles.pathFooter}>
                    <MapPin size={14} color={COLORS.teal} />
                    <Text style={[styles.footerText, { color: COLORS.teal }]}>
                      {item.path.city || 'Ville inconnue'}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#CBD5E1" />
              </TouchableOpacity>
            ))}

            {history.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 30, marginBottom: 10 }}>🎒</Text>
                <Text style={[styles.emptyText, { color: COLORS.teal }]}>
                  Aucune aventure pour le moment.
                </Text>
                <Text style={[styles.emptySubtext, { color: COLORS.teal }]}>
                  Explorez la carte pour commencer !
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bouton Déconnexion */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  header: { 
    paddingTop: 60, 
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', // Simulation Poppins ExtraBold
    letterSpacing: 1,
    textTransform: 'uppercase'
  },

  profileCard: { 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 10
  },
  avatarWrapper: { 
    position: 'relative',
    marginBottom: 16
  },
  avatarContainer: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden',
    borderWidth: 4, 
    elevation: 10,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 3, 
  },
  
  identityContainer: {
    alignItems: 'center'
  },
  userName: { 
    fontSize: 26, 
    fontWeight: '900', // Simulation Aoboshi One
    marginBottom: 4,
    textAlign: 'center'
  },
  userHandle: { 
    fontSize: 16, 
    fontWeight: '500'
  },
  
  infoCard: {
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '700',
    textTransform: 'uppercase', 
    marginBottom: 6,
    opacity: 0.8
  },
  sectionValue: { 
    fontSize: 16, 
    fontWeight: '600' 
  },

  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 16,
    marginLeft: 4
  },
  
  historyContainer: { 
    marginBottom: 20 
  },
  
  pathCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16, 
    elevation: 3, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 }
  },
  pathMainContent: { flex: 1, marginRight: 10 },
  pathHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusText: { 
    fontSize: 11, 
    fontWeight: '800', 
    marginLeft: 6, 
    letterSpacing: 0.5 
  },
  pathTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    marginBottom: 12 
  },
  
  progressContainer: { marginTop: 0 },
  progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  
  pathFooter: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 13, fontWeight: '500', marginLeft: 6 },
  
  emptyContainer: { 
    alignItems: 'center', 
    padding: 30,
    opacity: 0.7
  },
  emptyText: { fontWeight: '700', fontSize: 16, textAlign: 'center', marginBottom: 4 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },

  logoutBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    opacity: 0.8
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: '700', 
    fontSize: 16,
    marginLeft: 10 
  }
});