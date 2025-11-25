import { useState, useEffect, useContext } from 'react';
import { Users, User } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/chats/${user._id}`);
        setConversations(res.data);
      } catch (err) {
        console.error("Erreur chargement chats", err);
      }
    };
    fetchChats();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Messages</h1>
      
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <p className="text-center text-slate-400">Aucune conversation pour le moment.</p>
        ) : (
          conversations.map(conv => (
            <div key={conv._id} className="flex items-center p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md cursor-pointer transition">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                  ${conv.isGroup ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-blue-400 to-cyan-400'}`}>
                  {conv.isGroup ? <Users className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-800 text-lg">{conv.name}</h3>
                  <span className="text-xs text-slate-400">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Chat;