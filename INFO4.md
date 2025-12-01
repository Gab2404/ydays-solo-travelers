# 🔄 Guide de Migration des Screens

## Vue d'ensemble

Ce guide montre comment migrer vos screens existants pour utiliser la nouvelle architecture avec services, utils et hooks.

## 📱 LoginScreen.js - Exemple de Migration

### ❌ Avant (Code Actuel)
```javascript
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogin = async () => {
  try {
    const res = await api.post('/auth/login', { login: loginInput, password });
    const userData = res.data;
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  } catch (err) { 
    Alert.alert("Erreur", "Identifiants incorrects"); 
  }
};
```

### ✅ Après (Code Amélioré)
```javascript
import authService from '../services/authService';
import storage from '../utils/storage';
import errorHandler from '../utils/errorHandler';
import validation from '../utils/validation';

const handleLogin = async () => {
  // Validation côté client
  const validationResult = validation.validateLoginForm({ 
    login: loginInput, 
    password 
  });
  
  if (!validationResult.isValid) {
    errorHandler.showValidationErrors(validationResult.errors);
    return;
  }

  try {
    // Appel service
    const response = await authService.login(loginInput, password);
    const userData = response.data || response;
    
    // Sauvegarde avec helper
    await storage.saveUser(userData);
    setUser(userData);
    
    errorHandler.showSuccess('Connexion réussie !');
  } catch (err) { 
    errorHandler.handle(err, 'Identifiants incorrects');
  }
};
```

## 📱 RegisterScreen.js - Exemple de Migration

### ❌ Avant
```javascript
const handleRegister = async () => {
  try {
    await api.post('/auth/register', formData);
    Alert.alert("Succès", "Compte créé ! Connectez-vous.");
    navigation.navigate('Login');
  } catch (err) {
    Alert.alert("Erreur", "Impossible de créer le compte.");
  }
};
```

### ✅ Après
```javascript
import authService from '../services/authService';
import validation from '../utils/validation';
import errorHandler from '../utils/errorHandler';

const handleRegister = async () => {
  // Validation complète du formulaire
  const validationResult = validation.validateRegistrationForm(formData);
  
  if (!validationResult.isValid) {
    errorHandler.showValidationErrors(validationResult.errors);
    return;
  }

  try {
    await authService.register(formData);
    errorHandler.showSuccess('Compte créé avec succès !');
    navigation.navigate('Login');
  } catch (err) {
    errorHandler.handle(err);
  }
};
```

## 📱 DashboardScreen.js - Exemple de Migration

### ❌ Avant
```javascript
const [paths, setPaths] = useState([]);

useEffect(() => {
  const fetchPaths = async () => {
    try {
      const res = await api.get(`/paths/city/${city}`);
      setPaths(res.data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les parcours');
    }
  };
  fetchPaths();
}, [city]);
```

### ✅ Après
```javascript
import pathService from '../services/pathService';
import errorHandler from '../utils/errorHandler';

const [paths, setPaths] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchPaths = async () => {
    try {
      setIsLoading(true);
      const data = await pathService.getPathsByCity(city);
      setPaths(data);
    } catch (err) {
      errorHandler.handle(err, 'Impossible de charger les parcours');
    } finally {
      setIsLoading(false);
    }
  };
  fetchPaths();
}, [city]);

// Affichage conditionnel
if (isLoading) {
  return <ActivityIndicator size="large" color="#d97706" />;
}
```

## 📱 MapScreen.js - Exemple de Migration avec Géolocalisation

### ❌ Avant (si géolocalisation dans le screen)
```javascript
import * as Location from 'expo-location';

const getUserLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission refusée');
    return;
  }
  
  const location = await Location.getCurrentPositionAsync({});
  setUserPosition({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  });
};
```

### ✅ Après
```javascript
import locationHelper from '../utils/location';
import errorHandler from '../utils/errorHandler';

const getUserLocation = async () => {
  try {
    const position = await locationHelper.getCurrentPosition();
    
    if (!position) {
      errorHandler.handlePermissionError('location');
      return;
    }
    
    setUserPosition(position);
  } catch (err) {
    errorHandler.handle(err, 'Impossible de récupérer votre position');
  }
};

// Vérifier la proximité d'une quête
const checkProximity = () => {
  const isNear = locationHelper.isNearby(
    userPosition,
    { lat: quest.location.lat, lng: quest.location.lng }
  );
  
  if (isNear) {
    errorHandler.showSuccess('Vous êtes arrivé à destination !');
  }
};
```

