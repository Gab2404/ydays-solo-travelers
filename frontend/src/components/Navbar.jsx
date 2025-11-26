import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Compass, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-amber-600 font-black text-xl tracking-tight">
          <Compass className="w-6 h-6" />
          <span>TRAVEL QUEST</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="font-bold text-sm hidden md:block">{user.firstname} ({user.role})</span>
              <button onClick={logout} className="text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
            </>
          ) : (
            <Link to="/login" className="text-amber-600 font-bold text-sm">Connexion</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;