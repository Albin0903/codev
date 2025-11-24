import React from 'react';
import { useNavigate } from 'react-router-dom';

const MatchScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 relative z-50">
      {/* Blurred background blob specifically for this screen */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm bg-[#1E293B]/60 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300 ring-1 ring-white/5">
        
        {/* Avatars Intersection */}
        <div className="relative h-32 w-48 flex items-center justify-center mb-8">
           <div className="absolute left-4 w-24 h-24 rounded-full border-4 border-[#1E293B] z-10 shadow-xl overflow-hidden">
             <img
               src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-q1XTniWFF-wxn3nxljMZYp-lvOGeCwIzWDbaJbsaXDkTHsBrlQOo4JHlcVCPBbOc32l_YJd9uPgmOGcVXa0mqtqosITnmQs6V2FUV07Faesoolq41jECtwTPUo5TG-krsf8Z4tWGbmtp0rFpxbvx2QpxaaGJaVJNzFRZu8RHPFfAoAeHBvRAZ8n73swaRISZf_Ipj8n8aae4BL4kMyFqszQtlenG8n-EoqA4ewAMK_sRpDAm1nrP88G-ppiOB8AgrnypS464TA"
               alt="Student"
               className="w-24 h-24 object-cover"
               onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {(e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.svg';}}
             />
           </div>
           <div className="absolute right-4 w-24 h-24 rounded-full border-4 border-[#1E293B] z-20 bg-white flex items-center justify-center shadow-xl">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2w68KgTdZWefFhhbAK9OoNwgi7pY1aNcWeVuZJtjX-XPNHNruAv9PNMG_bQZnzn-pFjeQg7qyy0kTUMdgSLoVl87A8EQhWmGisk9C3PjkAmtCRP-3TPGCNWtIcCZhowI779vkJ61BMI7a5Kt4nMAy0n3ghyPv6SSGGlcOLH7TG9RkwLTpHqmWsCHsIe5mQRVnKVHYD3tmqZr4nWk4wBekdVrskFRaCpwXPKbXGaQpCIEaVFksRf-zvINYPrHVGuubaYnx-5loFtA" alt="Company" className="w-16 h-16 object-contain" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {(e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';}} />
           </div>
           <div className="absolute -bottom-2 bg-[#1E293B] p-2 rounded-full z-30 shadow-lg border border-white/10">
              <span className="material-symbols-outlined text-pink-500 fill text-3xl">favorite</span>
           </div>
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2 tracking-tight uppercase italic">
            It's a Match!
        </h1>
        
        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
          <span className="text-white font-bold">Tech Solutions Inc.</span> est aussi intéressé par votre profil !
        </p>

        <div className="flex flex-col w-full gap-3">
          <button 
             onClick={() => console.log('Go to details')} 
             className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/10"
          >
            <span className="material-symbols-outlined">visibility</span>
            Voir le détail de l'offre
          </button>
          
          <button 
             onClick={() => navigate('/swipe')} 
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