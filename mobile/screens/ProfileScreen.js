import React, { useContext, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert 
} from 'react-native';
import { LogOut, Camera, User as UserIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

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

      // On utilise updateUserProfile du service existant
      const updatedData = await userService.updateProfile(formData);
      updateUser(updatedData); // Met à jour le contexte global
      Alert.alert("Succès", "Photo de profil mise à jour !");
    } catch (err) {
      errorHandler.handle(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* SECTION STATS SUPPRIMÉE ICI */}

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
  profileCard: { alignItems: 'center', marginBottom: 40 },
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
  infoSection: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20 },
  sectionLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 },
  sectionValue: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 10 }
});