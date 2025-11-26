import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Save, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// Composant pour recentrer la carte quand on cherche une adresse
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if(lat && lng) map.flyTo([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
};

// Composant pour placer le marqueur au clic
const LocationMarker = ({ setPos, pos }) => {
  useMapEvents({
    click(e) { setPos(e.latlng); },
  });
  return pos ? <Marker position={pos} /> : null;
};

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [pathData, setPathData] = useState({ title: '', city: '', difficulty: 'Moyen', description: '' });
  const [paths, setPaths] = useState([]); 
  const [selectedPathId, setSelectedPathId] = useState('');
  
  // Gestion Adresse et Quête
  const [questLocation, setQuestLocation] = useState(null); // { lat, lng }
  const [addressSearch, setAddressSearch] = useState('');
  const [questData, setQuestData] = useState({ title: '', description: '', clue: '' });

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/game/paths');
        setPaths(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPaths();
  }, []);

  if (user?.role !== 'admin') {
    return <div className="p-10 text-red-500 text-center font-bold">⛔ Accès interdit.</div>;
  }

  const handleCreatePath = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/game/paths', { ...pathData, createdBy: user._id });
      setPaths([...paths, res.data]);
      alert(`Parcours "${res.data.title}" créé !`);
      setSelectedPathId(res.data._id);
      setPathData({ title: '', city: '', difficulty: 'Moyen', description: '' });
    } catch (err) { alert("Erreur création parcours"); }
  };

  // Fonction de recherche d'adresse (Geocoding)
  const searchAddress = async (e) => {
    e.preventDefault();
    if (!addressSearch) return;

    try {
      // Appel à l'API Nominatim (Gratuit, OpenStreetMap)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setQuestLocation(newPos); // Met à jour le marqueur
        // Le composant RecenterMap va détecter le changement et bouger la caméra
      } else {
        alert("Adresse introuvable ! Essayez d'être plus précis.");
      }
    } catch (error) {
      console.error("Erreur géocodage:", error);
      alert("Erreur lors de la recherche d'adresse.");
    }
  };

  const handleAddQuest = async (e) => {
    e.preventDefault();
    if (!selectedPathId) return alert("Sélectionne un parcours d'abord !");
    if (!questLocation) return alert("Place un point sur la carte !");

    try {
      await api.post('/game/quests', {
        ...questData,
        pathId: selectedPathId,
        location: { lat: questLocation.lat, lng: questLocation.lng }
      });
      alert(`Quête "${questData.title}" ajoutée !`);
      setQuestData({ title: '', description: '', clue: '' });
      setQuestLocation(null);
      setAddressSearch('');
    } catch (err) { alert("Erreur ajout quête"); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-red-600 mb-8 flex items-center">🛠️ Zone Game Master</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* GAUCHE : CRÉATION PARCOURS */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center"><MapPin className="mr-2"/> 1. Créer un Parcours</h2>
          <form onSubmit={handleCreatePath} className="space-y-4">
            <input placeholder="Titre (ex: Secrets de Lyon)" className="w-full p-2 border rounded" 
              value={pathData.title} onChange={e => setPathData({...pathData, title: e.target.value})} required />
            <input placeholder="Ville" className="w-full p-2 border rounded" 
              value={pathData.city} onChange={e => setPathData({...pathData, city: e.target.value})} required />
            <textarea placeholder="Description..." className="w-full p-2 border rounded" 
              value={pathData.description} onChange={e => setPathData({...pathData, description: e.target.value})} />
            <select className="w-full p-2 border rounded" value={pathData.difficulty} onChange={e => setPathData({...pathData, difficulty: e.target.value})}>
              <option>Facile</option><option>Moyen</option><option>Difficile</option>
            </select>
            <button className="w-full bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">Enregistrer le Parcours</button>
          </form>
        </div>

        {/* DROITE : AJOUT QUÊTES */}
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Plus className="mr-2"/> 2. Ajouter des Quêtes</h2>
          
          <div className="mb-4">
            <select className="w-full p-2 border-2 border-blue-100 rounded font-bold"
              value={selectedPathId} onChange={(e) => setSelectedPathId(e.target.value)}>
              <option value="">-- Choisir un parcours --</option>
              {paths.map(p => <option key={p._id} value={p._id}>{p.title} ({p.city})</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <input placeholder="Titre de l'épreuve" className="w-full p-2 border rounded" 
              value={questData.title} onChange={e => setQuestData({...questData, title: e.target.value})} />
            <textarea placeholder="Énigme / Instruction..." className="w-full p-2 border rounded" 
              value={questData.description} onChange={e => setQuestData({...questData, description: e.target.value})} />
            
            {/* Recherche d'adresse */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Chercher une adresse (ex: Tour Eiffel)" 
                    className="flex-1 p-2 border rounded border-amber-300"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                />
                <button onClick={searchAddress} className="bg-amber-500 text-white p-2 rounded hover:bg-amber-600">
                    <Search size={20} />
                </button>
            </div>

            {/* LA CARTE INTERACTIVE */}
            <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-slate-200 relative z-0">
              <MapContainer center={[46.603354, 1.888334]} zoom={5} style={{ height: '100%', width: '100%' }}>
                {/* TUILES FRANÇAISES ICI 👇 */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <LocationMarker pos={questLocation} setPos={setQuestLocation} />
                {questLocation && <RecenterMap lat={questLocation.lat} lng={questLocation.lng} />}
              </MapContainer>
              
              {!questLocation && <div className="absolute bottom-2 right-2 bg-white/90 p-2 text-xs font-bold rounded shadow z-[400] text-center">Cherchez une adresse<br/>ou cliquez sur la carte</div>}
            </div>

            <button disabled={!selectedPathId || !questLocation} onClick={handleAddQuest} className="w-full bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
              <Save className="inline w-4 h-4 mr-1"/> Sauvegarder l'étape
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminPanel;