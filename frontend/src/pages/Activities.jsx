import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('Tout');
  const [joinedActivities, setJoinedActivities] = useState([]);

  useEffect(() => {
    setActivities([
      { _id: 1, title: "Street Food Tour", location: "Bangkok", price: 15, category: "Nourriture" },
      { _id: 2, title: "Rando Volcan", location: "Bali", price: 40, category: "Sport" },
      { _id: 3, title: "Soirée Karaoke", location: "Tokyo", price: 20, category: "Soirée" },
      { _id: 4, title: "Visite Musée Louvre", location: "Paris", price: 0, category: "Culture" },
      { _id: 5, title: "Cours de Yoga", location: "Ubud", price: 10, category: "Sport" },
    ]);

    // Charger ce qu'on a déjà rejoint
    const stored = JSON.parse(localStorage.getItem('myJoinedActivities') || '[]');
    setJoinedActivities(stored.map(a => a._id));
  }, []);

  const toggleJoinActivity = (activity) => {
    let newJoined;
    let storedActivities = JSON.parse(localStorage.getItem('myJoinedActivities') || '[]');

    if (joinedActivities.includes(activity._id)) {
      newJoined = joinedActivities.filter(id => id !== activity._id);
      storedActivities = storedActivities.filter(a => a._id !== activity._id);
    } else {
      newJoined = [...joinedActivities, activity._id];
      storedActivities.push(activity);
    }

    setJoinedActivities(newJoined);
    localStorage.setItem('myJoinedActivities', JSON.stringify(storedActivities));
  };

  const filteredActivities = filter === 'Tout' ? activities : activities.filter(act => act.category === filter);

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Activités à proximité</h1>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['Tout', 'Sport', 'Culture', 'Soirée', 'Nourriture'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filter === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => {
          const isJoined = joinedActivities.includes(activity._id);
          return (
            <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col h-full">
              <div className="h-32 bg-slate-100 flex items-center justify-center text-4xl select-none">
                {activity.category === 'Sport' ? '🏄' : activity.category === 'Nourriture' ? '🍜' : activity.category === 'Soirée' ? '🎤' : '🏛️'}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{activity.category}</span>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">{activity.price === 0 ? 'Gratuit' : `${activity.price}€`}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{activity.title}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4"><MapPin className="w-4 h-4 mr-1" /> {activity.location}</div>
                
                <button 
                  onClick={() => toggleJoinActivity(activity)}
                  className={`w-full mt-auto py-2 rounded-lg text-sm font-medium transition duration-200 ${isJoined ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {isJoined ? 'Inscrit ✓' : 'Rejoindre'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Activities;