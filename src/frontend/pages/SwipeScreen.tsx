
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface JobCard {
  id: number;
  title: string;
  company: string;
  companyUrl: string;
  logo: string;
  location: string;
  tags: string[];
  description: string;
  missions: string[];
  tools: string[];
  // Champs additionnels pour "Voir plus"
  sector?: string;
  employees?: number;
  benefits?: string;
  founded_year?: number;
}

const SwipeScreen: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const confettiContainerRef = React.useRef<HTMLDivElement>(null);

  const fetchNextCard = async () => {
    try {
      setLoading(true);
      const data = await api.getNextCompany();
      if (data) {
        // Transform API data to JobCard format
        const job: JobCard = {
          id: data.id,
          title: data.offers?.[0]?.title || 'Stage/Alternance',
          company: data.name,
          companyUrl: data.website,
            logo: data.logo_url || data.logo || '/assets/company-default.svg',
          location: data.address || 'France',
          tags: ['#Tech', `#${data.sector}`],
          description: data.description,
          missions: data.offers?.[0]?.description?.split('.').filter((s: string) => s.trim()).slice(0, 3) || ['Développement', 'Conception', 'Test'],
          tools: ['Git', 'Jira'],
          sector: data.sector,
          employees: data.employees,
          benefits: data.benefits,
          founded_year: data.founded_year,
        };
        setCurrentCard(job);
        setShowDetails(false);
      } else {
        setCurrentCard(null);
      }
    } catch (error) {
      console.error('Error fetching next card:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextCard();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentCard) return;

    // 1. Animation
    setSlideDirection(direction);

    // 2. API Call
    try {
      const response = await api.createSwipe(currentCard.id, direction);
      
      // 3. Match Effect
      if (response.match) {
        // Create canvas for confetti within the phone container
        const container = confettiContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const myConfetti = confetti.create(undefined, {
            resize: true,
            useWorker: true
          });
          
          myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#0d69f2', '#ec4899', '#8b5cf6'],
            disableForReducedMotion: true,
            zIndex: 9999
          });
        }
        
        // Navigate avec les données du match
        setTimeout(() => {
            navigate('/match', { 
              state: { 
                matchType: 'student',
                companyName: currentCard.company,
                companyLogo: currentCard.logo
              } 
            });
        }, 1500);
      } else {
        // Wait for animation to finish before fetching next card
        setTimeout(() => {
            setSlideDirection(null);
            fetchNextCard();
        }, 300);
      }

    } catch (error) {
      console.error('Swipe failed:', error);
      setSlideDirection(null);
    }
  };

  if (loading && !currentCard) {
      return <div className="flex items-center justify-center h-full text-white">Chargement...</div>;
  }

  if (!currentCard) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center overflow-hidden">
              <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">sentiment_satisfied</span>
              <h2 className="text-xl font-bold mb-2">C'est tout pour le moment !</h2>
              <p className="text-slate-400">Revenez plus tard pour découvrir de nouvelles entreprises.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full w-full relative pt-4 pb-28 overflow-hidden">
      
      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center relative w-full min-h-0 px-2 mb-4 perspective-1000">
        
        {/* Main Card with Animation */}
        <div 
            className={`relative flex flex-col w-full h-full bg-[#1E293B]/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 z-10 ring-1 ring-white/10 transition-all duration-500 ease-out transform ${
                slideDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : 
                slideDirection === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : 
                'translate-x-0 rotate-0 opacity-100'
            }`}
        >
          
          {/* Header Image */}
          <div className="w-full h-24 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-between px-6 border-b border-white/5 relative">
             <div className="absolute inset-0 bg-primary/5"></div>
             <div className="flex items-center gap-4 z-10 w-full">
                <img 
                    src={currentCard.logo} 
                    alt="logo" 
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-white/10 shadow-lg bg-white"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';
                    }}
                />
                <div className="flex flex-col overflow-hidden">
                    <h2 className="text-white text-lg font-bold leading-tight truncate">
                        {currentCard.title}
                    </h2>
                    <a 
                        href={currentCard.companyUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:text-purple-300 font-medium text-xs flex items-center gap-1 transition-colors w-fit"
                    >
                        {currentCard.company}
                        <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </a>
                </div>
             </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto no-scrollbar">
            
            {/* Tags & Location */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {currentCard.location}
                </div>
                <div className="flex flex-wrap gap-2">
                {currentCard.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-bold border bg-white/5 text-slate-300 border-white/10">
                        {tag}
                    </span>
                ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">À propos</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    {currentCard.description}
                </p>
            </div>

            {/* Missions */}
            <div>
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">Missions</h3>
                <ul className="space-y-2">
                    {currentCard.missions.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                            {m}
                        </li>
                    ))}
                </ul>
            </div>

             {/* Tools */}
             <div>
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">Outils</h3>
                <div className="flex flex-wrap gap-2">
                    {currentCard.tools.map((t, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                            <span className="material-symbols-outlined text-sm">terminal</span>
                            {t}
                        </div>
                    ))}
                </div>
            </div>

            {/* Voir plus button */}
            <button
              onClick={() => setShowDetails(true)}
              className="w-full py-3 mt-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">info</span>
              Voir plus de détails
            </button>
          </div>
        </div>
      </div>

      {/* Modal Voir Plus */}
      {showDetails && currentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-white/10">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E293B] border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={currentCard.logo} 
                  alt="logo" 
                  className="h-10 w-10 rounded-xl object-cover bg-white"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';
                  }}
                />
                <div>
                  <h3 className="text-white font-bold">{currentCard.company}</h3>
                  <p className="text-slate-400 text-xs">{currentCard.sector}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-full hover:bg-slate-700 transition"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Infos clés */}
              <div className="grid grid-cols-2 gap-3">
                {currentCard.founded_year && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Fondée en</p>
                    <p className="text-white font-bold">{currentCard.founded_year}</p>
                  </div>
                )}
                {currentCard.employees && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Employés</p>
                    <p className="text-white font-bold">{currentCard.employees}</p>
                  </div>
                )}
              </div>

              {/* Description complète */}
              <div>
                <h4 className="text-slate-300 text-sm font-bold mb-2">Description</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{currentCard.description}</p>
              </div>

              {/* Avantages */}
              {currentCard.benefits && (
                <div>
                  <h4 className="text-slate-300 text-sm font-bold mb-2">Avantages</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{currentCard.benefits}</p>
                </div>
              )}

              {/* Lien site */}
              {currentCard.companyUrl && (
                <a 
                  href={currentCard.companyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary/20 hover:bg-primary/30 rounded-xl text-primary font-medium transition"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                  Visiter le site web
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="flex justify-center items-center gap-6 shrink-0 z-30 px-4">
        <button 
            onClick={() => handleSwipe('left')}
            disabled={slideDirection !== null}
            className="group flex items-center justify-center rounded-full bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 shadow-2xl h-14 w-36 sm:w-40 text-slate-400 transition-all duration-200 hover:scale-105 active:scale-95 hover:border-red-500/30 hover:text-red-400 hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pass"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:-rotate-12">close</span>
        </button>
        
        <button 
            onClick={() => handleSwipe('right')}
            disabled={slideDirection !== null}
            className="group flex items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-pink-600 shadow-xl shadow-rose-500/30 h-14 w-36 sm:w-40 text-white transition-all duration-200 hover:scale-105 active:scale-95 border-t border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Like"
        >
          <span className="material-symbols-outlined text-3xl fill transition-transform group-hover:scale-110 group-hover:animate-pulse">favorite</span>
        </button>
      </div>
    </div>
  );
};

export default SwipeScreen;

