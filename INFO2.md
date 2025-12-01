# 🏗️ Guide d'Architecture - Travel Quest

## 📂 Structure Complète

### Backend
```
backend/
├── server.js                    # Point d'entrée serveur
├── config/
│   └── database.js             # Configuration MongoDB
├── models/
│   ├── User.js                 # Modèle utilisateur
│   ├── Path.js                 # Modèle parcours
│   └── Quest.js                # Modèle quête
├── routes/
│   ├── auth.js                 # Routes authentification
│   ├── paths.js                # Routes parcours
│   ├── quests.js               # Routes quêtes
│   └── users.js                # Routes utilisateurs
├── controllers/
│   ├── authController.js       # Logique auth
│   ├── pathController.js       # Logique parcours
│   ├── questController.js      # Logique quêtes
│   └── userController.js       # Logique utilisateurs
├── services/                    # ⭐ NOUVEAU
│   ├── pathService.js          # Logique métier parcours
│   ├── questService.js         # Logique métier quêtes
│   └── userService.js          # Logique métier utilisateurs
├── middleware/
│   ├── auth.js                 # Protection JWT + admin
│   └── errorHandler.js         # Gestion erreurs
└── utils/
    ├── validation.js           # Validations
    ├── tokenUtils.js           # ⭐ NOUVEAU - Gestion tokens
    ├── passwordUtils.js        # ⭐ NOUVEAU - Hash passwords
    └── responseFormatter.js    # ⭐ NOUVEAU - Formatage réponses
```

### Frontend
```
frontend/
├── App.js                      # Point d'entrée app
├── screens/                    # Écrans (existants)
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── CitySelectionScreen.js
│   ├── DashboardScreen.js
│   ├── PathDetailScreen.js
│   ├── RoadmapScreen.js
│   ├── MapScreen.js
│   ├── AdminPanelScreen.js
│   └── ProfileScreen.js
├── services/                   # ⭐ NOUVEAU - Appels API
│   ├── authService.js          # Service authentification
│   ├── pathService.js          # Service parcours
│   ├── questService.js         # Service quêtes
│   └── userService.js          # Service utilisateurs
├── hooks/                      # ⭐ NOUVEAU - Hooks personnalisés
│   └── useAuth.js              # Hook authentification
├── utils/                      # ⭐ NOUVEAU - Utilitaires
│   ├── api.js                  # Configuration Axios + intercepteurs
│   ├── storage.js              # Gestion AsyncStorage
│   ├── location.js             # Gestion géolocalisation
│   ├── formatters.js           # Formatage données affichage
│   ├── validation.js           # Validations côté client
│   └── errorHandler.js         # Gestion erreurs
├── constants/                  # ⭐ NOUVEAU - Constantes
│   └── index.js                # Config, couleurs, validations
└── context/                    # Contextes existants
    └── AuthContext.js
```

## 🔄 Séparation des Responsabilités

### Backend - Ce qui DOIT y rester
✅ **Logique métier** (services/)
- Calculs complexes (XP, progression, distance)
- Règles métier (validation de quêtes, badges)
- Agrégations de données

✅ **Sécurité**
- Authentification JWT
- Hash des mots de passe (bcrypt)
- Protection des routes admin

✅ **Accès base de données**
- Toutes les opérations CRUD
- Requêtes complexes avec populate
- Transactions

✅ **Validation serveur**
- Validation stricte des données
- Vérification des permissions

### Frontend - Ce qui DOIT y rester
✅ **Interface utilisateur**
- Tous les composants React Native
- Navigation entre écrans
- Affichage des données

✅ **Expérience utilisateur**
- Gestion du state local
- Animations et transitions
- Retours visuels (loading, succès, erreurs)

✅ **Validation client** (légère)
- Validation de formulaires avant envoi
- Messages d'erreur immédiats

✅ **Géolocalisation**
- Récupération position GPS
- Calculs de distance (pour affichage)

## 📋 Checklist Migration

### ✅ Fichiers Backend créés
- [x] `utils/tokenUtils.js` - Gestion tokens JWT
- [x] `utils/passwordUtils.js` - Hash passwords avec bcrypt
- [x] `utils/responseFormatter.js` - Formatage réponses standardisées
- [x] `services/pathService.js` - Logique métier parcours
- [x] `services/questService.js` - Logique métier quêtes
- [x] `services/userService.js` - Logique métier utilisateurs
- [x] `controllers/authController.js` (UPDATED) - Utilise nouveaux utils

### ✅ Fichiers Frontend créés
- [x] `utils/api.js` - Configuration Axios + intercepteurs
- [x] `services/authService.js` - Appels API auth
- [x] `services/pathService.js` - Appels API parcours
- [x] `services/questService.js` - Appels API quêtes
- [x] `services/userService.js` - Appels API utilisateurs
- [x] `utils/storage.js` - Gestion AsyncStorage
- [x] `utils/location.js` - Gestion géolocalisation
- [x] `utils/formatters.js` - Formatage affichage
- [x] `utils/validation.js` - Validations client
- [x] `utils/errorHandler.js` - Gestion erreurs
- [x] `constants/index.js` - Constantes globales
- [x] `hooks/useAuth.js` - Hook authentification

## 🔧 Installation Backend

```bash
cd backend
npm install bcryptjs  # Nouvelle dépendance pour hash passwords
```

## 🚀 Prochaines Étapes

1. **Installer bcryptjs** dans le backend
2. **Remplacer les imports** dans les screens existants :
   - Remplacer `api.post(...)` direct par `authService.login(...)`
   - Utiliser `storage.saveUser()` au lieu de `AsyncStorage.setItem()`
   - Utiliser `errorHandler.handle()` pour les erreurs
   
3. **Mettre à jour les controllers backend** pour utiliser les nouveaux services
4. **Tester l'application** complètement

## 📝 Exemples d'Utilisation

### Avant (dans LoginScreen.js)
```javascript
const res = await api.post('/auth/login', { login, password });
await AsyncStorage.setItem('user', JSON.stringify(res.data));
```

### Après (dans LoginScreen.js)
```javascript
import authService from '../services/authService';
import storage from '../utils/storage';
import errorHandler from '../utils/errorHandler';

const userData = await authService.login(login, password);
await storage.saveUser(userData);
```

## 🎯 Avantages de cette Architecture

1. **Séparation claire** : Backend = logique métier, Frontend = UI
2. **Maintenabilité** : Code organisé et facile à modifier
3. **Réutilisabilité** : Services et utils réutilisables
4. **Testabilité** : Chaque couche testable indépendamment
5. **Sécurité** : Logique sensible seulement côté serveur
6. **Performance** : Calculs lourds côté serveur

## ⚠️ Points d'Attention

- **Ne jamais** stocker de logique métier dans le frontend
- **Toujours** valider côté serveur même si validé côté client
- **Ne jamais** exposer de données sensibles dans le frontend
- **Toujours** utiliser HTTPS en production
- **Configurer** correctement l'URL API pour production dans `constants/index.js`