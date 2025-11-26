import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [loginInput, setLoginInput] = useState(''); // Peut être email ou tel
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { login: loginInput, password });
      login(res.data);
      navigate('/');
    } catch (err) { alert("Identifiants incorrects"); }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-amber-200">
        <h1 className="text-3xl font-bold text-amber-600 mb-6 text-center">Connexion 🧭</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Email ou Téléphone" 
            className="w-full p-3 border rounded-xl bg-gray-50" 
            onChange={(e) => setLoginInput(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Mot de passe" 
            className="w-full p-3 border rounded-xl bg-gray-50" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700">
            Reprendre la quête
          </button>
        </form>
        <p className="text-center mt-4 text-sm">Pas de compte ? <Link to="/register" className="text-amber-600 font-bold">Inscription</Link></p>
      </div>
    </div>
  );
};
export default Login;