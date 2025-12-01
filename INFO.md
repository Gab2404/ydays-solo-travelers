# 🚀 Guide de Migration - Architecture MVC

## 📁 Nouvelle Structure Backend

```
backend/
├── server.js                     ✅ Déjà fait
├── config/
│   └── database.js               🆕 Configuration MongoDB
├── models/
│   ├── User.js                   📝 Mis à jour (timestamps, index)
│   ├── Path.js                   📝 Mis à jour (enum, index)
│   └── Quest.js                  📝 Mis à jour (validation GPS)
├── routes/
│   ├── auth.js                   🆕 Routes authentification
│   ├── paths.js                  🆕 Routes parcours
│   ├── quests.js                 🆕 Routes quêtes
│   └── users.js                  ✅ Déjà fait
├── controllers/
│   ├── authController.js         🆕 Logique auth
│   ├── pathController.js         🆕 Logique parcours
│   ├── questController.js        🆕 Logique quêtes
│   └── userController.js         🆕 Logique utilisateur
├── middleware/
│   ├── auth.js                   🆕 Protection JWT
│   └── errorHandler.js           🆕 Gestion erreurs
└── utils/
    └── validation.js             🆕 Validations
```

---

## 🔧 Fichiers à Supprimer

### Backend (ancien)
```bash
❌ backend/auth.js          → Remplacé par routes/auth.js + controllers/authController.js
❌ backend/game_temp.js     → Remplacé par routes/paths.js + routes/quests.js + controllers
```

---

## 📦 Installation Backend

```bash
cd backend
npm install express mongoose cors dotenv jsonwebtoken bcryptjs
npm install -D nodemon
```

---

## ⚙️ Configuration

