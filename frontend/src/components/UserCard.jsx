import { MessageCircle } from 'lucide-react';

const UserCard = ({ user }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
        {user.name ? user.name[0] : 'U'}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800">{user.name}</h3>
        <p className="text-sm text-slate-500">{user.location}</p>
      </div>
      <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition">
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default UserCard;