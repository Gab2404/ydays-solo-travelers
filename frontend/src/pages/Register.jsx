import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Créer un compte</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Pseudo" className="w-full p-3 border rounded-xl" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Mot de passe" className="w-full p-3 border rounded-xl" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          
          <button className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600">S'inscrire</button>
        </form>
        <p className="text-center mt-4"><Link to="/login" className="text-blue-600">J'ai déjà un compte</Link></p>
      </div>
    </div>
  );
};
export default Register;