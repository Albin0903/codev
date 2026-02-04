import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { useBottomNav } from '../contexts/BottomNavContext';

interface Event {
  id: number;
  time: string;
  title: string;
  person: string;
  location: string;
  status: 'confirmed' | 'pending';
  logo: string;
  companyUrl?: string;
  date: Date;
}

interface SwipeItem {
  id: number;
  company: {
    id: number;
    name: string;
    sector: string;
    logo_url: string;
    website?: string;
    description?: string;
  };
  direction: 'left' | 'right';
  created_at: string;
}

interface MatchItem {
  id: number;
  company: {
    id: number;
    name: string;
    sector: string;
    logo_url: string;
    website?: string;
    description?: string;
    contact_email?: string;
  };
  is_mutual: boolean;
  created_at: string;
}

interface Forum {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  description: string;
}

const ScheduleScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [swipes, setSwipes] = useState<SwipeItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('interviews');
  const navigate = useNavigate();
  const { hideNav, showNav } = useBottomNav();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch forum info
        try {
          const forumData = await api.getForum();
          if (forumData) {
            setForum(forumData);
          }
        } catch (e) {
          console.error('Error fetching forum:', e);
        }
        
        // Fetch interviews
        const interviewsResponse = await api.getInterviews();
        const interviewsData = interviewsResponse.results || interviewsResponse;
        let formattedEvents: Event[] = [];
        let interviewCompanyIds = new Set<number>();
        
        if (Array.isArray(interviewsData)) {
          formattedEvents = interviewsData.map((interview: any) => {
            interviewCompanyIds.add(interview.match.company.id);
            return {
              id: interview.id,
              time: new Date(interview.time_slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              title: `Entretien avec ${interview.match.company.name}`,
              person: interview.match.company.contact_name || 'Recruteur',
              location: interview.room || 'Stand A01',
              status: interview.status,
              logo: interview.match.company.logo_url || interview.match.company.logo || '/assets/company-default.svg',
              companyUrl: interview.match.company.website || '',
              date: new Date(interview.time_slot),
              company: interview.match.company
            };
          });
          formattedEvents.sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime());
          setEvents(formattedEvents);
        }

        // Fetch matches - exclude companies that already have interviews
        const matchesResponse = await api.getMatches();
        const matchesData = matchesResponse.results || matchesResponse;
        let filteredMatches: MatchItem[] = [];
        
        if (Array.isArray(matchesData)) {
          // Filter out companies that already have an interview
          filteredMatches = matchesData.filter((m: MatchItem) => !interviewCompanyIds.has(m.company.id));
          setMatches(filteredMatches);
        }

        // Fetch swipes (likes history) - exclude those already matched OR with interviews
        try {
          const swipesResponse = await api.getSwipes();
          const swipesData = swipesResponse.results || swipesResponse;
          if (Array.isArray(swipesData)) {
            // Get matched company IDs (including those filtered out from matches display)
            const allMatchedCompanyIds = new Set(matchesData.map((m: MatchItem) => m.company.id));
            // Filter: only right swipes that are NOT in matches AND NOT in interviews
            setSwipes(swipesData.filter((s: SwipeItem) => 
              s.direction === 'right' && 
              !allMatchedCompanyIds.has(s.company.id) && 
              !interviewCompanyIds.has(s.company.id)
            ));
          }
        } catch (e) {
          console.error('Error fetching swipes:', e);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle modal visibility and bottom nav + lock body scroll
  useEffect(() => {
    if (selectedCompany) {
      hideNav();
      document.body.style.overflow = 'hidden';
    } else {
      showNav();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCompany, hideNav, showNav]);

  // Swipe down to close modal
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      setSelectedCompany(null);
    }
    if (modalRef.current) {
      modalRef.current.style.transform = '';
    }
    startY.current = 0;
    currentY.current = 0;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Helper function to calculate days until interview
  const getDaysUntilInterview = (interviewDate: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interview = new Date(interviewDate);
    interview.setHours(0, 0, 0, 0);
    
    const diffTime = interview.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passé';
    if (diffDays === 0) return 'Jour J';
    if (diffDays === 1) return 'J-1';
    return `J-${diffDays}`;
  };

  // Get first offer title for display
  const getOfferPreview = (company: any): string => {
    if (company?.offers && company.offers.length > 0) {
      return company.offers[0].title;
    }
    return company?.sector || 'Offre de stage';
  };

  const sections = [
    { 
      id: 'interviews', 
      label: 'Entretiens', 
      icon: 'calendar_month', 
      count: events.length, 
      color: 'pink',
      items: events
    },
    { 
      id: 'matches', 
      label: 'Matchs', 
      icon: 'handshake', 
      count: matches.length, 
      color: 'emerald',
      items: matches
    },
    { 
      id: 'likes', 
      label: 'Likes envoyés', 
      icon: 'favorite', 
      count: swipes.length, 
      color: 'rose',
      items: swipes
    },
  ];

  const renderCompanyCard = (item: any, type: 'interview' | 'match' | 'like') => {
    const company = type === 'interview' ? item.company : item.company;
    const offerPreview = getOfferPreview(company);
    
    return (
      <button
        key={item.id}
        onClick={() => company && setSelectedCompany({ ...company, interviewInfo: type === 'interview' ? item : null })}
        className="flex flex-col items-center p-3 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all text-center group"
      >
        <img
          src={type === 'interview' ? item.logo : (company?.logo_url || '/assets/company-default.svg')}
          alt={company?.name || 'Logo'}
          className="w-14 h-14 rounded-xl object-contain bg-white p-1.5 border border-white/10 mb-2"
          onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
        />
        <p className="text-white font-medium text-xs truncate w-full">
          {company?.name}
        </p>
        <p className="text-slate-400 text-[9px] truncate w-full mt-0.5">
          {offerPreview}
        </p>
        {type === 'interview' ? (
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              getDaysUntilInterview(item.date) === 'Jour J' ? 'bg-pink-500 text-white' :
              getDaysUntilInterview(item.date) === 'J-1' ? 'bg-orange-500 text-white' :
              'bg-pink-500/20 text-pink-400'
            }`}>
              {getDaysUntilInterview(item.date)}
            </span>
            <span className="text-pink-400 text-[10px] font-medium">{item.time}</span>
          </div>
        ) : type === 'match' ? (
          <span className="text-emerald-400 text-[10px] mt-1">Match ✓</span>
        ) : (
          <span className="text-slate-500 text-[10px] mt-1">En attente</span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#0f172a]">
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f172a] overflow-hidden md:pt-24">
      
      {/* Header - Mobile only */}
      <div className="md:hidden">
        <AppHeader rightElement={
          <div className="px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/30">
            <span className="text-pink-400 text-xs font-bold">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        } />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 md:pt-4 pb-32 md:pb-8">
        
        {/* Forum Info Card */}
        {forum && (
          <div className="pb-4 md:max-w-4xl md:mx-auto">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-pink-400 text-2xl md:text-3xl">event</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm md:text-base truncate">{forum.name}</h3>
                  <p className="text-pink-400 text-xs md:text-sm font-medium mt-0.5">
                    {new Date(forum.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs md:text-sm">schedule</span>
                    {forum.start_time} - {forum.end_time}
                  </p>
                  <p className="text-slate-400 text-xs md:text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs md:text-sm">location_on</span>
                    {forum.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats + Priority Button Row - Mobile only */}
        <div className="pb-4 md:hidden">
          <div className="flex flex-col gap-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3 text-center">
                <span className="text-2xl font-bold text-white">{events.length}</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Entretiens</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-3 text-center">
                <span className="text-2xl font-bold text-emerald-400">{matches.length}</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Matchs</p>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3 text-center">
                <span className="text-2xl font-bold text-pink-400">{swipes.length}</span>
                <p className="text-slate-400 text-[10px] mt-0.5">Likes</p>
              </div>
            </div>
            
            {/* Priority Button */}
            <button
              onClick={() => navigate('/priorities')}
              className="w-full py-3 px-6 bg-slate-800/60 backdrop-blur-xl border border-pink-500/30 rounded-2xl text-pink-400 font-semibold text-sm hover:bg-pink-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">sort</span>
              Priorités
            </button>
          </div>
        </div>

        {/* Desktop: Priority Button + Date */}
        <div className="hidden md:flex md:items-center md:justify-between pb-4 md:max-w-5xl md:mx-auto">
          <button
            onClick={() => navigate('/priorities')}
            className="py-3 px-6 md:py-4 md:px-8 bg-slate-800/60 backdrop-blur-xl border border-pink-500/30 rounded-2xl text-pink-400 font-semibold text-sm md:text-base hover:bg-pink-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">sort</span>
            Modifier mes priorités
          </button>
          <div className="px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30">
            <span className="text-pink-400 text-sm font-bold">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Desktop: 3 columns layout | Mobile: Accordion */}
        <div className="md:max-w-4xl md:mx-auto">
          
          {/* Mobile: Accordion Sections */}
          <div className="md:hidden space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                
                {/* Section Header (Accordion Toggle) */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      section.color === 'emerald' ? 'bg-emerald-500/20' : 
                      section.color === 'rose' ? 'bg-rose-500/20' : 'bg-pink-500/20'
                    }`}>
                      <span className={`material-symbols-outlined text-xl ${
                        section.color === 'emerald' ? 'text-emerald-400' : 
                        section.color === 'rose' ? 'text-rose-400' : 'text-pink-400'
                      }`}>
                        {section.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{section.label}</h3>
                      <p className="text-slate-400 text-xs">{section.count} éléments</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                    expandedSection === section.id ? 'rotate-180' : ''
                  }`}>
                    expand_more
                  </span>
                </button>

                {/* Section Content (Expanded Grid) */}
                <div className={`transition-all duration-300 ease-out overflow-hidden ${
                  expandedSection === section.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 pb-4">
                    {section.items.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {section.id === 'interviews' && section.items.map((event: any) => 
                          renderCompanyCard(event, 'interview')
                        )}
                        {section.id === 'matches' && section.items.map((match: any) => 
                          renderCompanyCard(match, 'match')
                        )}
                        {section.id === 'likes' && section.items.map((swipe: any) => 
                          renderCompanyCard(swipe, 'like')
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <span className={`material-symbols-outlined text-3xl mb-2 ${
                          section.color === 'emerald' ? 'text-emerald-400/50' : 
                          section.color === 'rose' ? 'text-rose-400/50' : 'text-pink-400/50'
                        }`}>
                          {section.icon}
                        </span>
                        <p className="text-slate-500 text-xs">Aucun élément</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: 3 Columns Grid with integrated stats */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 md:max-w-5xl md:mx-auto">
            {sections.map((section) => (
              <div key={section.id} className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                
                {/* Column Header with Stats */}
                <div className={`p-4 md:p-5 border-b ${
                  section.color === 'emerald' ? 'border-emerald-500/20' : 
                  section.color === 'rose' ? 'border-rose-500/20' : 'border-pink-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                      section.color === 'emerald' ? 'bg-emerald-500/20' : 
                      section.color === 'rose' ? 'bg-rose-500/20' : 'bg-pink-500/20'
                    }`}>
                      <span className={`material-symbols-outlined text-xl md:text-2xl ${
                        section.color === 'emerald' ? 'text-emerald-400' : 
                        section.color === 'rose' ? 'text-rose-400' : 'text-pink-400'
                      }`}>
                        {section.icon}
                      </span>
                    </div>
                    <span className={`text-3xl md:text-4xl font-bold ${
                      section.color === 'emerald' ? 'text-emerald-400' : 
                      section.color === 'rose' ? 'text-rose-400' : 'text-white'
                    }`}>{section.count}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm md:text-base">{section.label}</h3>
                </div>

                {/* Column Content - Scrollable */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                  {section.items.length > 0 ? (
                    <>
                      {section.id === 'interviews' && section.items.map((event: any) => (
                        <button
                          key={event.id}
                          onClick={() => event.company && setSelectedCompany({ ...event.company, interviewInfo: event })}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-pink-500/30 transition-all text-left"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={event.logo}
                              alt="Logo"
                              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain bg-white p-1 border border-white/10"
                              onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
                            />
                            <span className={`absolute -top-1 -right-1 text-[8px] font-bold px-1 py-0.5 rounded ${
                              getDaysUntilInterview(event.date) === 'Jour J' ? 'bg-pink-500 text-white' :
                              getDaysUntilInterview(event.date) === 'J-1' ? 'bg-orange-500 text-white' :
                              'bg-slate-700 text-pink-400'
                            }`}>
                              {getDaysUntilInterview(event.date)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">
                              {event.company?.name || event.title.replace('Entretien avec ', '')}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                              {getOfferPreview(event.company)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-pink-400 text-xs">schedule</span>
                                <span className="text-pink-400 text-xs font-medium">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-xs">location_on</span>
                                <span className="text-slate-400 text-xs">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                      {section.id === 'matches' && section.items.map((match: any) => (
                        <button
                          key={match.id}
                          onClick={() => setSelectedCompany(match.company)}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-left"
                        >
                          <img
                            src={match.company?.logo_url || '/assets/company-default.svg'}
                            alt={match.company?.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain bg-white p-1 border border-white/10"
                            onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">{match.company?.name}</p>
                            <p className="text-slate-400 text-xs truncate">{getOfferPreview(match.company)}</p>
                            <p className="text-emerald-400 text-xs mt-0.5">Match ✓</p>
                          </div>
                        </button>
                      ))}
                      {section.id === 'likes' && section.items.map((swipe: any) => (
                        <button
                          key={swipe.id}
                          onClick={() => setSelectedCompany(swipe.company)}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all text-left"
                        >
                          <img
                            src={swipe.company?.logo_url || '/assets/company-default.svg'}
                            alt={swipe.company?.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-contain bg-white p-1 border border-white/10"
                            onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">{swipe.company?.name}</p>
                            <p className="text-slate-400 text-xs truncate">{getOfferPreview(swipe.company)}</p>
                            <p className="text-rose-400 text-xs mt-0.5">En attente de réponse</p>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <span className={`material-symbols-outlined text-3xl mb-2 ${
                        section.color === 'emerald' ? 'text-emerald-400/50' : 
                        section.color === 'rose' ? 'text-rose-400/50' : 'text-pink-400/50'
                      }`}>
                        {section.icon}
                      </span>
                      <p className="text-slate-500 text-xs">Aucun élément</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div 
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCompany(null)}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-md max-h-[85vh] md:max-h-[70vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl animate-slide-up md:animate-modal-in transition-transform"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Mobile: drag handle */}
            <div className="md:hidden pt-4 px-6">
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-2 cursor-grab"></div>
              <p className="text-center text-slate-500 text-[10px] mb-4">Glisser vers le bas pour fermer</p>
            </div>
            
            {/* Desktop: close button - sticky */}
            <div className="hidden md:flex justify-end p-4 pb-0 sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 md:pb-6">
            
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedCompany.logo_url || '/assets/company-default.svg'}
                alt={selectedCompany.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-contain bg-white p-2 border border-white/10"
                onError={(e) => { e.currentTarget.src = '/assets/company-default.svg'; }}
              />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{selectedCompany.name}</h3>
                <p className="text-pink-400 text-sm md:text-base">{selectedCompany.sector}</p>
              </div>
            </div>

            {/* Interview Info Card - if this is from an interview */}
            {selectedCompany.interviewInfo && (
              <div className="mb-4 p-4 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-pink-400 text-2xl">calendar_month</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">Entretien programmé</h4>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-1 ${
                      getDaysUntilInterview(selectedCompany.interviewInfo.date) === 'Jour J' ? 'bg-pink-500 text-white' :
                      getDaysUntilInterview(selectedCompany.interviewInfo.date) === 'J-1' ? 'bg-orange-500 text-white' :
                      getDaysUntilInterview(selectedCompany.interviewInfo.date) === 'Passé' ? 'bg-slate-500 text-white' :
                      'bg-pink-500/30 text-pink-400'
                    }`}>
                      {getDaysUntilInterview(selectedCompany.interviewInfo.date)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-pink-400 text-lg">schedule</span>
                    <span className="font-medium">{selectedCompany.interviewInfo.time}</span>
                    <span className="text-slate-400 text-sm">
                      ({selectedCompany.interviewInfo.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-pink-400 text-lg">location_on</span>
                    <span className="font-medium">{selectedCompany.interviewInfo.location}</span>
                  </div>
                  {forum && (
                    <div className="flex items-center gap-2 text-slate-300 text-sm mt-2 pt-2 border-t border-white/10">
                      <span className="material-symbols-outlined text-slate-400 text-base">business</span>
                      <span>{forum.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Offers Section */}
            {selectedCompany.offers && selectedCompany.offers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">
                  Offre{selectedCompany.offers.length > 1 ? 's' : ''} de stage
                </h4>
                <div className="space-y-2">
                  {selectedCompany.offers.map((offer: any) => (
                    <div key={offer.id} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <h5 className="text-white font-medium text-sm">{offer.title}</h5>
                      {offer.description && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{offer.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {offer.duration && (
                          <span className="text-pink-400 text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {offer.duration}
                          </span>
                        )}
                        {offer.location && (
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {offer.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCompany.description && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">À propos</h4>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">{selectedCompany.description}</p>
              </div>
            )}

            {selectedCompany.contact_email && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">Contact</h4>
                <a href={`mailto:${selectedCompany.contact_email}`} className="text-pink-400 text-sm md:text-base">
                  {selectedCompany.contact_email}
                </a>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {selectedCompany.website && (
                <a
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 md:py-4 bg-white/10 border border-white/10 rounded-xl text-white font-medium text-sm md:text-base text-center hover:bg-white/20 transition-colors"
                >
                  Voir le site
                </a>
              )}
              <button
                onClick={() => setSelectedCompany(null)}
                className="flex-1 py-3 md:py-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-white font-medium text-sm md:text-base"
              >
                Fermer
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ScheduleScreen;
