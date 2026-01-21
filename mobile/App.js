import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext, AuthContextProvider } from './context/AuthContext';
import { NavigationDirectionProvider, useNavigationDirection } from './context/NavigationContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CitySelectionScreen from './screens/CitySelectionScreen';
import DashboardScreen from './screens/DashboardScreen';
import PathDetailScreen from './screens/PathDetailScreen';
import RoadmapScreen from './screens/RoadmapScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import GalleryScreen from './screens/GalleryScreen';


const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);
  const { direction } = useNavigationDirection();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.certified;
  
  // Déterminer l'animation en fonction de la direction
  const animationType = direction === 'right' ? 'slide_from_right' : 'slide_from_left';

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: animationType,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="PathDetail" component={PathDetailScreen} />
          <Stack.Screen name="Roadmap" component={RoadmapScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Gallery" component={GalleryScreen} />
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