import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
      // Capitalize first letter of names
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      const firstName = capitalize(formData.firstName.trim());
      const lastName = capitalize(formData.lastName.trim());
      
      // Combine firstName and lastName into username for the API
      const generatedUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
      const registerData = {
        username: generatedUsername,
        email: formData.email,
        password: formData.password,
        userType: formData.userType as 'student' | 'company',
        firstName: firstName,
        lastName: lastName
      };
      await api.register(registerData);
      setSuccessMessage(`Compte créé ! Identifiant : ${generatedUsername}`);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/30">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-sm md:max-w-md z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            Adopte<span className="text-pink-500">UnStagiaire</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Créez votre compte dès maintenant</p>
          <p className="text-slate-500 text-xs md:text-sm mt-2">Connexion avec <span className="text-pink-400">prénom.nom</span> ou votre email</p>
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

            <div className="flex gap-2">
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Prénom"
                required
              />
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 md:px-5 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Nom"
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
                placeholder="Email"
                required
              />
            </div>

            <div className="flex gap-2">
              <div className="relative w-full">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 md:px-5 md:py-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="Mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <div className="relative w-full">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 md:px-5 md:py-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white text-sm md:text-base placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  placeholder="Confirmer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
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
