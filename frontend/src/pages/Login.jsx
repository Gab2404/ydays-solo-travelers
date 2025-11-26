import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data); 
      navigate('/');
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Bon retour !</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" 
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full p-3 border rounded-xl" 
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Se connecter</button>
        </form>
        <p className="text-center mt-4"><Link to="/register" className="text-blue-600">Créer un compte</Link></p>
      </div>
    </div>
  );
};
export default Login;