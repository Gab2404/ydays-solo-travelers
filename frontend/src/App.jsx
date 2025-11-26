import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GameSession from './pages/GameSession';
import AdminPanel from './pages/AdminPanel';
import { AuthContextProvider } from './context/AuthContext';

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <div className="min-h-screen bg-amber-50 text-slate-900 font-sans">
          <Navbar />
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/game/:id" element={<GameSession />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContextProvider>
  );
}
export default App;