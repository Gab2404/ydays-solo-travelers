import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = 'http://172.20.10.4:5000/api'; // partage co
const API_URL = 'http://192.168.0.129:5000/api'; // IP Maison

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(async (config) => {
  try {
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.error("Erreur token mobile", e);
  }
  return config;
});

// === AUTH ===
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// === PARCOURS ===
export const pathAPI = {
  getAll: (city) => api.get('/paths', { params: { city } }),
  getById: (id) => api.get(`/paths/${id}`),
  getByCity: (city) => api.get(`/paths/city/${city}`),
  create: (data) => api.post('/paths', data),
  update: (id, data) => api.put(`/paths/${id}`, data),
  delete: (id) => api.delete(`/paths/${id}`),
};

// === QUÊTES ===
export const questAPI = {
  getByPath: (pathId) => api.get(`/quests/path/${pathId}`),
  create: (data) => api.post('/quests', data),
  update: (id, data) => api.put(`/quests/${id}`, data),
  delete: (id) => api.delete(`/quests/${id}`),
};

// === UTILISATEUR ===
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  completeQuest: (questId) => api.post(`/users/complete-quest/${questId}`),
  getHistory: () => api.get('/users/history'),
};

export default api;