import { AlertTriangle, Edit3, MapPin, Navigation, Package, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList, Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import BottomNav from '../components/BottomNav';
import { CATEGORIES } from '../constants';
import pathService from '../services/pathService';
import questService from '../services/questService';
import errorHandler from '../utils/errorHandler';

export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('paths'); // 'paths' ou 'quests'
  
  // Data Parcours
  const [pathData, setPathData] = useState({ 
    title: '', 
    city: '', 
    difficulty: 'Culturel', 
    description: '' 
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  
  // Data Quêtes
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [pathModalVisible, setPathModalVisible] = useState(false);
  const [questData, setQuestData] = useState({ 
    title: '', 
    description: '', 
    clue: '' 
  });
  
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [questLocation, setQuestLocation] = useState({
    latitude: 48.8566, 
    longitude: 2.3522, 
    latitudeDelta: 0.005, 
    longitudeDelta: 0.005
  });

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const data = await pathService.getAllPaths();
      setPaths(data);
      
      if (selectedPath) {
        const updated = data.find(p => p._id === selectedPath._id);
        setSelectedPath(updated || null);
      }
    } catch (err) {
      errorHandler.handle(err);
    }
  };

  // RECHERCHE VILLE
  const searchCity = async (text) => {
    setPathData({ ...pathData, city: text });
    if (text.length < 3) { 
      setCitySuggestions([]); 
      return; 
    }
    
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${text}&fields=nom&format=json&geometry=centre&boost=population&limit=5`
      );
      const data = await response.json();
      setCitySuggestions(data);
    } catch (error) { 
      console.log("Erreur API Gouv", error); 
    }
  };

  const selectCity = (cityName) => {
    setPathData({ ...pathData, city: cityName });
    setCitySuggestions([]);
    Keyboard.dismiss();
  };

  const handleCreatePath = async () => {
    if (!pathData.city || !pathData.title) {
      errorHandler.showInfo("Erreur", "Titre et Ville obligatoires");
      return;
    }

    try {
      const newPath = await pathService.createPath(pathData);
      errorHandler.showSuccess('Parcours créé avec succès !');
      setPathData({ title: '', city: '', difficulty: 'Culturel', description: '' });
      fetchPaths();
      setSelectedPath(newPath);
    } catch (err) { 
      errorHandler.handle(err, "Impossible de créer le parcours");
    }
  };

  const handleDeletePath = (path) => {
    errorHandler.showConfirmation(
      "Supprimer le parcours ?",
      `Attention : Vous allez supprimer "${path.title}" et TOUTES ses quêtes.`,
      async () => {
        try {
          await pathService.deletePath(path._id);
          if (selectedPath?._id === path._id) {
            setSelectedPath(null);
          }
          fetchPaths();
          errorHandler.showSuccess('Le parcours a été effacé.');
        } catch (err) { 
          errorHandler.handle(err, "Impossible de supprimer.");
        }
      }
    );
  };

  const handleAddressSearch = async () => {
    if (!addressSearch) return;
    
    Keyboard.dismiss();
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setQuestLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        });
        errorHandler.showSuccess('Adresse trouvée !');
      } else { 
        errorHandler.showInfo("Oups", "Adresse introuvable.");
      }
    } catch (err) { 
      errorHandler.handle(err, "Problème de connexion.");
    } finally { 
      setIsSearching(false); 
    }
  };

  const handleCreateQuest = async () => {
    if (!selectedPath) {
      errorHandler.showInfo("Erreur", "Sélectionnez un parcours");
      return;
    }

    if (!questData.title.trim()) {
      errorHandler.showInfo("Erreur", "Le titre est obligatoire");
      return;
    }

    try {
      await questService.createQuest({
        ...questData,
        pathId: selectedPath._id,
        location: { 
          lat: questLocation.latitude, 
          lng: questLocation.longitude 
        }
      });
      
      errorHandler.showSuccess('Étape ajoutée avec succès !');
      setQuestData({ title: '', description: '', clue: '' });
      setAddressSearch('');
      fetchPaths();
    } catch (err) { 
      errorHandler.handle(err, "Impossible d'ajouter la quête");
    }
  };

  const handleDeleteQuest = (questId) => {
    errorHandler.showConfirmation(
      "Supprimer l'étape ?",
      "Cette action est définitive.",
      async () => {
        try {
          await questService.deleteQuest(questId);
          errorHandler.showSuccess('Étape supprimée');
          fetchPaths(); 
        } catch (err) { 
          errorHandler.handle(err, "Impossible de supprimer.");
        }
      }
    );
  };

  const categories = CATEGORIES.map(cat => cat.value);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Studio Création</Text>
          <Text style={styles.headerSubtitle}>Gérez vos parcours et quêtes</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'paths' && styles.activeTab]}
          onPress={() => setActiveTab('paths')}
        >
          <Package size={20} color={activeTab === 'paths' ? '#d97706' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'paths' && styles.activeTabText]}>
            Parcours
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'quests' && styles.activeTab]}
          onPress={() => setActiveTab('quests')}
        >
          <Navigation size={20} color={activeTab === 'quests' ? '#d97706' : '#64748b'} />
          <Text style={[styles.tabText, activeTab === 'quests' && styles.activeTabText]}>
            Étapes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TAB PARCOURS */}
        {activeTab === 'paths' && (
          <>
            {/* Créer un parcours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Plus size={22} color="#d97706" />
                <Text style={styles.sectionTitle}>Créer un parcours</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Titre du parcours *</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#9ca3af" 
                    placeholder="Ex: Bordeaux Gourmand" 
                    value={pathData.title} 
                    onChangeText={t => setPathData({...pathData, title: t})} 
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ville *</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#9ca3af" 
                    placeholder="Tapez une ville..." 
                    value={pathData.city} 
                    onChangeText={searchCity} 
                  />
                  {citySuggestions.length > 0 && (
                    <View style={styles.suggestionsBox}>
                      {citySuggestions.map((city) => (
                        <TouchableOpacity 
                          key={city.code} 
                          style={styles.suggestionItem} 
                          onPress={() => selectCity(city.nom)}
                        >
                          <MapPin size={16} color="#64748b" />
                          <Text style={styles.suggestionText}>{city.nom}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Catégorie</Text>
                  <View style={styles.categoryContainer}>
                    {categories.map(cat => {
                      const categoryInfo = CATEGORIES.find(c => c.value === cat);
                      return (
                        <TouchableOpacity 
                          key={cat} 
                          style={[
                            styles.catChip, 
                            pathData.difficulty === cat && styles.activeCatChip
                          ]}
                          onPress={() => setPathData({...pathData, difficulty: cat})}
                        >
                          <Text style={styles.catEmoji}>{categoryInfo?.icon}</Text>
                          <Text style={[
                            styles.catText, 
                            pathData.difficulty === cat && styles.activeCatText
                          ]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholderTextColor="#9ca3af" 
                    multiline 
                    numberOfLines={4}
                    placeholder="Décrivez votre parcours..." 
                    value={pathData.description} 
                    onChangeText={t => setPathData({...pathData, description: t})} 
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.primaryBtn} 
                  onPress={handleCreatePath}
                >
                  <Plus size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Créer le Parcours</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Liste des parcours existants */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Edit3 size={22} color="#0ea5e9" />
                <Text style={styles.sectionTitle}>Parcours existants ({paths.length})</Text>
              </View>

              {paths.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Aucun parcours créé pour le moment</Text>
                </View>
              ) : (
                <View style={styles.pathsList}>
                  {paths.map((path) => (
                    <View key={path._id} style={styles.pathCard}>
                      <View style={styles.pathCardContent}>
                        <View style={styles.pathInfo}>
                          <Text style={styles.pathTitle}>{path.title}</Text>
                          <Text style={styles.pathCity}>📍 {path.city}</Text>
                          <View style={styles.pathMeta}>
                            <Text style={styles.pathCategory}>
                              {CATEGORIES.find(c => c.value === path.difficulty)?.icon} {path.difficulty}
                            </Text>
                            <Text style={styles.pathQuests}>
                              {path.quests?.length || 0} étape(s)
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleDeletePath(path)} 
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* TAB QUÊTES */}
        {activeTab === 'quests' && (
          <>
            {/* Sélectionner un parcours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={22} color="#0ea5e9" />
                <Text style={styles.sectionTitle}>Parcours actif</Text>
              </View>

              {selectedPath ? (
                <View style={styles.selectedPathCard}>
                  <View style={styles.selectedPathHeader}>
                    <View style={styles.selectedPathInfo}>
                      <Text style={styles.selectedPathTitle}>{selectedPath.title}</Text>
                      <Text style={styles.selectedPathCity}>📍 {selectedPath.city}</Text>
                      <Text style={styles.selectedPathQuests}>
                        {selectedPath.quests?.length || 0} étape(s)
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setPathModalVisible(true)}
                      style={styles.changePathBtn}
                    >
                      <Edit3 size={18} color="#d97706" />
                      <Text style={styles.changePathText}>Changer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.selectPathBtn} 
                  onPress={() => setPathModalVisible(true)}
                >
                  <MapPin size={20} color="#0ea5e9" />
                  <Text style={styles.selectPathText}>Sélectionner un parcours</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Ajouter une étape */}
            {selectedPath && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Plus size={22} color="#d97706" />
                  <Text style={styles.sectionTitle}>Ajouter une étape</Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Titre de l'étape *</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Ex: La Porte Cailhau" 
                      placeholderTextColor="#9ca3af" 
                      value={questData.title} 
                      onChangeText={t => setQuestData({...questData, title: t})} 
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Consigne</Text>
                    <TextInput 
                      style={[styles.input, styles.textArea]} 
                      multiline 
                      numberOfLines={3}
                      placeholder="Ex: Trouvez la porte médiévale..." 
                      placeholderTextColor="#9ca3af" 
                      value={questData.description} 
                      onChangeText={t => setQuestData({...questData, description: t})} 
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Localisation *</Text>
                    <View style={styles.searchContainer}>
                      <TextInput 
                        style={styles.searchInput} 
                        placeholder="Rechercher une adresse..." 
                        placeholderTextColor="#9ca3af" 
                        value={addressSearch} 
                        onChangeText={setAddressSearch} 
                        onSubmitEditing={handleAddressSearch} 
                      />
                      <TouchableOpacity 
                        style={styles.searchBtn} 
                        onPress={handleAddressSearch}
                      >
                        {isSearching ? (
                          <ActivityIndicator color="#fff" size="small"/>
                        ) : (
                          <Text style={styles.searchBtnText}>🔍</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.mapContainer}>
                      <MapView 
                        style={styles.map} 
                        region={questLocation} 
                        onRegionChangeComplete={(region) => setQuestLocation(region)} 
                      />
                      <View style={styles.markerFixed}>
                        <View style={styles.markerRing} />
                        <View style={styles.markerDot} />
                      </View>
                    </View>
                    <Text style={styles.mapHint}>
                      💡 Déplacez la carte pour ajuster la position
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={handleCreateQuest}
                  >
                    <Plus size={20} color="#fff" />
                    <Text style={styles.primaryBtnText}>Ajouter l'étape</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Liste des étapes */}
            {selectedPath && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Edit3 size={22} color="#0ea5e9" />
                  <Text style={styles.sectionTitle}>
                    Étapes ({selectedPath.quests?.length || 0})
                  </Text>
                </View>

                {selectedPath.quests && selectedPath.quests.length > 0 ? (
                  <View style={styles.questsList}>
                    {selectedPath.quests.map((quest, index) => (
                      <View key={quest._id} style={styles.questCard}>
                        <View style={styles.questCardContent}>
                          <View style={styles.questNumber}>
                            <Text style={styles.questNumberText}>{index + 1}</Text>
                          </View>
                          <View style={styles.questInfo}>
                            <Text style={styles.questTitle}>{quest.title}</Text>
                            {quest.description && (
                              <Text style={styles.questDescription} numberOfLines={2}>
                                {quest.description}
                              </Text>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => handleDeleteQuest(quest._id)} 
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Aucune étape pour ce parcours</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de sélection de parcours */}
      <Modal visible={pathModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un parcours</Text>
            
            {paths.length === 0 ? (
              <View style={styles.emptyModalState}>
                <AlertTriangle size={40} color="#f59e0b" />
                <Text style={styles.emptyModalText}>
                  Aucun parcours disponible. Créez-en un d'abord !
                </Text>
              </View>
            ) : (
              <FlatList 
                data={paths} 
                keyExtractor={item => item._id}
                renderItem={({item}) => (
                  <TouchableOpacity 
                    style={[
                      styles.modalItem,
                      selectedPath?._id === item._id && styles.modalItemSelected
                    ]}
                    onPress={() => { 
                      setSelectedPath(item); 
                      setPathModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemTitle}>{item.title}</Text>
                      <Text style={styles.modalItemCity}>📍 {item.city}</Text>
                      <Text style={styles.modalItemQuests}>
                        {item.quests?.length || 0} étape(s)
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setPathModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav navigation={navigation} activeRoute="AdminPanel" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  headerContent: {
    flex: 1
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#d97706'
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b'
  },
  activeTabText: {
    color: '#d97706'
  },

  content: { 
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 120
  },

  // Sections
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },

  formGroup: {
    marginBottom: 20
  },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: 8,
    letterSpacing: 0.3
  },
  input: { 
    backgroundColor: '#ffffff', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    color: '#1e293b'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },

  categoryContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10
  },
  catChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 25, 
    backgroundColor: '#f8fafc', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0'
  },
  activeCatChip: { 
    backgroundColor: '#fff7ed', 
    borderColor: '#d97706'
  },
  catEmoji: {
    fontSize: 16,
    marginRight: 6
  },
  catText: { 
    fontSize: 13, 
    color: '#64748b', 
    fontWeight: '600' 
  },
  activeCatText: { 
    color: '#d97706',
    fontWeight: '700'
  },

  suggestionsBox: { 
    backgroundColor: '#fff', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    marginTop: 8,
    overflow: 'hidden'
  },
  suggestionItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9'
  },
  suggestionText: { 
    color: '#334155',
    fontSize: 15,
    marginLeft: 8
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#d97706',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d97706',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
  },

  // Paths List
  pathsList: {
    gap: 12
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  pathCardContent: {
    flex: 1
  },
  pathInfo: {
    flex: 1
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4
  },
  pathCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8
  },
  pathMeta: {
    flexDirection: 'row',
    gap: 12
  },
  pathCategory: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  pathQuests: {
    fontSize: 12,
    color: '#0ea5e9',
    fontWeight: '600',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 12
  },

  // Selected Path
  selectedPathCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#bae6fd'
  },
  selectedPathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  selectedPathInfo: {
    flex: 1
  },
  selectedPathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 4
  },
  selectedPathCity: {
    fontSize: 14,
    color: '#075985',
    marginBottom: 4
  },
  selectedPathQuests: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '600'
  },
  changePathBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d97706'
  },
  changePathText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d97706'
  },
  selectPathBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0ea5e9'
  },
  selectPathText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0ea5e9'
  },

  // Search Container
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b'
  },
  searchBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 20,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60
  },
  searchBtnText: {
    fontSize: 20
  },

  // Map
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    position: 'relative',
    marginBottom: 8
  },
  map: {
    width: '100%',
    height: '100%'
  },
  markerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  markerRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.2)'
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d97706',
    position: 'absolute'
  },
  mapHint: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic'
  },

  // Quests List
  questsList: {
    gap: 10
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  questCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  questNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d97706',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  questNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  questInfo: {
    flex: 1
  },
  questTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2
  },
  questDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18
  },

  // Empty States
  emptyCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed'
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center'
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center'
  },
  emptyModalState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12
  },
  emptyModalText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff'
  },
  modalItemSelected: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9'
  },
  modalItemContent: {
    flex: 1
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4
  },
  modalItemCity: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2
  },
  modalItemQuests: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  },
  closeBtn: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center'
  },
  closeBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16
  }
});