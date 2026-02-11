import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import { getPrioritizedOffers } from '../services/api';

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
  sector?: string;
  employees?: number;
  benefits?: string;
  founded_year?: number;
  linkedin_url?: string;
  contact_email?: string;
  // Offer specific fields
  offerDuration?: string;
  offerLocation?: string;
  offerRequirements?: string;
  offers?: any[];
}

const SwipeScreen: React.FC = () => {
  const [currentCard, setCurrentCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | 'enter' | null>('enter');
  const navigate = useNavigate();
  const cardScrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const fetchNextCard = async () => {
    try {
      setLoading(true);
      const data = await api.getNextCompany();
      if (data) {
        const firstOffer = data.offers?.[0];
        const job: JobCard = {
          id: data.id,
          title: firstOffer?.title || 'Stage/Alternance',
          company: data.name,
          companyUrl: data.website || '',
          logo: data.logo_url || data.logo || '/assets/company-default.svg',
          location: data.address || 'France',
          tags: [data.sector || 'Tech'],
          description: firstOffer?.description || data.description || '',
          missions: firstOffer?.description?.split('.').filter((s: string) => s.trim()).slice(0, 4) || [],
          tools: ['Git', 'Jira'],
          sector: data.sector,
          employees: data.employees,
          benefits: data.benefits,
          founded_year: data.founded_year,
          linkedin_url: data.linkedin_url || '',
          contact_email: data.contact_email || '',
          // Offer specific fields
          offerDuration: firstOffer?.duration || '',
          offerLocation: firstOffer?.location || '',
          offerRequirements: firstOffer?.requirements || '',
          offers: data.offers || [],
        };
        setCurrentCard(job);
        setSwipeAnimation('enter');
        setTimeout(() => setSwipeAnimation(null), 400);
        if (cardScrollRef.current) {
          cardScrollRef.current.scrollTop = 0;
        }
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
    if (!currentCard || swipeAnimation) return;

    setSwipeAnimation(direction);

    try {
      const response = await api.createSwipe(currentCard.id, direction);
      
      if (response.match) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#ec4899', '#f472b6', '#db2777'],
          zIndex: 9999
        });
        
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
        setTimeout(() => {
          setSwipeAnimation(null);
          fetchNextCard();
        }, 350);
      }
    } catch (error) {
      console.error('Swipe failed:', error);
      setSwipeAnimation(null);
    }
  };

  const getCardAnimationClass = () => {
    switch (swipeAnimation) {
      case 'left':
        return '-translate-x-full rotate-[-10deg] opacity-0';
      case 'right':
        return 'translate-x-full rotate-[10deg] opacity-0';
      case 'enter':
        return 'animate-card-enter';
      default:
        return 'translate-x-0 rotate-0 opacity-100';
    }
  };

  const [offers, setOffers] = useState<JobCard[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const data = await getPrioritizedOffers();
      setOffers(data);
    };
    fetchOffers();
  }, []);

  if (loading && !currentCard) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-pink-400">sentiment_satisfied</span>
        </div>
        <h2 className="text-xl font-bold mb-2">C'est tout pour le moment !</h2>
        <p className="text-slate-400 text-sm max-w-xs">Revenez plus tard pour découvrir de nouvelles entreprises.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f172a] overflow-hidden md:pt-24">
      
      {/* Header - Mobile only */}
      <div className="md:hidden">
        <AppHeader />
      </div>
      
      {/* Desktop: Full width layout | Mobile: Stack layout */}
      <div className="flex-1 flex flex-col md:px-8 md:pt-6 md:pb-6 min-h-0 overflow-hidden">
        
        {/* Card Container - takes most space */}
        <div className="flex-1 px-4 md:px-0 pb-2 md:pb-0 min-h-0 overflow-hidden md:max-w-6xl md:mx-auto md:w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <div 
            className={`h-full transition-all duration-300 ease-out ${getCardAnimationClass()}`}
          >
            {/* Card - scrollable */}
            <div 
              ref={cardScrollRef}
              className="h-full bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-y-auto"
            >
              {/* Company Header */}
              <div className="p-6 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-[#1e293b] md:bg-[#1e293b] z-10">
                <img 
                  src={currentCard.logo} 
                  alt="logo" 
                  className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-contain bg-white p-1.5 border border-white/20 shadow-lg"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/assets/company-default.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-xl md:text-3xl font-bold truncate">{currentCard.title}</h2>
                  <p className="text-pink-400 text-base md:text-xl font-medium">{currentCard.company}</p>
                </div>
              </div>

              {/* Quick Info Badges */}
              <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-white/5">
                {currentCard.offerDuration && (
                  <div className="flex items-center gap-1.5 text-white text-sm md:text-base bg-pink-500/20 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-pink-500/30 font-medium">
                    <span className="material-symbols-outlined text-base md:text-lg text-pink-400">schedule</span>
                    {currentCard.offerDuration}
                  </div>
                )}
                {currentCard.offerLocation && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5">
                    <span className="material-symbols-outlined text-base md:text-lg text-pink-400">location_on</span>
                    {currentCard.offerLocation}
                  </div>
                )}
                {!currentCard.offerLocation && currentCard.location && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5">
                    <span className="material-symbols-outlined text-base md:text-lg text-pink-400">location_on</span>
                    {currentCard.location}
                  </div>
                )}
                {currentCard.tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {tag}
                  </span>
                ))}
                {currentCard.employees && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                    <span className="material-symbols-outlined text-sm md:text-base text-pink-400">groups</span>
                    {currentCard.employees} employés
                  </div>
                )}
                {currentCard.founded_year && (
                  <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                    <span className="material-symbols-outlined text-sm md:text-base text-pink-400">calendar_month</span>
                    Depuis {currentCard.founded_year}
                  </div>
                )}
              </div>

              {/* Content sections padding increase */}
              <div className="px-6 py-6 border-b border-white/5">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 md:mb-3">À propos du poste</h3>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed">{currentCard.description}</p>
              </div>

              {/* Requirements */}
              {currentCard.offerRequirements && (
                <div className="px-6 py-6 border-b border-white/5">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Prérequis</h3>
                  <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-5 md:p-6 rounded-2xl border border-blue-500/10">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-400 text-xl shrink-0">school</span>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed">{currentCard.offerRequirements}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Missions */}
              {currentCard.missions.length > 0 && (
                <div className="px-6 py-6 border-b border-white/5">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Missions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCard.missions.map((m, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5">
                        <span className="material-symbols-outlined text-pink-500 text-xl md:text-2xl shrink-0">check_circle</span>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">{m.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              <div className="px-6 py-6 border-b border-white/5">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Outils & Technologies</h3>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {currentCard.tools.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm md:text-base font-medium">
                      <span className="material-symbols-outlined text-lg md:text-xl">terminal</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {currentCard.benefits && (
                <div className="px-6 py-6 border-b border-white/5">
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 md:mb-4">Avantages</h3>
                  <div className="bg-gradient-to-br from-pink-500/5 to-rose-500/5 p-6 md:p-8 rounded-3xl border border-pink-500/10">
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed italic">"{currentCard.benefits}"</p>
                  </div>
                </div>
              )}

              {/* Links Section */}
              <div className="px-6 py-6">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Liens & Contact</h3>
                <div className="flex flex-wrap gap-4">
                  {currentCard.companyUrl && (
                    <a 
                      href={currentCard.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-6 py-3 md:px-7 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 text-sm md:text-base font-semibold transition-all hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-xl">language</span>
                      Site web
                    </a>
                  )}
                  {currentCard.linkedin_url && (
                    <a 
                      href={currentCard.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-6 py-3 md:px-7 md:py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-blue-400 text-sm md:text-base font-semibold transition-all hover:scale-105"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                  )}
                  {currentCard.contact_email && (
                    <a 
                      href={`mailto:${currentCard.contact_email}`}
                      className="flex items-center gap-2.5 px-6 py-3 md:px-7 md:py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm md:text-base font-semibold transition-all hover:scale-105"
                    >
                      <span className="material-symbols-outlined text-xl md:text-2xl">mail</span>
                      Contact
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Padding for scroll */}
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - always at bottom */}
      <div className="shrink-0 flex justify-center items-center gap-12 px-4 pt-4 pb-28 md:pb-12 bg-[#0f172a]">
        <button 
          onClick={() => handleSwipe('left')}
          disabled={swipeAnimation !== null}
          className="flex items-center justify-center h-16 w-28 md:h-24 md:w-52 rounded-full bg-slate-800/80 backdrop-blur-xl border border-white/10 shadow-xl text-white active:scale-95 transition-all disabled:opacity-50 md:hover:scale-105 md:hover:bg-slate-700 md:hover:border-red-500/30 group"
          aria-label="Pass"
        >
          <span className="material-symbols-outlined text-4xl md:text-5xl group-hover:text-red-400 transition-colors">close</span>
        </button>
        
        <button 
          onClick={() => handleSwipe('right')}
          disabled={swipeAnimation !== null}
          className="flex items-center justify-center h-16 w-28 md:h-24 md:w-52 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl shadow-pink-500/30 text-white active:scale-95 transition-all disabled:opacity-50 md:hover:scale-105 md:hover:shadow-pink-500/50 group"
          aria-label="Like"
        >
          <span className="material-symbols-outlined text-4xl md:text-5xl group-hover:scale-110 transition-transform">favorite</span>
        </button>
      </div>
    </div>
  );
};

export default SwipeScreen;
