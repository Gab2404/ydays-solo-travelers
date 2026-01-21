import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert 
} from 'react-native';
import { LogOut, Camera, MapPin, CheckCircle2, Clock, ChevronRight } from 'lucide-react-native';
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

  // Séparer les parcours en cours et terminés
  const inProgressPath = history.find(h => h.percentage < 100);
  const completedPaths = history.filter(h => h.percentage === 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image 
                  source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${serverURL}${user.avatar}` }} 
                  style={styles.avatarImg} 
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              )}
              {loading && <ActivityIndicator style={styles.loader} color="#fff" />}
            </View>
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
        </View>

        {/* SECTION AVENTURES */}
        <Text style={styles.sectionTitle}>Mes Aventures</Text>
        
        {isHistoryLoading ? (
          <ActivityIndicator color="#d97706" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.historyContainer}>
            {/* Parcours en cours - Redirige vers Roadmap */}
            {inProgressPath && (
              <TouchableOpacity 
                style={styles.pathCard}
                onPress={() => navigation.navigate('Roadmap', { id: inProgressPath.path._id })}
              >
                <View style={styles.pathMainContent}>
                  <View style={styles.pathHeader}>
                    <Clock size={18} color="#d97706" />
                    <Text style={styles.statusTextInProgress}>EN COURS</Text>
                  </View>
                  <Text style={styles.pathTitle}>{inProgressPath.path.title}</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${inProgressPath.percentage}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{inProgressPath.percentage}% complété</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </TouchableOpacity>
            )}

            {/* Parcours terminés - Redirige vers Gallery */}
            {completedPaths.map((item) => (
              <TouchableOpacity 
                key={item.path._id}
                style={styles.pathCard}
                onPress={() => navigation.navigate('Gallery', { pathId: item.path._id })}
              >
                <View style={styles.pathMainContent}>
                  <View style={styles.pathHeader}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <Text style={styles.statusTextDone}>COMPLÉTÉ</Text>
                  </View>
                  <Text style={styles.pathTitle}>{item.path.title}</Text>
                  <View style={styles.pathFooter}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.footerText}>{item.path.city || 'Ville inconnue'}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}

            {history.length === 0 && (
              <Text style={styles.emptyText}>Aucune aventure pour le moment. Commencez votre premier parcours !</Text>
            )}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>Email</Text>
          <Text style={styles.sectionValue}>{user.email}</Text>
        </View>

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
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 60, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 30 },
  profileCard: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatarContainer: { 
    width: 110, height: 110, borderRadius: 55, backgroundColor: '#1e293b', 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    borderWidth: 4, borderColor: '#fff' 
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 35, fontWeight: 'bold' },
  cameraBadge: { 
    position: 'absolute', bottom: 5, right: 5, backgroundColor: '#d97706', 
    padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' 
  },
  loader: { position: 'absolute' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginTop: 15 },
  userHandle: { fontSize: 16, color: '#64748b' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  historyContainer: { marginBottom: 20 },
  pathCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5 
  },
  pathMainContent: { flex: 1 },
  pathHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusTextInProgress: { color: '#d97706', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  statusTextDone: { color: '#10b981', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  pathTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  
  progressContainer: { marginTop: 5 },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#d97706' },
  progressLabel: { fontSize: 12, color: '#64748b', marginTop: 5 },
  
  pathFooter: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 12, color: '#64748b', marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginVertical: 20 },

  infoSection: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20 },
  sectionLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 },
  sectionValue: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 10 }
});