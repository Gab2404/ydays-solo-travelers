import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  ScrollView, Image, Dimensions, Alert, Modal, Pressable
} from 'react-native';
import { ArrowLeft, Download, Calendar, MapPin, X, Award } from 'lucide-react-native'; 
import galleryService from '../services/galleryService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

const { width, height } = Dimensions.get('window'); 
const PHOTO_SIZE = (width - 48) / 2;

export default function GalleryScreen({ route, navigation }) {
  const { pathId } = route.params;
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFullScreenPhoto, setSelectedFullScreenPhoto] = useState(null);

  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

  // CHARTE VASCO (Couleurs)
  const COLORS = {
    orange: '#ED6F2D', 
    darkGreen: '#214347', 
    teal: '#43868D', 
    bg: '#F8FAFC',
    white: '#FFFFFF',
    border: '#E2E8F0',
    lightOrange: '#FFF7ED'
  };

  useEffect(() => {
    fetchGallery();
  }, [pathId]);

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      const data = await galleryService.getPathGallery(pathId);
      setGallery(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger la galerie');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadGallery = async () => {
    if (!gallery || gallery.photos.length === 0) return;

    Alert.alert(
      '📸 Enregistrer',
      `Sauvegarder ces ${gallery.photos.length} photos dans votre téléphone ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, enregistrer',
          onPress: async () => {
            try {
              setIsDownloading(true);
              await galleryService.saveAllPhotosToLibrary(gallery.photos);
              Alert.alert('✅ Succès', 'Photos enregistrées !');
            } catch (error) {
              errorHandler.handle(error, 'Erreur sauvegarde');
            } finally {
              setIsDownloading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange} />
      </View>
    );
  }

  if (!gallery) return null;

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      
      {/* MODAL PLEIN ÉCRAN SIMPLIFIÉE */}
      <Modal
        visible={!!selectedFullScreenPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFullScreenPhoto(null)}
      >
        <Pressable 
          style={styles.modalBackground} 
          onPress={() => setSelectedFullScreenPhoto(null)}
        >
          <TouchableOpacity 
            style={styles.closeModalButton} 
            onPress={() => setSelectedFullScreenPhoto(null)}
          >
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: selectedFullScreenPhoto }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.darkGreen} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerSubtitle, { color: COLORS.teal }]}>MA GALERIE</Text>
          <Text style={[styles.headerTitle, { color: COLORS.darkGreen }]} numberOfLines={1}>
            {gallery.pathTitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        
        {/* CARTE D'INFO */}
        <View style={styles.infoCard}>
          <View style={[styles.congratsContainer, { backgroundColor: COLORS.lightOrange }]}>
            <Award size={24} color={COLORS.orange} />
            <Text style={[styles.congratsText, { color: COLORS.orange }]}>Parcours terminé !</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MapPin size={18} color={COLORS.teal} />
              <Text style={[styles.infoItemText, { color: COLORS.darkGreen }]}>
                {gallery.pathCity}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={18} color={COLORS.teal} />
              <Text style={[styles.infoItemText, { color: COLORS.darkGreen }]}>
                {formatDate(gallery.completedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: COLORS.border }]}>
              <Text style={[styles.statNumber, { color: COLORS.orange }]}>{gallery.photos.length}</Text>
              <Text style={[styles.statLabel, { color: COLORS.teal }]}>PHOTOS</Text>
            </View>
            <View style={[styles.statBox, { borderColor: COLORS.border }]}>
              <Text style={[styles.statNumber, { color: COLORS.orange }]}>{gallery.totalQuests}</Text>
              <Text style={[styles.statLabel, { color: COLORS.teal }]}>ÉTAPES</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.downloadButton, 
              { backgroundColor: COLORS.orange },
              isDownloading && styles.downloadButtonDisabled
            ]}
            onPress={handleDownloadGallery}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Download size={20} color={COLORS.white} />
            )}
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Enregistrement...' : 'Enregistrer dans mes photos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* GRILLE DE PHOTOS */}
        <View style={styles.photosSection}>
          <Text style={[styles.photosSectionTitle, { color: COLORS.darkGreen }]}>
            Mes souvenirs ({gallery.photos.length})
          </Text>

          <View style={styles.photosGrid}>
            {gallery.photos.map((photo, index) => {
              const imgUri = photo.photoUrl.startsWith('http') 
                ? photo.photoUrl 
                : `${serverURL}${photo.photoUrl.startsWith('/') ? '' : '/'}${photo.photoUrl}`;

              return (
                <TouchableOpacity 
                  key={photo.questId} 
                  style={styles.photoCard}
                  onPress={() => setSelectedFullScreenPhoto(imgUri)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <View style={styles.photoOverlay}>
                    <Text style={styles.photoNumber}>#{index + 1}</Text>
                  </View>
                  <View style={styles.photoInfo}>
                    <Text style={[styles.photoTitle, { color: COLORS.darkGreen }]} numberOfLines={1}>
                      {photo.questTitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Gallery" currentPathId={pathId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  },

  // HEADER
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerInfo: { flex: 1 },
  headerSubtitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginBottom: 4
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    marginTop: 0 
  },

  content: { padding: 20, paddingBottom: 100 },

  // INFO CARD AVEC OMBRE NOIRE SIMPLE
  infoCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 24, 
    shadowColor: '#000', // Ombre noire
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 4 
  },
  congratsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginBottom: 20, 
    paddingVertical: 12, 
    borderRadius: 16 
  },
  congratsText: { 
    fontSize: 18, 
    fontWeight: '800' 
  },
  
  infoRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  infoItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F8FAFC', 
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    borderRadius: 16 
  },
  infoItemText: { 
    fontSize: 13, 
    fontWeight: '600', 
    flex: 1 
  },

  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  statBox: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  statNumber: { 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },

  downloadButton: { 
    borderRadius: 16, 
    paddingVertical: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
    elevation: 4,
    // Ombre noire ici aussi
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 }
  },
  downloadButtonDisabled: { opacity: 0.6 },
  downloadButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  // PHOTOS GRID
  photosSection: { marginBottom: 20 },
  photosSectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 16,
    marginLeft: 4 
  },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  
  photoCard: { 
    width: (width - 56) / 2, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    overflow: 'hidden', 
    // Ombre noire simple sur les cartes
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3 
  },
  photoImage: { 
    width: '100%', 
    height: (width - 56) / 2, 
    backgroundColor: '#F1F5F9' 
  },
  photoOverlay: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  photoNumber: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  photoInfo: { padding: 12 },
  photoTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },

  // MODAL SIMPLE
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Fond presque noir complet
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.8,
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderRadius: 20
  }
});