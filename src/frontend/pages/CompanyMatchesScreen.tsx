import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyMatchesScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#0f172a]">
      <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-pink-400">favorite</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Vos Matchs</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
        Fonctionnalité à venir : consultez vos matchs mutuels avec les étudiants intéressés par vos offres.
      </p>
      <button
        onClick={() => navigate('/company/profile')}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:to-rose-700 transition-all active:scale-95"
      >
        Retour au profil
      </button>
    </div>
  );
};

export default CompanyMatchesScreen;
