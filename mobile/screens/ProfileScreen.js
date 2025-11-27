import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, MapPin, Award, User } from 'lucide-react-native';

export default function ProfileScreen({ navigation, user, setUser }) {
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  // Données fictives pour l'exemple
  const historyData = [
    { id: '1', title: 'Secrets de Bordeaux', date: '12 Oct.', xp: 450, status: 'Complété' },
    { id: '2', title: 'Paris Historique', date: '05 Nov.', xp: 300, status: 'En cours' },
    { id: '3', title: 'Street Art Lyon', date: '20 Nov.', xp: 600, status: 'Complété' },
  ];

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyIconBg}>
        <MapPin size={20} color="#d97706" />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <View style={styles.historyRight}>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{item.xp} XP</Text>
        </View>
        <Text style={[styles.statusText, item.status === 'En cours' ? styles.statusOngoing : styles.statusCompleted]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* BLOC PROFIL */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user.firstname[0]}{user.lastname[0]}</Text>
          </View>
          <Text style={styles.userName}>{user.firstname} {user.lastname}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.userRole}>{user.role === 'admin' ? 'Game Master' : 'Explorateur'}</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Parcours</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>750</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Award size={24} color="#FFD700" />
            <Text style={styles.statLabel}>Niveau 3</Text>
          </View>
        </View>
        
        {/* HISTORIQUE */}
        <Text style={styles.sectionTitle}>Dernières aventures</Text>
        <FlatList
          data={historyData}
          keyExtractor={item => item.id}
          renderItem={renderHistoryItem}
          scrollEnabled={false}
        />

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 50, paddingHorizontal: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  backText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },

  // Carte Profil
  profileCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 25, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 4, borderColor: '#f1f5f9' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 15 },
  roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  userRole: { fontSize: 12, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 30, elevation: 2 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#d97706' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
  statSeparator: { width: 1, backgroundColor: '#e2e8f0', height: '80%', alignSelf: 'center' },

  // Historique
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  historyCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 1 },
  historyIconBg: { width: 40, height: 40, backgroundColor: '#fff7ed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  historyDate: { fontSize: 12, color: '#94a3b8' },
  historyRight: { alignItems: 'flex-end' },
  xpBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 5 },
  xpText: { color: '#d97706', fontWeight: 'bold', fontSize: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statusCompleted: { color: '#16a34a' },
  statusOngoing: { color: '#0ea5e9' },

  // Logout
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fee2e2', paddingVertical: 15, borderRadius: 15, marginTop: 20 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
});