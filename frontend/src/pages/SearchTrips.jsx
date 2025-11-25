import { useEffect, useState } from 'react';
import TripCard from '../components/TripCard';
import api from '../utils/api'; 
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Tout');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips'); 
        setTrips(res.data);
      } catch (err) {
        console.error("Erreur API", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'Tout' || trip.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rejoignez une aventure</h1>
        <div className="flex justify-center gap-4">
            <Link to="/create-trip" className="flex items-center text-blue-600 font-bold hover:underline">
                <Plus className="w-4 h-4 mr-1"/> Créer mon voyage
            </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4 max-w-2xl mx-auto border border-gray-100">
        <Search className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Rechercher..." className="w-full outline-none"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? <p className="text-center">Chargement...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} /> 
          ))}
        </div>
      )}
    </div>
  );
};
export default SearchTrips;