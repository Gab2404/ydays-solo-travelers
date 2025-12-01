import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de base
// const API_URL = 'http://172.20.10.4:5000/api'; // partage co
const API_URL = 'http://192.168.0.129:5000/api'; // IP Maison

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  async (config) => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - déconnecter l'utilisateur
      await AsyncStorage.removeItem('user');
      // Vous pouvez aussi rediriger vers la page de connexion ici
    }
    return Promise.reject(error);
  }
);

export default api;