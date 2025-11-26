import axios from 'axios';

// Charge l'IP depuis le fichier .env, sinon utilise localhost par défaut
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
});

export default api;