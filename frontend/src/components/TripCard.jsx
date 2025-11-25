import { Link } from 'react-router-dom';
import { Calendar, MapPin, User } from 'lucide-react';

const TripCard = ({ trip }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium uppercase">{trip.type}</span>
          <span className="text-xs text-gray-400">Il y a 2j</span>
        </div>
        
        <h3 className="font-bold text-lg mb-1 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {trip.destination}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(trip.startDate).toLocaleDateString()}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium">{trip.organizer?.username || 'Anonyme'}</span>
          </div>
          <Link to={`/trips/${trip._id}`} className="text-primary text-sm font-bold hover:underline">
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;