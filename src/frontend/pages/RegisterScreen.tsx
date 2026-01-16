import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // On mettra ça à jour juste après

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student' // 'student' ou 'company' par défaut
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
      // On suppose que ta méthode register existe dans l'api
      await api.register(formData);
      // Redirection vers le login après succès ou connexion directe
      alert('Compte créé avec succès ! Connectez-vous.');
      navigate('/login'); 
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Rejoignez JobFair</h1>
          <p className="text-slate-400 text-sm">Créez votre compte dès maintenant</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Type de compte */}
            <div className="flex bg-slate-800/50 p-1 rounded-lg mb-4">
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.userType === 'student' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setFormData({...formData, userType: 'student'})}
                >
                    Étudiant
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.userType === 'company' ? 'bg-pink-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
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
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
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
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
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
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Mot de passe"
                    required
                />
                <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Confirmer"
                    required
                />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 mt-4 text-white ${formData.userType === 'company' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-primary hover:bg-primary-dark'}`}
            >
              {loading ? 'Création...' : "S'inscrire"}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;