### 1. Créer le fichier `.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/travelquest
JWT_SECRET=ton_secret_jwt_ultra_securise_ici_2024
```

### 2. Générer un JWT Secret sécurisé

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔄 Changements Principaux

### 🔐 Authentification JWT

**Avant** : Pas de token, utilisateur stocké en local uniquement
**Après** : Token JWT généré à la connexion et envoyé dans les headers

#### Exemple de réponse login/register :
```json
{
  "_id": "123abc",
  "email": "user@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "role": "joueur",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Protection des routes
- **Routes publiques** : Login, Register, GET parcours
- **Routes protégées** : Profil utilisateur, validation quêtes
- **Routes admin** : Création/modification/suppression parcours/quêtes

---

### 📱 API Frontend (mobile/utils/api.js)

Ton fichier **api.js est déjà bon** ! ✅ Il envoie automatiquement le token JWT.

#### Utilisation dans les screens :

```javascript
import { pathAPI, questAPI, userAPI, authAPI } from '../utils/api';

// Login
const handleLogin = async () => {
  try {
    const res = await authAPI.login({ login: email, password });
    await AsyncStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data); // Contient le token
  } catch (err) {
    Alert.alert('Erreur', err.response?.data?.message || 'Connexion échouée');
  }
};

// Récupérer parcours
const fetchPaths = async () => {
  try {
    const res = await pathAPI.getByCity('Bordeaux');
    setPaths(res.data);
  } catch (err) {
    console.error(err);
  }
};

// Valider une quête
const handleCompleteQuest = async (questId) => {
  try {
    await userAPI.completeQuest(questId);
    Alert.alert('Bravo !', 'Quête validée');
  } catch (err) {
    Alert.alert('Erreur', err.response?.data?.message);
  }
};
```

---

## 🎯 Routes API Disponibles

### 🔓 Authentification (Public)
```
POST   /api/auth/register     → Inscription
POST   /api/auth/login        → Connexion
GET    /api/auth/me           → Profil (protégé)
```

### 🗺️ Parcours (Public GET, Admin POST/PUT/DELETE)
```
GET    /api/paths              → Tous les parcours (query: ?city=Bordeaux)
GET    /api/paths/:id          → Parcours par ID
GET    /api/paths/city/:city   → Parcours par ville
POST   /api/paths              → Créer (admin)
PUT    /api/paths/:id          → Modifier (admin)
DELETE /api/paths/:id          → Supprimer (admin)
```

### 🎯 Quêtes (Public GET, Admin POST/PUT/DELETE)
```
GET    /api/quests/path/:pathId  → Quêtes d'un parcours
POST   /api/quests               → Créer (admin)
PUT    /api/quests/:id           → Modifier (admin)
DELETE /api/quests/:id           → Supprimer (admin)
```

### 👤 Utilisateur (Protégé)
```
GET    /api/users/profile                  → Profil
PUT    /api/users/profile                  → Modifier profil
POST   /api/users/complete-quest/:questId  → Valider quête
GET    /api/users/history                  → Historique
```

---

## 🔄 Migration des Screens

### AdminPanelScreen.js

**Avant** :
```javascript
import api from '../utils/api';
const res = await api.post('/game/paths', pathData);
const res = await api.get('/game/paths');
```

**Après** :
```javascript
import { pathAPI, questAPI } from '../utils/api';

// Créer parcours
const res = await pathAPI.create(pathData);

// Récupérer parcours
const res = await pathAPI.getAll();

// Créer quête
await questAPI.create({
  ...questData,
  pathId: selectedPath._id,
  location: { lat: questLocation.latitude, lng: questLocation.longitude }
});

// Supprimer quête
await questAPI.delete(questId);

// Supprimer parcours
await pathAPI.delete(selectedPath._id);
```

---

### DashboardScreen.js

**Avant** :
```javascript
const res = await api.get('/game/paths');
```

**Après** :
```javascript
import { pathAPI } from '../utils/api';

const res = await pathAPI.getByCity(city);
// ou
const res = await pathAPI.getAll();
```

---

### PathDetailScreen.js / RoadmapScreen.js / MapScreen.js

**Avant** :
```javascript
const res = await api.get(`/game/paths/${id}`);
```

**Après** :
```javascript
import { pathAPI } from '../utils/api';

const res = await pathAPI.getById(id);
```

---

### LoginScreen.js

**Avant** :
```javascript
const res = await api.post('/auth/login', { login, password });
await AsyncStorage.setItem('user', JSON.stringify(res.data));
```

**Après** : (IDENTIQUE - déjà bon !)
```javascript
import { authAPI } from '../utils/api';

const res = await authAPI.login({ login, password });
await AsyncStorage.setItem('user', JSON.stringify(res.data)); // ✅ Stocke le token
setUser(res.data);
```

---

### RegisterScreen.js

**Avant** :
```javascript
await api.post('/auth/register', formData);
```

**Après** :
```javascript
import { authAPI } from '../utils/api';

await authAPI.register(formData);
```

---

## ✅ Avantages de la Nouvelle Architecture

### Backend
- ✅ **Séparation des responsabilités** (MVC)
- ✅ **Code réutilisable** (controllers)
- ✅ **Sécurité JWT** (protection routes)
- ✅ **Validations centralisées** (utils/validation.js)
- ✅ **Gestion d'erreurs propre** (middleware errorHandler)
- ✅ **Index MongoDB** (performances)

### Frontend
- ✅ **API organisée** (authAPI, pathAPI, questAPI, userAPI)
- ✅ **Token automatique** (intercepteur axios)
- ✅ **Gestion erreurs** (try/catch + messages)
- ✅ **Code maintenable**

---

## 🚨 Points d'Attention

### 1. Hachage Mot de Passe

**IMPORTANT** : Pour la production, installe `bcryptjs` et hash les mots de passe !

```javascript
// Dans authController.js
const bcrypt = require('bcryptjs');

// Register
const salt = await bcrypt.genSalt(10);
newUser.password = await bcrypt.hash(password, salt);

// Login
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });
```

### 2. Stockage du Token

Le token est stocké dans AsyncStorage avec l'utilisateur :
```json
{
  "_id": "123",
  "email": "user@example.com",
  "token": "eyJhbG..."
}
```

L'intercepteur axios le récupère automatiquement pour chaque requête.

### 3. Protection Admin

Les routes de création/modification/suppression sont protégées par le middleware `admin` :

```javascript
router.post('/', protect, admin, createPath);
```

Seuls les utilisateurs avec `role: 'admin'` peuvent y accéder.

---

## 🎓 Résumé des Changements par Fichier

| Fichier Frontend | Import Avant | Import Après |
|-----------------|--------------|--------------|
| AdminPanelScreen | `import api from '../utils/api'` | `import { pathAPI, questAPI } from '../utils/api'` |
| DashboardScreen | `import api from '../utils/api'` | `import { pathAPI } from '../utils/api'` |
| LoginScreen | `import api from '../utils/api'` | `import { authAPI } from '../utils/api'` |
| RegisterScreen | `import api from '../utils/api'` | `import { authAPI } from '../utils/api'` |
| PathDetailScreen | `import api from '../utils/api'` | `import { pathAPI } from '../utils/api'` |
| RoadmapScreen | `import api from '../utils/api'` | `import { pathAPI, userAPI } from '../utils/api'` |
| MapScreen | `import api from '../utils/api'` | `import { pathAPI, userAPI } from '../utils/api'` |

---

## 🚀 Étapes de Migration

1. ✅ Copier les nouveaux fichiers backend
2. ✅ Créer le fichier `.env` avec JWT_SECRET
3. ✅ Supprimer `auth.js` et `game_temp.js`
4. ✅ Mettre à jour les models (User, Path, Quest)
5. ✅ Redémarrer le serveur : `npm run dev`
6. ✅ Mettre à jour les imports dans les screens frontend
7. ✅ Tester login/register (vérifier que le token est stocké)
8. ✅ Tester les parcours/quêtes (vérifier que le token est envoyé)

---

## 📞 Test Rapide

```bash
# 1. Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","firstname":"John","lastname":"Doe"}'

# 2. Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test@test.com","password":"123456"}'

# 3. Récupérer parcours
curl http://localhost:5000/api/paths?city=Bordeaux
```

---

## 🎉 Conclusion

Ton code est maintenant :
- **Professionnel** : Architecture MVC standard
- **Sécurisé** : JWT + protection routes
- **Maintenable** : Séparation frontend/backend
- **Évolutif** : Facile d'ajouter de nouvelles features

Bon courage pour la migration ! 🚀