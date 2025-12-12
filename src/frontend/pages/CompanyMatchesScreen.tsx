import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyMatchesScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <span className="material-symbols-outlined text-6xl text-pink-400 mb-4">favorite</span>
      <h2 className="text-2xl font-bold text-white mb-3">Vos Matchs</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        Fonctionnalité à venir : consultez vos matchs mutuels avec les étudiants intéressés par vos offres.
      </p>
      <button
        onClick={() => navigate('/company/profile')}
        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:brightness-110 transition"
      >
        Retour au profil
      </button>
    </div>
  );
};

export default CompanyMatchesScreen;
