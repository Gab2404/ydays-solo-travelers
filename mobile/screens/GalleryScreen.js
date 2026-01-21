import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  ScrollView, Image, Dimensions, Alert, Modal, Pressable // Ajout de Modal et Pressable
} from 'react-native';
import { ArrowLeft, Download, Calendar, MapPin, X } from 'lucide-react-native'; // Ajout de X pour fermer
import galleryService from '../services/galleryService';
import errorHandler from '../utils/errorHandler';
import BottomNav from '../components/BottomNav';
import api from '../utils/api';

const { width, height } = Dimensions.get('window'); // Récupération de la hauteur pour le plein écran
const PHOTO_SIZE = (width - 48) / 2;

export default function GalleryScreen({ route, navigation }) {
  const { pathId } = route.params;
  const [gallery, setGallery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Nouvel état pour la photo en grand écran
  const [selectedFullScreenPhoto, setSelectedFullScreenPhoto] = useState(null);

  const serverURL = api.defaults.baseURL.replace(/\/api$/, '');

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
      '📸 Enregistrer les souvenirs',
      `Voulez-vous enregistrer ces ${gallery.photos.length} photos directement dans votre galerie photo ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Enregistrer',
          onPress: async () => {
            try {
              setIsDownloading(true);
              await galleryService.saveAllPhotosToLibrary(gallery.photos);
              Alert.alert('✅ Succès', 'Toutes les photos sont dans votre album !');
            } catch (error) {
              errorHandler.handle(error, 'Erreur lors de la sauvegarde');
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
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!gallery) return null;

  return (
    <View style={styles.container}>
      {/* Modal pour le Plein Écran */}
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
            <X size={30} color="#fff" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: selectedFullScreenPhoto }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>Ma galerie</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {gallery.pathTitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.congratsContainer}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={styles.congratsText}>Parcours terminé !</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MapPin size={18} color="#f97316" />
              <Text style={styles.infoItemText}>{gallery.pathCity}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={18} color="#f97316" />
              <Text style={styles.infoItemText}>
                {formatDate(gallery.completedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{gallery.photos.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{gallery.totalQuests}</Text>
              <Text style={styles.statLabel}>Étapes</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
            onPress={handleDownloadGallery}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Download size={20} color="#fff" />
            )}
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Enregistrement...' : 'Enregistrer dans mes photos'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.photosSection}>
          <Text style={styles.photosSectionTitle}>
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
                  onPress={() => setSelectedFullScreenPhoto(imgUri)} // Clic pour agrandir
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
                    <Text style={styles.photoTitle} numberOfLines={2}>
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
  // ... Vos styles existants ...
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1 },
  headerSubtitle: { fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  content: { padding: 16, paddingBottom: 100 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  congratsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, paddingVertical: 12, backgroundColor: '#fef3c7', borderRadius: 12 },
  congratsEmoji: { fontSize: 24 },
  congratsText: { fontSize: 18, fontWeight: '700', color: '#b45309' },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  infoItemText: { fontSize: 13, fontWeight: '600', color: '#1e293b', flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#f97316', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  downloadButton: { backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 4 },
  downloadButtonDisabled: { opacity: 0.6 },
  downloadButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  photosSection: { marginBottom: 20 },
  photosSectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoCard: { width: PHOTO_SIZE, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  photoImage: { width: '100%', height: PHOTO_SIZE, backgroundColor: '#f3f4f6' },
  photoOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  photoNumber: { color: '#fff', fontSize: 12, fontWeight: '700' },
  photoInfo: { padding: 12 },
  photoTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 4 },

  // Nouveaux styles pour la Modal Plein Écran
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  }
});