import { MapPin, Users } from 'lucide-react';

const ActivityCard = ({ activity }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
      <div className="h-32 bg-slate-200 flex items-center justify-center text-4xl">
        {/* Placeholder image si pas d'image */}
        🎯
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{activity.category}</span>
          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">{activity.price === 0 ? 'Gratuit' : `${activity.price}€`}</span>
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-1">{activity.title}</h3>
        <div className="flex items-center text-slate-500 text-sm">
          <MapPin className="w-4 h-4 mr-1" /> {activity.location}
        </div>
        <button className="w-full mt-4 bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
          Rejoindre
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;