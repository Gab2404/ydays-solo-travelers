import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext, AuthContextProvider } from './context/AuthContext';
import { NavigationDirectionProvider, useNavigationDirection } from './context/NavigationContext';

// --- NOUVEAUX SCREENS ---
import IntroScreen from './screens/IntroScreen'; 
import WelcomeScreen from './screens/WelcomeScreen'; // <-- C'est ici que se trouve ton auth fusionnée
import HomeScreen from './screens/HomeScreen';

// --- SCREENS CONNECTÉS ---
// import CitySelectionScreen from './screens/CitySelectionScreen';
import DashboardScreen from './screens/DashboardScreen';
import PathDetailScreen from './screens/PathDetailScreen';
import RoadmapScreen from './screens/RoadmapScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import GalleryScreen from './screens/GalleryScreen';
import GalleryAllScreen from './screens/GalleryAllScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);
  const { direction } = useNavigationDirection();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#214347' }}>
        <ActivityIndicator size="large" color="#ED6F2D" />
      </View>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.certified;
  
  // Déterminer l'animation en fonction de la direction (pour la navigation interne)
  const animationType = direction === 'right' ? 'slide_from_right' : 'slide_from_left';

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: animationType, // Par défaut, utilise ton contexte de direction
      }}
    >
      {!user ? (
        // === ZONE NON CONNECTÉ ===
        <>
          {/* 1. L'Intro s'affiche en premier au lancement */}
          <Stack.Screen 
            name="Intro" 
            component={IntroScreen} 
            options={{ animation: 'fade' }} 
          />
          
          {/* 2. Ensuite l'écran Welcome (qui contient maintenant Login/Register fusionnés) */}
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ animation: 'slide_from_right' }} 
          />
        </>
      ) : (
        // === ZONE CONNECTÉ ===
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="PathDetail" component={PathDetailScreen} />
          <Stack.Screen name="Roadmap" component={RoadmapScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Gallery" component={GalleryScreen} />
          <Stack.Screen name="GalleryAll" component={GalleryAllScreen} />
          {isAdmin && (
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <NavigationDirectionProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </NavigationDirectionProvider>
    </AuthContextProvider>
  );
}