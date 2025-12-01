import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, Image, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

export default function CitySelectionScreen({ navigation, user, setUser }) {
  const [searchText, setSearchText] = useState('');
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const goToDashboard = (cityName) => {
    navigation.navigate('Dashboard', { city: cityName });
  };

  const images = {
    bordeaux: require('../assets/images/bordeaux.jpg'),
    paris: require('../assets/images/paris.jpg'),
    marseille: require('../assets/images/marseille.jpg'),
    lyon: require('../assets/images/lyon.jpg'),
    toulouse: require('../assets/images/toulouse.jpg'),
  };

  const allCities = [
    { id: 'bordeaux', name: 'Bordeaux', img: images.bordeaux },
    { id: 'paris', name: 'Paris', img: images.paris },
    { id: 'marseille', name: 'Marseille', img: images.marseille },
    { id: 'lyon', name: 'Lyon', img: images.lyon },
    { id: 'toulouse', name: 'Toulouse', img: images.toulouse },
  ];

  const filteredCities = allCities.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Bienvenue,</Text>
          <Text style={styles.username}>{user.firstname}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON ADMIN */}
      {user.role === 'admin' && (
        <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminPanel')}>
          <Text style={styles.adminText}>🛠️ Studio Création</Text>
        </TouchableOpacity>
      )}

      {/* TITRE */}
      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>Où êtes-vous ? 📍</Text>
        <Text style={styles.subTitle}>Choisissez votre ville pour commencer</Text>
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchBar}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Ou est tu ?..."
          placeholderTextColor="#1e293b"
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.searchIconBox}>
          <Search size={24} color="#1e293b" />
        </View>
      </View>

      {/* CONTENU PRINCIPAL */}
      {searchText.length === 0 ? (
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={styles.leftCol}>
              <TouchableOpacity style={styles.cardMedium} onPress={() => goToDashboard('Bordeaux')}>
                <ImageBackground source={images.bordeaux} style={styles.cardBg} imageStyle={{borderRadius: 15}} resizeMode="cover">
                  <View style={styles.overlay}><Text style={styles.cardTitle}>BORDEAUX</Text></View>
                </ImageBackground>
              </TouchableOpacity>

              <View style={styles.smallRow}>
                <TouchableOpacity style={styles.cardSmall} onPress={() => goToDashboard('Marseille')}>
                  <ImageBackground source={images.marseille} style={styles.cardBg} imageStyle={{borderRadius: 15}} resizeMode="cover">
                    <View style={styles.overlay}><Text style={styles.cardTitleSmall}>MARSEILLE</Text></View>
                  </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardSmall} onPress={() => goToDashboard('Lyon')}>
                  <ImageBackground source={images.lyon} style={styles.cardBg} imageStyle={{borderRadius: 15}} resizeMode="cover">
                    <View style={styles.overlay}><Text style={styles.cardTitleSmall}>LYON</Text></View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rightCol}>
              <TouchableOpacity style={styles.cardTall} onPress={() => goToDashboard('Paris')}>
                <ImageBackground source={images.paris} style={styles.cardBg} imageStyle={{borderRadius: 15}} resizeMode="cover">
                  <View style={styles.overlay}><Text style={styles.cardTitle}>PARIS</Text></View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.cardWide} onPress={() => goToDashboard('Toulouse')}>
            <ImageBackground source={images.toulouse} style={styles.cardBg} imageStyle={{borderRadius: 15}} resizeMode="cover">
              <View style={styles.overlay}><Text style={styles.cardTitle}>TOULOUSE</Text></View>
            </ImageBackground>
          </TouchableOpacity>

          <View style={{height: 100}} />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredCities}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} onPress={() => goToDashboard(item.name)}>
              <Image source={item.img} style={styles.resultImage} />
              <Text style={styles.resultText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#64748b'}}>Aucune ville trouvée.</Text>}
        />
      )}

      {/* BOTTOM NAV */}
      <BottomNav navigation={navigation} activeRoute="CitySelection" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  welcomeLabel: { fontSize: 14, color: '#64748b' },
  username: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  closeBtn: { backgroundColor: '#fee2e2', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },

  adminBtn: { marginHorizontal: 20, backgroundColor: '#1e293b', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  adminText: { color: '#fff', fontWeight: 'bold' },

  titleContainer: { paddingHorizontal: 20, marginBottom: 20 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subTitle: { fontSize: 14, color: '#64748b' },

  searchBar: { 
    marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', 
    borderWidth: 2, borderColor: '#1e293b', borderRadius: 15, 
    marginBottom: 20, height: 55, backgroundColor: '#fff', overflow: 'hidden'
  },
  searchInput: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1e293b', paddingLeft: 15, height: '100%' },
  searchIconBox: { width: 50, height: '100%', borderLeftWidth: 2, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },

  gridContainer: { paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  leftCol: { flex: 2, gap: 10 },
  rightCol: { flex: 1 },

  cardMedium: { height: 120, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0' }, 
  cardTall: { height: 250, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0' },   
  smallRow: { flexDirection: 'row', gap: 10, height: 120 },
  cardSmall: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0' },      
  cardWide: { height: 80, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#e2e8f0' }, 

  cardBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  cardTitleSmall: { fontSize: 10, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },

  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  resultImage: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
  resultText: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
});