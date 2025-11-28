import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = 'http://172.20.10.4:5000/api';
const API_URL = 'http://192.168.0.129:5000/api'; // IP Maison

const api = axios.create({
  baseURL: API_URL,
});

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

export default api;