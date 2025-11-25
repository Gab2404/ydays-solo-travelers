import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Settings, LogOut, Calendar } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [myTrips, setMyTrips] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchMyTrips = async () => {
      try {
        const res = await api.get('/trips');
        // On filtre : on garde les voyages où je suis participant OU organisateur
        const joined = res.data.filter(t => 
          (t.organizer && t.organizer._id === user._id) || 
          (t.participants && t.participants.some(p => p._id === user._id))
        );
        setMyTrips(joined);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyTrips();
  }, [user]);

  if (!user) return <div className="p-10 text-center">Connectez-vous pour voir votre profil.</div>;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 p-6">
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-slate-500 mb-4">{user.email}</p>
        <button onClick={logout} className="text-red-500 flex items-center"><LogOut className="w-4 h-4 mr-2"/> Déconnexion</button>
      </div>

      <h2 className="text-xl font-bold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600"/> Mes Voyages ({myTrips.length})</h2>
      <div className="space-y-3">
        {myTrips.map((trip) => (
          <Link to={`/trips/${trip._id}`} key={trip._id} className="block bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition">
            <h3 className="font-bold">{trip.destination}</h3>
            <p className="text-xs text-slate-500">Organisé par {trip.organizer ? trip.organizer.username : 'Anonyme'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Profile;