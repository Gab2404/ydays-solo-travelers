import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchTrips from './pages/SearchTrips';
import Login from './pages/Login';
import Register from './pages/Register';
import Activities from './pages/Activities';
import Chat from './pages/Chat';
import Profile from './pages/Profilea';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import TripDetail from './pages/TripDetail';
import { AuthContextProvider } from './context/AuthContext';

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <Routes>
              {/* Routes Publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchTrips />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/trips/:id" element={<TripDetail />} />

              {/* Routes qui nécessitent connexion */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/my-trips" element={<MyTrips />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContextProvider>
  );
}

export default App;