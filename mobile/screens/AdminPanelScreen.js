import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, Modal, FlatList, Keyboard, ActivityIndicator 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../utils/api';

export default function AdminPanelScreen({ navigation }) {
  const [tab, setTab] = useState('path'); // 'path' ou 'quest'
  
  // Data Parcours
  const [pathData, setPathData] = useState({ title: '', city: '', difficulty: 'Moyen', description: '' });
  
  // Data Quêtes
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [questData, setQuestData] = useState({ title: '', description: '', clue: '' });
  
  // Gestion Carte & Adresse
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [questLocation, setQuestLocation] = useState({
    latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.005, longitudeDelta: 0.005
  });

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await api.get('/game/paths');
      setPaths(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreatePath = async () => {
    try {
      await api.post('/game/paths', pathData);
      Alert.alert("Succès", "Parcours créé !");
      setPathData({ title: '', city: '', difficulty: 'Moyen', description: '' });
      fetchPaths(); 
    } catch (err) { Alert.alert("Erreur", "Impossible de créer le parcours"); }
  };

  // RECHERCHE D'ADRESSE (Géocodage)
  const handleAddressSearch = async () => {
    if (!addressSearch) return;
    Keyboard.dismiss();
    setIsSearching(true);

    try {
      // API Gratuite OpenStreetMap (Nominatim)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setQuestLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
      } else {
        Alert.alert("Oups", "Adresse introuvable.");
      }
    } catch (err) {
      Alert.alert("Erreur", "Problème de connexion pour la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateQuest = async () => {
    if (!selectedPath) return Alert.alert("Erreur", "Sélectionnez un parcours");
    try {
      await api.post('/game/quests', {
        ...questData,
        pathId: selectedPath._id,
        location: { lat: questLocation.latitude, lng: questLocation.longitude }
      });
      Alert.alert("Succès", "Quête ajoutée !");
      setQuestData({ title: '', description: '', clue: '' });
      setAddressSearch('');
    } catch (err) { Alert.alert("Erreur", "Impossible d'ajouter la quête"); }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio Création 🛠️</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab('path')} style={[styles.tab, tab === 'path' && styles.activeTab]}>
          <Text style={[styles.tabText, tab === 'path' && styles.activeTabText]}>Parcours</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('quest')} style={[styles.tab, tab === 'quest' && styles.activeTab]}>
          <Text style={[styles.tabText, tab === 'quest' && styles.activeTabText]}>Quêtes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'path' ? (
          <View style={styles.card}>
            <Text style={styles.label}>Titre du parcours</Text>
            <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Ex: Bordeaux Historique" value={pathData.title} onChangeText={t => setPathData({...pathData, title: t})} />
            
            <Text style={styles.label}>Ville</Text>
            <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Ex: Bordeaux" value={pathData.city} onChangeText={t => setPathData({...pathData, city: t})} />
            
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, {height: 80}]} placeholderTextColor="#9ca3af" multiline placeholder="Description..." value={pathData.description} onChangeText={t => setPathData({...pathData, description: t})} />
            
            <TouchableOpacity style={styles.mainBtn} onPress={handleCreatePath}>
              <Text style={styles.mainBtnText}>Créer le Parcours</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {/* 1. Sélection Parcours */}
            <Text style={styles.sectionTitle}>1. Choisir le parcours</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.selectBtnText}>{selectedPath ? selectedPath.title : "Appuyer pour sélectionner --"}</Text>
            </TouchableOpacity>

            {/* 2. Infos Quête */}
            <Text style={styles.sectionTitle}>2. Détails de l'étape</Text>
            
            <Text style={styles.label}>Titre</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: La porte Cailhau" 
              placeholderTextColor="#9ca3af"
              value={questData.title} 
              onChangeText={t => setQuestData({...questData, title: t})} 
            />
            
            <Text style={styles.label}>Énigme</Text>
            <TextInput 
              style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
              multiline 
              placeholder="Ex: Trouvez la porte médiévale..." 
              placeholderTextColor="#9ca3af"
              value={questData.description} 
              onChangeText={t => setQuestData({...questData, description: t})} 
            />
            
            {/* 3. Carte & Adresse */}
            <Text style={styles.sectionTitle}>3. Localisation</Text>
            
            {/* Barre de recherche d'adresse */}
            <View style={styles.searchContainer}>
              <TextInput 
                style={styles.searchInput} 
                placeholder="Entrer une adresse (ex: Tour Eiffel)" 
                placeholderTextColor="#9ca3af"
                value={addressSearch}
                onChangeText={setAddressSearch}
                onSubmitEditing={handleAddressSearch}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleAddressSearch}>
                {isSearching ? <ActivityIndicator color="#fff" size="small"/> : <Text style={styles.searchBtnText}>🔍</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapView 
                style={styles.map}
                region={questLocation}
                onRegionChangeComplete={(region) => setQuestLocation(region)}
              />
              {/* Pointeur fixe au centre */}
              <View style={styles.markerFixed}>
                <View style={styles.markerRing} />
                <View style={styles.markerDot} />
              </View>
            </View>
            <Text style={styles.coordText}>
              Ajustez la carte pour placer le point rouge
            </Text>

            <TouchableOpacity style={[styles.mainBtn, !selectedPath && styles.disabledBtn]} disabled={!selectedPath} onPress={handleCreateQuest}>
              <Text style={styles.mainBtnText}>Sauvegarder l'étape</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de sélection de parcours */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir un parcours</Text>
            <FlatList 
              data={paths}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedPath(item); setModalVisible(false); }}>
                  <Text style={styles.modalItemText}>{item.title} ({item.city})</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backBtn: { marginRight: 15, padding: 5 },
  backText: { fontSize: 24, fontWeight: 'bold', color: '#64748b' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#e2e8f0' },
  activeTab: { borderBottomColor: '#d97706' },
  tabText: { fontWeight: 'bold', color: '#94a3b8' },
  activeTabText: { color: '#d97706' },

  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 15, marginBottom: 10 },
  
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 6, marginLeft: 2 },
  
  // STYLE AMÉLIORÉ DES INPUTS
  input: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    color: '#1e293b', // Texte noir foncé
    marginBottom: 15 // Espacement ajouté
  },
  
  selectBtn: { backgroundColor: '#f0f9ff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#0ea5e9', marginBottom: 10 },
  selectBtnText: { color: '#0284c7', fontWeight: 'bold', textAlign: 'center' },

  // Barre de recherche adresse
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, padding: 10, color: '#1e293b' },
  searchBtn: { backgroundColor: '#d97706', padding: 12, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },

  mapContainer: { height: 250, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  map: { width: '100%', height: '100%' },
  
  // Pointeur central fixe
  markerFixed: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  markerRing: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444' },
  markerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', position: 'absolute' },
  
  coordText: { textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 5, marginBottom: 20, fontStyle: 'italic' },

  mainBtn: { backgroundColor: '#d97706', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledBtn: { backgroundColor: '#cbd5e1' },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, color: '#334155' },
  closeBtn: { marginTop: 20, alignSelf: 'center', padding: 10 },
  closeBtnText: { color: '#ef4444', fontWeight: 'bold' }
});