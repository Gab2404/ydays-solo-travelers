import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    destination: '', startDate: '', endDate: '', type: 'Aventure', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Connectez-vous pour créer un voyage !");

    try {
      // On envoie l'ID de l'organisateur (le user connecté)
      await api.post('/trips', { ...formData, organizer: user._id });
      navigate('/search'); 
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Proposer un voyage 🌍</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Destination (ex: Tokyo)" className="w-full p-2 border rounded-lg"
          onChange={(e) => setFormData({...formData, destination: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
          <input type="date" className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
        </div>
        <select className="w-full p-2 border rounded-lg" onChange={(e) => setFormData({...formData, type: e.target.value})}>
          <option>Aventure</option><option>Détente</option><option>Culture</option><option>Fête</option>
        </select>
        <textarea className="w-full p-2 border rounded-lg h-32" placeholder="Description..."
          onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Publier</button>
      </form>
    </div>
  );
};
export default CreateTrip;