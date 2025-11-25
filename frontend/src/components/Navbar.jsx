import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plane, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
          <Plane className="w-6 h-6" />
          <span>TravelConnect</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/search" className="text-gray-600 hover:text-primary transition">Trouver un groupe</Link>
          <Link to="/activities" className="text-gray-600 hover:text-primary transition">Activités</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-sm hidden md:block">{user.username}</span>
              </Link>
              <button onClick={logout} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;