import { useState, useEffect } from 'react';
import storage from '../utils/storage';
import authService from '../services/authService';
import errorHandler from '../utils/errorHandler';

/**
 * Hook personnalisé pour gérer l'authentification
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Charge l'utilisateur depuis le storage au montage
   */
  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Charge l'utilisateur depuis le storage
   */
  const loadUser = async () => {
    try {
      const storedUser = await storage.getUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion
   * @param {String} login - Email ou téléphone
   * @param {String} password - Mot de passe
   * @returns {Boolean} True si succès
   */
  const login = async (login, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(login, password);
      
      // Extraire les données utilisateur de la réponse
      const userData = response.data || response;
      
      await storage.saveUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      errorHandler.handle(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscription
   * @param {Object} userData - Données d'inscription
   * @returns {Boolean} True si succès
   */
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      // Extraire les données utilisateur de la réponse
      const newUserData = response.data || response;
      
      await storage.saveUser(newUserData);
      setUser(newUserData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      errorHandler.handle(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await storage.removeUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      errorHandler.handle(error);
    }
  };

  /**
   * Rafraîchit les données utilisateur
   */
  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      const userData = { ...user, ...response };
      await storage.saveUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Erreur rafraîchissement utilisateur:', error);
      // En cas d'erreur 401, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  /**
   * Met à jour les données utilisateur localement
   * @param {Object} updates - Mises à jour
   */
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await storage.saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      errorHandler.handle(error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateUser
  };
};