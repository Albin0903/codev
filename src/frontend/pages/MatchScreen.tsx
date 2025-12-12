import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MatchState {
  matchType: 'student' | 'company';
  // Pour les étudiants (quand une entreprise matche)
  companyName?: string;
  companyLogo?: string;
  // Pour les entreprises (quand un étudiant matche)
  studentName?: string;
  studentPhoto?: string | null;
  studentInitials?: string;
}

const MatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MatchState | null;

  // Déterminer le type d'utilisateur
  const userType = sessionStorage.getItem('jobfair_user_type');
  const isCompany = userType === 'company';

  // Données par défaut si pas de state
  const matchData = state || {
    matchType: isCompany ? 'company' : 'student',
    companyName: 'Entreprise',
    companyLogo: '',
    studentName: 'Étudiant',
    studentPhoto: null,
    studentInitials: 'ET'
  };

  const handleContinue = () => {
    if (isCompany) {
      navigate('/company/swipe');
    } else {
      navigate('/swipe');
    }
  };

  const handleViewDetails = () => {
    if (isCompany) {
      navigate('/company/matches');
    } else {
      navigate('/schedule');
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 relative z-50 overflow-hidden">
      {/* Blurred background blob specifically for this screen */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm bg-[#1E293B]/60 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 ring-1 ring-white/5">
        
        {/* Avatars Intersection */}
        <div className="relative h-32 w-48 flex items-center justify-center mb-8">
          {/* Avatar gauche - Profil actuel */}
          <div className="absolute left-4 w-24 h-24 rounded-full border-4 border-[#1E293B] z-10 shadow-xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            {isCompany ? (
              // Entreprise voit l'étudiant à gauche
              matchData.studentPhoto ? (
                <img
                  src={matchData.studentPhoto}
                  alt="Étudiant"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">{matchData.studentInitials || 'ET'}</span>
              )
            ) : (
              // Étudiant voit son propre avatar
              <span className="material-symbols-outlined text-white text-4xl">person</span>
            )}
          </div>
          
          {/* Avatar droite - L'autre partie */}
          <div className="absolute right-4 w-24 h-24 rounded-full border-4 border-[#1E293B] z-20 bg-white flex items-center justify-center shadow-xl overflow-hidden">
            {matchData.companyLogo ? (
              <img 
                src={matchData.companyLogo} 
                alt="Entreprise" 
                className="w-16 h-16 object-contain"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';
                }}
              />
            ) : (
              <span className="material-symbols-outlined text-slate-600 text-4xl">business</span>
            )}
          </div>
          
          {/* Coeur central */}
          <div className="absolute -bottom-2 bg-[#1E293B] p-2 rounded-full z-30 shadow-lg border border-white/10">
            <span className="material-symbols-outlined text-pink-500 fill text-3xl">favorite</span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2 tracking-tight uppercase italic">
          It's a Match!
        </h1>
        
        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
          {isCompany ? (
            <>
              <span className="text-white font-bold">{matchData.studentName}</span> est aussi intéressé par votre entreprise !
            </>
          ) : (
            <>
              <span className="text-white font-bold">{matchData.companyName}</span> est aussi intéressé par votre profil !
            </>
          )}
        </p>

        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={handleViewDetails} 
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Voir les rendez-vous
          </button>
          
          <button 
            onClick={handleContinue} 
            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-base border border-white/10 transition-transform active:scale-95"
          >
            Continuer à swiper
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
