import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      if (data.user_type === 'company') {
        navigate('/company/profile');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[#0f172a]">
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-sm md:max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Adopte<span className="text-pink-500">UnStage</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm md:text-base">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-xs md:text-sm font-medium mb-2 uppercase tracking-wider">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="etudiant"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs md:text-sm font-medium mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-3.5 md:py-4 px-4 rounded-xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm md:text-base"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => alert('Fonctionnalité à venir')}
                className="flex-1 py-2 text-xs md:text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 py-2 px-4 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors text-xs md:text-sm font-medium"
              >
                S'inscrire
              </button>
            </div>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-slate-800/40 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/5">
          <p className="font-semibold text-white text-xs md:text-sm mb-3 text-center">Comptes de démo</p>
          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
            <div>
              <p className="text-slate-500 mb-1.5 text-[10px] md:text-xs uppercase tracking-wider">Étudiants</p>
              <p className="text-pink-400 font-mono">marie.dupont</p>
              <p className="text-pink-400 font-mono">lucas.martin</p>
              <p className="text-pink-400 font-mono">emma.bernard</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1.5 text-[10px] md:text-xs uppercase tracking-wider">Entreprises</p>
              <p className="text-pink-400 font-mono">innovatech</p>
              <p className="text-pink-400 font-mono">creativeminds</p>
              <p className="text-pink-400 font-mono">dataflow</p>
            </div>
          </div>
          <p className="mt-3 text-slate-500 text-[10px] md:text-xs text-center">
            Mot de passe: <span className="font-mono text-white">test123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
