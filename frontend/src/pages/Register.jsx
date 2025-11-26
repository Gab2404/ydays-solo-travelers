import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    lastname: '', firstname: '', age: '', nationality: '', 
    sex: 'H', phone: '', email: '', password: '', role: 'joueur'
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("Compte créé ! Connectez-vous.");
      navigate('/login');
    } catch (err) { alert("Erreur inscription"); }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border-2 border-amber-200">
        <h1 className="text-3xl font-bold text-amber-600 mb-6 text-center">🎒 Inscription Aventurier</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          
          <input name="lastname" placeholder="Nom" onChange={handleChange} className="p-3 border rounded-lg bg-gray-50" required />
          <input name="firstname" placeholder="Prénom" onChange={handleChange} className="p-3 border rounded-lg bg-gray-50" required />
          
          <input name="age" type="number" placeholder="Âge" onChange={handleChange} className="p-3 border rounded-lg bg-gray-50" required />
          <select name="sex" onChange={handleChange} className="p-3 border rounded-lg bg-gray-50">
            <option value="H">Homme</option><option value="F">Femme</option><option value="Autre">Autre</option>
          </select>

          <input name="nationality" placeholder="Nationalité" onChange={handleChange} className="col-span-2 p-3 border rounded-lg bg-gray-50" />
          <input name="phone" placeholder="Téléphone" onChange={handleChange} className="col-span-2 p-3 border rounded-lg bg-gray-50" required />
          
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="col-span-2 p-3 border rounded-lg bg-gray-50" required />
          <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} className="col-span-2 p-3 border rounded-lg bg-gray-50" required />

          {/* Juste pour tester, on laisse le choix du rôle ici. En vrai on cacherait ça */}
          <div className="col-span-2 text-sm text-gray-500">
            <label>Rôle (pour test) : </label>
            <select name="role" onChange={handleChange} className="border p-1 rounded ml-2">
              <option value="joueur">Joueur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="col-span-2 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition">
            Commencer l'aventure
          </button>
        </form>
        <p className="text-center mt-4 text-sm">Déjà un compte ? <Link to="/login" className="text-amber-600 font-bold">Connexion</Link></p>
      </div>
    </div>
  );
};
export default Register;