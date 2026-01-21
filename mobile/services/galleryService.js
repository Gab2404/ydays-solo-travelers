import api from '../utils/api';
// Import legacy pour Expo 54
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const galleryService = {
  getPathGallery: async (pathId) => {
    try {
      const response = await api.get(`/gallery/path/${pathId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Enregistre toutes les photos directement dans la pellicule
   */
  saveAllPhotosToLibrary: async (photos) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error("Permission d'accès à la galerie refusée.");
      }

      // On récupère l'URL de base (ex: http://172.20.10.7:5000/api)
      const apiURL = api.defaults.baseURL; 
      // On retire le '/api' final pour pointer vers la racine du serveur où sont les fichiers statiques
      const serverURL = apiURL.replace(/\/api$/, ''); 

      console.log(`📸 Début de la sauvegarde de ${photos.length} photos...`);

      for (const photo of photos) {
        let fullUrl = photo.photoUrl;
        
        // Si l'URL n'est pas complète, on la construit proprement
        if (!fullUrl.startsWith('http')) {
          // On s'assure qu'il n'y a pas de double slash et on utilise serverURL
          const cleanPath = fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`;
          fullUrl = `${serverURL}${cleanPath}`;
        }

        const filename = `quest_${photo.questId}_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        console.log(`📥 Tentative de téléchargement : ${fullUrl}`);

        const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri);

        if (downloadResult.status === 200) {
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          console.log(`✅ Photo sauvegardée : ${filename}`);
        } else {
          // C'est ici que tu voyais le 404
          console.warn(`⚠️ Échec (Status ${downloadResult.status}) pour : ${fullUrl}`);
        }

        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde groupée:', error);
      throw error;
    }
  }
};

export default galleryService;