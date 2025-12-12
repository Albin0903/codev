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
      // Rediriger vers le profil après connexion réussie
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
    <div className="h-full flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">JobFair Connect</h1>
          <p className="text-slate-400 text-sm">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                placeholder="etudiant"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => alert('Fonctionnalité à venir')}
                className="flex-1 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
              <button
                type="button"
                onClick={() => alert('Fonctionnalité à venir')}
                className="flex-1 py-2 px-4 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors text-sm font-medium"
              >
                S'inscrire
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            <p className="font-semibold text-slate-300 mb-2">Comptes de démo :</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-left">
                <p className="text-slate-500 mb-1">👤 Étudiants:</p>
                <p><span className="font-mono text-cyan-400">marie.dupont</span></p>
                <p><span className="font-mono text-cyan-400">lucas.martin</span></p>
                <p><span className="font-mono text-cyan-400">emma.bernard</span></p>
              </div>
              <div className="text-left">
                <p className="text-slate-500 mb-1">🏢 Entreprises:</p>
                <p><span className="font-mono text-pink-400">innovatech</span></p>
                <p><span className="font-mono text-pink-400">creativeminds</span></p>
                <p><span className="font-mono text-pink-400">dataflow</span></p>
              </div>
            </div>
            <p className="mt-2 text-slate-500">Mot de passe: <span className="font-mono text-slate-300">test123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
