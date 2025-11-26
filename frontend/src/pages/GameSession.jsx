import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Map, List, CheckCircle } from 'lucide-react';

const GameSession = () => {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' ou 'map'

  useEffect(() => {
    const fetchPath = async () => {
      const res = await api.get(`/game/paths/${id}`);
      setPath(res.data);
    };
    fetchPath();
  }, [id]);

  if (!path) return <div>Chargement de la mission...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
        <h1 className="font-bold text-lg truncate">{path.title}</h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('tree')} className={`p-2 rounded-md ${viewMode === 'tree' ? 'bg-white shadow' : ''}`}><List size={20}/></button>
          <button onClick={() => setViewMode('map')} className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow' : ''}`}><Map size={20}/></button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        
        {viewMode === 'tree' ? (
          // VUE ARBRE
          <div className="max-w-md mx-auto relative">
            {/* Ligne verticale */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200"></div>
            
            {path.quests.map((quest, index) => (
              <div key={quest._id} className="relative mb-8 pl-16">
                {/* Point sur la ligne */}
                <div className="absolute left-3 top-4 w-7 h-7 -ml-3.5 bg-amber-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                
                {/* Carte Quête */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800">{quest.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{quest.description}</p>
                  <button className="mt-3 w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold">
                    Valider l'étape
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // VUE CARTE (Simplifiée pour l'exemple)
          <div className="h-full bg-blue-50 rounded-xl border-2 border-blue-100 flex items-center justify-center relative overflow-hidden">
             <p className="absolute top-4 left-4 bg-white/80 p-2 rounded text-xs">Simulateur de Carte GPS</p>
             
             {/* Simulation des points GPS */}
             {path.quests.map((quest, index) => (
               <div key={quest._id} 
                className="absolute flex flex-col items-center cursor-pointer hover:scale-110 transition"
                style={{ top: `${20 + (index * 15)}%`, left: `${20 + (index * 20)}%` }} // Position fictive
               >
                 <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">
                   {index + 1}
                 </div>
                 <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold mt-1 shadow">{quest.title}</span>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default GameSession;