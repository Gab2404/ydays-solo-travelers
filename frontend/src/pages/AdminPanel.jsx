import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pathData, setPathData] = useState({ title: '', city: '', difficulty: 'Moyen', description: '' });

  // Si pas admin, on vire
  if (user?.role !== 'admin') {
    return <div className="p-10 text-red-500">Accès interdit. Réservé aux Game Masters.</div>;
  }

  const handleCreatePath = async (e) => {
    e.preventDefault();
    try {
      await api.post('/game/paths', { ...pathData, createdBy: user._id });
      alert("Parcours créé !");
      navigate('/');
    } catch (err) { alert("Erreur"); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Zone Game Master 🛠️</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
        <h2 className="text-xl font-bold mb-4">Créer un nouveau Parcours</h2>
        <form onSubmit={handleCreatePath} className="space-y-4">
          <input placeholder="Titre (ex: Mystères de Lyon)" className="w-full p-2 border rounded" onChange={e => setPathData({...pathData, title: e.target.value})} />
          <input placeholder="Ville" className="w-full p-2 border rounded" onChange={e => setPathData({...pathData, city: e.target.value})} />
          <textarea placeholder="Description..." className="w-full p-2 border rounded" onChange={e => setPathData({...pathData, description: e.target.value})} />
          <select className="w-full p-2 border rounded" onChange={e => setPathData({...pathData, difficulty: e.target.value})}>
            <option>Facile</option><option>Moyen</option><option>Difficile</option>
          </select>
          <button className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">Créer le parcours</button>
        </form>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">Note : Pour ajouter des quêtes, il faudra créer une page dédiée ou le faire via Postman pour l'instant.</p>
    </div>
  );
};
export default AdminPanel;