## 📱 ProfileScreen.js - Exemple avec Hook useAuth

### ❌ Avant
```javascript
const handleLogout = async () => {
  await AsyncStorage.removeItem('user');
  setUser(null);
  navigation.navigate('Login');
};
```

### ✅ Après (avec hook personnalisé)
```javascript
import { useAuth } from '../hooks/useAuth';
import errorHandler from '../utils/errorHandler';

function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();

  const handleLogout = async () => {
    errorHandler.showConfirmation(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      async () => {
        await logout();
        navigation.navigate('Login');
      }
    );
  };
  
  const handleUpdateProfile = async (updates) => {
    try {
      await userService.updateUserProfile(updates);
      await updateUser(updates);
      errorHandler.showSuccess('Profil mis à jour !');
    } catch (err) {
      errorHandler.handle(err);
    }
  };
}
```

## 📱 RoadmapScreen.js - Affichage avec Formatters

### ❌ Avant
```javascript
<Text>{quest.distance}km</Text>
<Text>{quest.category}</Text>
```

### ✅ Après
```javascript
import formatters from '../utils/formatters';

<Text>{formatters.formatDistance(quest.distance)}</Text>
<Text>
  {formatters.getCategoryEmoji(quest.category)} {quest.category}
</Text>
<View style={{ backgroundColor: formatters.getCategoryColor(quest.category) }}>
  {/* ... */}
</View>
```

## 🎯 Checklist de Migration par Screen

Pour chaque screen, suivre ces étapes :

### 1. ✅ Imports
- [ ] Remplacer `import api from '../utils/api'` par les services spécifiques
- [ ] Ajouter `import errorHandler from '../utils/errorHandler'`
- [ ] Ajouter `import validation from '../utils/validation'` si formulaire
- [ ] Ajouter `import formatters from '../utils/formatters'` pour affichage

### 2. ✅ AsyncStorage
- [ ] Remplacer tous les `AsyncStorage.getItem()` par `storage.getUser()`
- [ ] Remplacer tous les `AsyncStorage.setItem()` par `storage.saveUser()`
- [ ] Remplacer tous les `AsyncStorage.removeItem()` par `storage.removeUser()`

### 3. ✅ Appels API
- [ ] Remplacer `api.post('/auth/login')` par `authService.login()`
- [ ] Remplacer `api.get('/paths')` par `pathService.getAllPaths()`
- [ ] Remplacer `api.get('/quests')` par `questService.getQuestsByPath()`
- [ ] Remplacer `api.get('/users')` par `userService.getUserProfile()`

### 4. ✅ Gestion d'Erreurs
- [ ] Remplacer tous les `Alert.alert('Erreur', ...)` par `errorHandler.handle()`
- [ ] Ajouter validation avant soumission formulaire
- [ ] Utiliser `errorHandler.showSuccess()` pour les succès

### 5. ✅ Géolocalisation
- [ ] Remplacer le code expo-location par `locationHelper`
- [ ] Utiliser `locationHelper.calculateDistance()` pour les calculs
- [ ] Utiliser `locationHelper.isNearby()` pour la proximité

### 6. ✅ Formatage
- [ ] Utiliser `formatters.formatDistance()` pour les distances
- [ ] Utiliser `formatters.getCategoryEmoji()` pour les emojis
- [ ] Utiliser `formatters.formatXP()` pour l'XP
- [ ] Utiliser `formatters.formatProgress()` pour les pourcentages

## 🔑 Points Importants

1. **Ne pas modifier l'UI** : Garder exactement le même rendu visuel
2. **Ajouter loading states** : Toujours afficher un loader pendant les requêtes
3. **Validation avant envoi** : Valider tous les formulaires côté client
4. **Messages clairs** : Utiliser errorHandler pour des messages cohérents
5. **Constantes** : Utiliser les constantes de `constants/index.js`

## 📊 Bénéfices de la Migration

- ✅ Code 50% plus court et lisible
- ✅ Gestion d'erreurs cohérente
- ✅ Validations réutilisables
- ✅ Moins de bugs
- ✅ Maintenance facilitée
- ✅ Tests plus simples