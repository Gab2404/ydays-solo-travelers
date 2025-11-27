import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CitySelectionScreen from './screens/CitySelectionScreen';
import DashboardScreen from './screens/DashboardScreen';
import PathDetailScreen from './screens/PathDetailScreen';
import GameSessionScreen from './screens/GameSessionScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import ProfileScreen from './screens/ProfileScreen'; // <-- Import du profil

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Group>
            {/* 1. Choix Ville */}
            <Stack.Screen name="CitySelection">
              {props => <CitySelectionScreen {...props} user={user} setUser={setUser} />}
            </Stack.Screen>
            
            {/* 2. Liste Parcours */}
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            
            {/* 3. Détails Parcours */}
            <Stack.Screen name="PathDetail" component={PathDetailScreen} />
            
            {/* 4. Jeu (Map) */}
            <Stack.Screen name="GameSession" component={GameSessionScreen} />
            
            {/* 5. Profil (NOUVELLE ROUTE) */}
            <Stack.Screen name="Profile">
              {props => <ProfileScreen {...props} user={user} setUser={setUser} />}
            </Stack.Screen>
            
            {/* Admin */}
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}