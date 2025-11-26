import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Map, List, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if(lat && lng) map.flyTo([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

const GameSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [viewMode, setViewMode] = useState('map');

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const res = await api.get(`/game/paths/${id}`);
        setPath(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPath();
  }, [id]);

  if (!path) return <div className="h-screen flex items-center justify-center font-bold text-amber-600">Chargement...</div>;

  const defaultCenter = path.quests.length > 0 
    ? [path.quests[0].location.lat, path.quests[0].location.lng] 
    : [46.603354, 1.888334]; // Centre France par défaut

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-md z-20 flex justify-between items-center border-b border-amber-200">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-amber-600"><ArrowLeft/></button>
        <div className="text-center">
          <h1 className="font-black text-amber-600 uppercase tracking-wider text-sm">{path.city}</h1>
          <p className="text-xs text-slate-500 font-bold">{path.title}</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('tree')} className={`p-2 rounded-md ${viewMode === 'tree' ? 'bg-white shadow text-amber-600' : 'text-slate-400'}`}><List size={20}/></button>
          <button onClick={() => setViewMode('map')} className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow text-amber-600' : 'text-slate-400'}`}><Map size={20}/></button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'tree' ? (
          <div className="h-full overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-md mx-auto relative pb-20">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-amber-200 opacity-50"></div>
              {path.quests.map((quest, index) => (
                <div key={quest._id} className="relative mb-8 pl-16">
                  <div className="absolute left-3 top-0 w-7 h-7 -ml-3.5 bg-white border-4 border-amber-500 rounded-full z-10 flex items-center justify-center font-bold text-amber-700 text-xs shadow-sm">
                    {index + 1}
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-1">{quest.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">" {quest.description} "</p>
                    {quest.clue && <div className="flex items-start text-xs text-blue-500 bg-blue-50 p-2 rounded mb-3"><HelpCircle size={14} className="mr-1 mt-0.5"/> Indice: {quest.clue}</div>}
                    <button className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center">
                      <CheckCircle size={16} className="mr-2"/> Valider
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // VUE CARTE FRANÇAISE
          <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            {/* TUILES FRANÇAISES ICI 👇 */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <RecenterMap lat={defaultCenter[0]} lng={defaultCenter[1]} />

            {path.quests.map((quest, index) => (
              <Marker 
                key={quest._id} 
                position={[quest.location.lat, quest.location.lng]}
              >
                <Popup>
                  <div className="text-center">
                    <strong className="block text-amber-600">Étape {index + 1}</strong>
                    <h3 className="font-bold">{quest.title}</h3>
                    <p className="text-xs text-gray-500">{quest.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
export default GameSession;