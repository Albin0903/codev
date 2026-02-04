import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await api.register(formData);
      alert('Compte créé avec succès ! Connectez-vous.');
      navigate('/login'); 
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
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
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Rejoignez JobFair</h1>
          <p className="text-slate-400 text-sm md:text-base">Créez votre compte dès maintenant</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm md:text-base">
                {error}
              </div>
            )}

            {/* User Type Toggle */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-2">
              <button
                type="button"
                className={`flex-1 py-2.5 md:py-3 text-sm md:text-base font-medium rounded-lg transition-all ${
                  formData.userType === 'student' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setFormData({...formData, userType: 'student'})}
              >
                Étudiant
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 md:py-3 text-sm md:text-base font-medium rounded-lg transition-all ${
                  formData.userType === 'company' 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setFormData({...formData, userType: 'company'})}
              >
                Entreprise
              </button>
            </div>

            <div>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Nom d'utilisateur"
                required
              />
            </div>

            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Email professionnel"
                required
              />
            </div>

            <div className="flex gap-2">
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Mot de passe"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Confirmer"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-3.5 md:py-4 px-4 rounded-xl transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 active:scale-[0.98] text-sm md:text-base"
            >
              {loading ? 'Création...' : "S'inscrire"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm md:text-base text-slate-400 hover:text-white transition-colors"
              >
                Déjà un compte ? <span className="text-pink-400">Se connecter</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
