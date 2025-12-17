import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import authService from '../services/authService';
import errorHandler from '../utils/errorHandler';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement de l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await storage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erreur chargement user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginInput, password) => {
    try {
      const response = await authService.login(loginInput, password);
      const userData = response.data || response;
      
      await storage.saveUser(userData);
      setUser(userData);
      
      return userData;
    } catch (error) {
      errorHandler.handle(error, 'Erreur de connexion');
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      await authService.register(formData);
      return true;
    } catch (error) {
      errorHandler.handle(error, 'Erreur lors de l\'inscription');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeUser();
      setUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await storage.saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erreur mise à jour user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      await storage.saveUser(userData);
      setUser(userData);
    } catch (error) {
      errorHandler.handle(error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser,
        isLoading, 
        login, 
        register,
        logout, 
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};