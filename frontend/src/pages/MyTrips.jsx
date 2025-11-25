import { useState, useEffect } from 'react';
import TripCard from '../components/TripCard';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Mock data
    setTrips([
      { _id: 1, destination: "Tokyo", startDate: "2024-06-01", type: "Culture", organizer: { username: "Moi" } }
    ]);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mes Voyages</h1>
        <Link to="/create-trip" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Créer
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => <TripCard key={trip._id} trip={trip} />)}
      </div>
    </div>
  );
};

export default MyTrips;