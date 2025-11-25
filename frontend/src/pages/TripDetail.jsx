import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, MessageCircle, ArrowLeft, Check, X, Users } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // On récupère l'user connecté
  
  const [trip, setTrip] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les vraies données depuis le backend
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        setTrip(res.data);
        
        // Vérifier si l'utilisateur actuel est dans la liste des participants
        // On suppose que res.data.participants contient des objets { _id, username }
        const isParticipant = res.data.participants.some(p => p._id === user._id || p === user._id);
        setJoined(isParticipant);
      } catch (err) {
        console.error("Erreur fetch trip", err);
      } finally {
        setLoading(false);
      }
    };
    if(user) fetchTrip();
  }, [id, user]);

  // Action: Rejoindre / Quitter (Appel API)
  const toggleJoin = async () => {
    try {
      await api.post(`/trips/${id}/join`, { userId: user._id });
      
      setJoined(!joined); // On inverse l'état localement pour l'affichage immédiat
      
      // On recharge les données pour avoir la liste des participants à jour
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data);
      
      alert(joined ? "Vous avez quitté le groupe." : "Vous avez rejoint le voyage !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'action");
    }
  };

  // Action: Créer Chat Groupe (Appel API)
  const handleGroupChat = async () => {
    try {
      // On envoie les infos pour créer le chat
      // Note: trip.participants contient déjà les IDs ou objets des gens
      const participantIds = trip.participants.map(p => p._id || p);
      if (!participantIds.includes(user._id)) participantIds.push(user._id);

      await api.post('/chats/group', {
        tripId: trip._id,
        tripName: trip.destination,
        participants: participantIds
      });

      navigate('/chat');
    } catch (err) {
      console.error(err);
      alert("Impossible d'ouvrir le chat");
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;
  if (!trip) return <div className="text-center mt-10">Voyage introuvable</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
          <h1 className="text-4xl font-bold tracking-tight">{trip.destination}</h1>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center text-slate-500 space-x-4 mb-2">
                <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4 mr-2" /> {new Date(trip.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {trip.type}</span>
              </div>
            </div>
            
            <button 
              onClick={toggleJoin}
              className={`px-8 py-3 rounded-xl font-bold transition flex items-center shadow-lg transform active:scale-95
                ${joined 
                  ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {joined ? <><X className="w-5 h-5 mr-2"/> Quitter le groupe</> : 'Rejoindre le groupe'}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="font-bold text-xl mb-3 text-slate-800">À propos du voyage</h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {trip.description || "Aucune description fournie."}
                </p>
              </section>

              <section>
                <h3 className="font-bold text-xl mb-3 text-slate-800">Participants ({trip.participants.length})</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {trip.participants.map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                       <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-600">
                        {p.username ? p.username[0] : '?'}
                      </div>
                      <span className="text-xs mt-1 text-slate-500">{p.username || 'User'}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl h-fit shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Organisé par</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {trip.organizer?.username[0]}
                </div>
                <div>
                  <p className="font-bold">{trip.organizer?.username}</p>
                  <p className="text-xs text-slate-500">Hôte vérifié</p>
                </div>
              </div>
              
              <button 
                onClick={handleGroupChat}
                className="w-full border-2 border-slate-100 text-slate-700 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <Users className="w-4 h-4 mr-2" /> Discussion Groupe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;