import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, Modal, FlatList, Keyboard, ActivityIndicator 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Trash2, AlertTriangle } from 'lucide-react-native'; // Import des icônes de suppression
import api from '../utils/api';

export default function AdminPanelScreen({ navigation }) {
  const [tab, setTab] = useState('path');
  
  // Data Parcours
  const [pathData, setPathData] = useState({ title: '', city: '', difficulty: 'Culturel', description: '' });
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  // Data Quêtes
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [questData, setQuestData] = useState({ title: '', description: '', clue: '' });
  
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
      // Rafraîchir le parcours sélectionné si on est en train de l'éditer
      if (selectedPath) {
        const updated = res.data.find(p => p._id === selectedPath._id);
        setSelectedPath(updated || null);
      }
    } catch (err) { console.error(err); }
  };

  // --- RECHERCHE VILLE ---
  const searchCity = async (text) => {
    setPathData({ ...pathData, city: text });
    if (text.length < 3) { setCitySuggestions([]); return; }
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${text}&fields=nom&format=json&geometry=centre&boost=population&limit=5`);
      const data = await response.json();
      setCitySuggestions(data);
    } catch (error) { console.log("Erreur API Gouv", error); }
  };

  const selectCity = (cityName) => {
    setPathData({ ...pathData, city: cityName });
    setCitySuggestions([]);
    Keyboard.dismiss();
  };

  const handleCreatePath = async () => {
    if(!pathData.city || !pathData.title) return Alert.alert("Erreur", "Titre et Ville obligatoires");
    try {
      await api.post('/game/paths', pathData);
      Alert.alert("Succès", "Parcours créé !");
      setPathData({ title: '', city: '', difficulty: 'Culturel', description: '' });
      fetchPaths(); 
    } catch (err) { Alert.alert("Erreur", "Impossible de créer le parcours"); }
  };

  const handleAddressSearch = async () => {
    if (!addressSearch) return;
    Keyboard.dismiss();
    setIsSearching(true);
    try {
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
      } else { Alert.alert("Oups", "Adresse introuvable."); }
    } catch (err) { Alert.alert("Erreur", "Problème de connexion."); } finally { setIsSearching(false); }
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
      fetchPaths(); // Rafraîchir la liste
    } catch (err) { Alert.alert("Erreur", "Impossible d'ajouter la quête"); }
  };

  // --- SUPPRESSION ---
  const handleDeleteQuest = (questId) => {
    Alert.alert(
      "Supprimer l'étape ?",
      "Cette action est définitive.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/game/quests/${questId}`);
              fetchPaths(); 
            } catch (err) { Alert.alert("Erreur", "Impossible de supprimer."); }
          }
        }
      ]
    );
  };

  const handleDeletePath = () => {
    Alert.alert(
      "Supprimer le parcours ?",
      `Attention : Vous allez supprimer "${selectedPath.title}" et TOUTES ses quêtes.`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Tout Supprimer", style: "destructive", 
          onPress: async () => {
            try {
              await api.delete(`/game/paths/${selectedPath._id}`);
              setSelectedPath(null);
              fetchPaths();
              Alert.alert("Supprimé", "Le parcours a été effacé.");
            } catch (err) { Alert.alert("Erreur", "Impossible de supprimer."); }
          }
        }
      ]
    );
  };

  const categories = ['Culturel', 'Sportif', 'Culinaire', 'Détente', 'Mixte'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio Création 🛠️</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setTab('path')} style={[styles.tab, tab === 'path' && styles.activeTab]}>
          <Text style={[styles.tabText, tab === 'path' && styles.activeTabText]}>Parcours</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('quest')} style={[styles.tab, tab === 'quest' && styles.activeTab]}>
          <Text style={[styles.tabText, tab === 'quest' && styles.activeTabText]}>Gestion & Quêtes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab === 'path' ? (
          <View style={styles.card}>
            <Text style={styles.label}>Titre du parcours</Text>
            <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Ex: Bordeaux Gourmand" value={pathData.title} onChangeText={t => setPathData({...pathData, title: t})} />
            
            <Text style={styles.label}>Ville</Text>
            <View>
              <TextInput style={styles.input} placeholderTextColor="#9ca3af" placeholder="Tapez une ville..." value={pathData.city} onChangeText={searchCity} />
              {citySuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {citySuggestions.map((city) => (
                    <TouchableOpacity key={city.code} style={styles.suggestionItem} onPress={() => selectCity(city.nom)}>
                      <Text style={styles.suggestionText}>{city.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catChip, pathData.difficulty === cat && styles.activeCatChip]}
                  onPress={() => setPathData({...pathData, difficulty: cat})}
                >
                  <Text style={[styles.catText, pathData.difficulty === cat && styles.activeCatText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, {height: 80}]} placeholderTextColor="#9ca3af" multiline placeholder="Description..." value={pathData.description} onChangeText={t => setPathData({...pathData, description: t})} />
            
            <TouchableOpacity style={styles.mainBtn} onPress={handleCreatePath}>
              <Text style={styles.mainBtnText}>Créer le Parcours</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            
            {/* 1. SÉLECTION DU PARCOURS */}
            <Text style={styles.sectionTitle}>1. Choisir le parcours à gérer</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.selectBtnText}>{selectedPath ? selectedPath.title : "Appuyer pour sélectionner --"}</Text>
            </TouchableOpacity>

            {selectedPath && (
              <>
                {/* 2. FORMULAIRE D'AJOUT */}
                <Text style={styles.sectionTitle}>2. Ajouter une étape</Text>
                <Text style={styles.label}>Titre</Text>
                <TextInput style={styles.input} placeholder="Ex: La porte Cailhau" placeholderTextColor="#9ca3af" value={questData.title} onChangeText={t => setQuestData({...questData, title: t})} />
                <Text style={styles.label}>Consigne</Text>
                <TextInput style={[styles.input, {height: 60}]} multiline placeholder="Ex: Trouvez la porte..." placeholderTextColor="#9ca3af" value={questData.description} onChangeText={t => setQuestData({...questData, description: t})} />
                
                <View style={styles.searchContainer}>
                  <TextInput style={styles.searchInput} placeholder="Adresse..." placeholderTextColor="#9ca3af" value={addressSearch} onChangeText={setAddressSearch} onSubmitEditing={handleAddressSearch} />
                  <TouchableOpacity style={styles.searchBtn} onPress={handleAddressSearch}>
                    {isSearching ? <ActivityIndicator color="#fff" size="small"/> : <Text style={styles.searchBtnText}>🔍</Text>}
                  </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                  <MapView style={styles.map} region={questLocation} onRegionChangeComplete={(region) => setQuestLocation(region)} />
                  <View style={styles.markerFixed}><View style={styles.markerRing} /><View style={styles.markerDot} /></View>
                </View>

                <TouchableOpacity style={styles.mainBtn} onPress={handleCreateQuest}>
                  <Text style={styles.mainBtnText}>Sauvegarder l'étape</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* 3. GESTION / SUPPRESSION (Le Bloc demandé) */}
                <Text style={styles.sectionTitle}>3. Gestion du contenu</Text>
                
                {/* Liste des quêtes avec suppression */}
                {selectedPath.quests && selectedPath.quests.length > 0 ? (
                  <View style={styles.questListContainer}>
                    <Text style={styles.label}>Étapes actuelles ({selectedPath.quests.length})</Text>
                    {selectedPath.quests.map((quest, index) => (
                      <View key={quest._id} style={styles.questItem}>
                        <Text style={styles.questItemText} numberOfLines={1}>
                          <Text style={{fontWeight: 'bold'}}>{index + 1}.</Text> {quest.title}
                        </Text>
                        <TouchableOpacity onPress={() => handleDeleteQuest(quest._id)} style={styles.deleteQuestBtn}>
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{fontStyle: 'italic', color: '#9ca3af', marginBottom: 10}}>Aucune étape dans ce parcours.</Text>
                )}

                {/* ZONE DE DANGER (Suppression Parcours) */}
                <View style={styles.dangerZone}>
                  <View style={styles.dangerHeader}>
                    <AlertTriangle size={20} color="#ef4444" />
                    <Text style={styles.dangerTitle}>Zone de Danger</Text>
                  </View>
                  <Text style={styles.dangerDesc}>La suppression est irréversible et effacera toutes les quêtes associées.</Text>
                  <TouchableOpacity style={styles.deletePathBtn} onPress={handleDeletePath}>
                    <Text style={styles.deletePathText}>Supprimer ce Parcours</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir un parcours</Text>
            <FlatList 
              data={paths} keyExtractor={item => item._id}
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
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, fontSize: 16, color: '#1e293b', marginBottom: 15 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  activeCatChip: { backgroundColor: '#fff7ed', borderColor: '#d97706' },
  catText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  activeCatText: { color: '#d97706' },
  suggestionsBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, maxHeight: 150, marginTop: -10, marginBottom: 15 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  suggestionText: { color: '#334155' },
  selectBtn: { backgroundColor: '#f0f9ff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#0ea5e9', marginBottom: 10 },
  selectBtnText: { color: '#0284c7', fontWeight: 'bold', textAlign: 'center' },
  searchContainer: { flexDirection: 'row', marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, padding: 10, color: '#1e293b' },
  searchBtn: { backgroundColor: '#d97706', padding: 12, borderTopRightRadius: 10, borderBottomRightRadius: 10, justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  mapContainer: { height: 200, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' },
  map: { width: '100%', height: '100%' },
  markerFixed: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  markerRing: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444' },
  markerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', position: 'absolute' },
  mainBtn: { backgroundColor: '#d97706', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  disabledBtn: { backgroundColor: '#cbd5e1' },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // BLOC DE GESTION ET SUPPRESSION
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  questListContainer: { marginBottom: 20 },
  questItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  questItemText: { fontSize: 14, color: '#334155', flex: 1, fontWeight: '500' },
  deleteQuestBtn: { padding: 5 },
  
  dangerZone: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  dangerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dangerTitle: { color: '#991b1b', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  dangerDesc: { color: '#b91c1c', fontSize: 12, marginBottom: 15 },
  deletePathBtn: { backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center' },
  deletePathText: { color: '#fff', fontWeight: 'bold' },

  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, color: '#334155', textAlign: 'center' },
  closeBtn: { marginTop: 20, alignSelf: 'center', padding: 10 },
  closeBtnText: { color: '#ef4444', fontWeight: 'bold' }
});