import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Map, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/game/paths');
        setPaths(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPaths();
  }, []);

  if (!user) return <div className="p-10 text-center">Connectez-vous !</div>;

  return (
    <div className="p-6 pb-20 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bonjour, {user.firstname} 👋</h1>
          <p className="text-slate-500">Prêt pour une nouvelle aventure ?</p>
        </div>
        {user.role === 'admin' && (
          <Link to="/admin" className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
            Mode Admin
          </Link>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4 flex items-center"><Map className="mr-2"/> Parcours disponibles</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {paths.map(path => (
          <div key={path._id} className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-amber-400 transition cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{path.city}</span>
              <span className="text-slate-400 text-xs">{path.difficulty}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{path.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{path.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{path.quests.length} Quêtes</span>
              <Link to={`/game/${path._id}`} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600">
                JOUER ▶
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;