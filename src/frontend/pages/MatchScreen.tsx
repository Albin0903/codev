import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MatchState {
  matchType: 'student' | 'company';
  companyName?: string;
  companyLogo?: string;
  studentName?: string;
  studentPhoto?: string | null;
  studentInitials?: string;
}

const MatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as MatchState | null;

  const userType = sessionStorage.getItem('jobfair_user_type');
  const isCompany = userType === 'company';

  const matchData = state || {
    matchType: isCompany ? 'company' : 'student',
    companyName: 'Entreprise',
    companyLogo: '',
    studentName: 'Étudiant',
    studentPhoto: null,
    studentInitials: 'ET'
  };

  const handleContinue = () => {
    navigate(isCompany ? '/company/swipe' : '/swipe');
  };

  const handleViewDetails = () => {
    navigate(isCompany ? '/company/matches' : '/schedule');
  };

  return (
    <div className="min-h-screen h-full w-full flex flex-col items-center justify-center p-6 relative z-50 overflow-hidden bg-[#0f172a]">
      
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm md:max-w-md bg-slate-800/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        
        {/* Avatars */}
        <div className="relative h-36 md:h-44 w-64 md:w-80 flex items-center justify-center mb-6">
          {/* Left Avatar */}
          <div className="absolute left-4 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-800 z-10 shadow-xl overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            {isCompany ? (
              matchData.studentPhoto ? (
                <img src={matchData.studentPhoto} alt="Étudiant" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl md:text-2xl font-bold">{matchData.studentInitials || 'ET'}</span>
              )
            ) : (
              <span className="material-symbols-outlined text-white text-3xl md:text-4xl">person</span>
            )}
          </div>
          
          {/* Right Avatar */}
          <div className="absolute right-4 w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-800 z-20 bg-white flex items-center justify-center shadow-xl overflow-hidden">
            {matchData.companyLogo ? (
              <img 
                src={matchData.companyLogo} 
                alt="Entreprise" 
                className="w-14 h-14 md:w-20 md:h-20 object-contain"
                onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
              />
            ) : (
              <span className="material-symbols-outlined text-slate-600 text-3xl md:text-4xl">business</span>
            )}
          </div>
          
          {/* Heart Badge */}
          <div className="absolute -bottom-2 bg-slate-800 p-2 md:p-3 rounded-full z-30 shadow-lg border border-white/10">
            <span className="material-symbols-outlined text-pink-500 fill text-2xl md:text-3xl">favorite</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 mb-2 tracking-tight">
          It's a Match!
        </h1>
        
        <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
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

        {/* Buttons */}
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={handleViewDetails} 
            className="w-full py-4 md:py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm md:text-base shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">calendar_month</span>
            Voir les rendez-vous
          </button>
          
          <button 
            onClick={handleContinue} 
            className="w-full py-4 md:py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm md:text-base border border-white/10 transition-all active:scale-95"
          >
            Continuer à swiper
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchScreen;
