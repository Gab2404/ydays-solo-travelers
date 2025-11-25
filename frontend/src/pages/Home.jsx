import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Voyagez seul, <br/>mais jamais solitaire.</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connectez-vous avec d'autres voyageurs, partagez des activités et créez des souvenirs inoubliables.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/search" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition shadow-lg">
              Trouver un groupe
            </Link>
            <Link to="/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Rencontres</h3>
          <p className="text-slate-500">Trouvez des compagnons de voyage qui partagent vos dates et vos intérêts.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Agenda Partagé</h3>
          <p className="text-slate-500">Organisez vos étapes et rejoignez des événements créés par la communauté.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Activités Locales</h3>
          <p className="text-slate-500">Découvrez les meilleurs spots recommandés par d'autres backpackers.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;