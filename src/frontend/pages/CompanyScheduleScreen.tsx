import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { useBottomNav } from '../contexts/BottomNavContext';

interface Interview {
  id: number;
  time: string;
  studentName: string;
  studentProgram: string;
  location: string;
  status: 'confirmed' | 'pending' | 'scheduled';
  date: Date;
  initials: string;
  student?: any;
}

interface SwipeItem {
  id: number;
  student: {
    id: number;
    user: { first_name: string; last_name: string };
    school: string;
    program: string;
    photo_url: string | null;
    photo_visible: boolean;
    cv_url: string | null;
    about?: string;
    skills?: Array<{ id: number; name: string }>;
  };
  direction: 'left' | 'right';
  created_at: string;
}

interface MatchItem {
  id: number;
  student: {
    id: number;
    user: { first_name: string; last_name: string };
    school: string;
    program: string;
    photo_url: string | null;
    photo_visible: boolean;
    cv_url: string | null;
    about?: string;
    skills?: Array<{ id: number; name: string }>;
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

const CompanyScheduleScreen: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [swipes, setSwipes] = useState<SwipeItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('interviews');
  const navigate = useNavigate();
  const { hideNav, showNav } = useBottomNav();
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

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
        const interviewsResponse = await api.getCompanyInterviews();
        const interviewsData = interviewsResponse.results || interviewsResponse;
        
        if (Array.isArray(interviewsData)) {
          const formattedInterviews = interviewsData.map((interview: any) => {
            const firstName = interview.match.student.user.first_name || '';
            const lastName = interview.match.student.user.last_name || '';
            return {
              id: interview.id,
              time: new Date(interview.time_slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              studentName: `${firstName} ${lastName}`,
              studentProgram: interview.match.student.program || 'Étudiant',
              location: interview.room || 'Stand A01',
              status: interview.status as 'confirmed' | 'pending' | 'scheduled',
              date: new Date(interview.time_slot),
              initials: `${firstName[0] || ''}${lastName[0] || ''}`,
              student: interview.match.student
            };
          });
          formattedInterviews.sort((a: Interview, b: Interview) => a.date.getTime() - b.date.getTime());
          setInterviews(formattedInterviews);
        }

        // Fetch matches
        const matchesResponse = await api.getCompanyMatches();
        const matchesData = matchesResponse.results || matchesResponse;
        if (Array.isArray(matchesData)) {
          setMatches(matchesData);
        }

        // Fetch swipes (likes history) - exclude those already matched
        try {
          const swipesResponse = await api.getCompanySwipes();
          const swipesData = swipesResponse.results || swipesResponse;
          if (Array.isArray(swipesData)) {
            // Get matched student IDs
            const matchedStudentIds = new Set(matchesData.map((m: MatchItem) => m.student.id));
            // Filter: only right swipes that are NOT in matches
            setSwipes(swipesData.filter((s: SwipeItem) => 
              s.direction === 'right' && !matchedStudentIds.has(s.student.id)
            ));
          }
        } catch (e) {
          console.error('Error fetching swipes:', e);
        }

      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle modal visibility and bottom nav + lock body scroll
  useEffect(() => {
    if (selectedStudent) {
      hideNav();
      document.body.style.overflow = 'hidden';
    } else {
      showNav();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStudent, hideNav, showNav]);

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
      setSelectedStudent(null);
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

  const getStudentInitials = (student: any) => {
    const firstName = student?.user?.first_name || '';
    const lastName = student?.user?.last_name || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`;
  };

  const getStudentName = (student: any) => {
    return `${student?.user?.first_name || ''} ${student?.user?.last_name || ''}`.trim() || 'Étudiant';
  };

  const sections = [
    { 
      id: 'interviews', 
      label: 'Entretiens', 
      icon: 'calendar_month', 
      count: interviews.length, 
      color: 'pink',
      items: interviews
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

  const renderStudentCard = (item: any, type: 'interview' | 'match' | 'like') => {
    const student = type === 'interview' ? item.student : item.student;
    const isInterview = type === 'interview';
    
    return (
      <button
        key={item.id}
        onClick={() => setSelectedStudent(student)}
        className="flex flex-col items-center p-3 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-all text-center group"
      >
        {student?.photo_visible && student?.photo_url ? (
          <img
            src={student.photo_url}
            alt={getStudentName(student)}
            className="w-14 h-14 rounded-xl object-cover border-2 border-pink-500/30 mb-2"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold mb-2">
            {isInterview ? item.initials : getStudentInitials(student)}
          </div>
        )}
        <p className="text-white font-medium text-xs truncate w-full">
          {isInterview ? item.studentName : getStudentName(student)}
        </p>
        {isInterview ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-pink-400 text-sm">schedule</span>
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

        {/* Stats Summary - Mobile only */}
        <div className="pb-4 md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3 text-center">
              <span className="text-2xl font-bold text-white">{interviews.length}</span>
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
        </div>

        {/* Desktop: Date du jour */}
        <div className="hidden md:flex md:justify-end pb-4 md:max-w-5xl md:mx-auto">
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
                        {section.id === 'interviews' && section.items.map((interview: any) => 
                          renderStudentCard(interview, 'interview')
                        )}
                        {section.id === 'matches' && section.items.map((match: any) => 
                          renderStudentCard(match, 'match')
                        )}
                        {section.id === 'likes' && section.items.map((swipe: any) => 
                          renderStudentCard(swipe, 'like')
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
                      {section.id === 'interviews' && section.items.map((interview: any) => (
                        <button
                          key={interview.id}
                          onClick={() => setSelectedStudent(interview.student)}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-pink-500/30 transition-all text-left"
                        >
                          {interview.student?.photo_visible && interview.student?.photo_url ? (
                            <img
                              src={interview.student.photo_url}
                              alt={interview.studentName}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-pink-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shrink-0">
                              {interview.initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">{interview.studentName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-pink-400 text-xs md:text-sm">schedule</span>
                              <span className="text-pink-400 text-xs md:text-sm font-medium">{interview.time}</span>
                              <span className="text-slate-500 text-[10px] md:text-xs ml-1 truncate">{interview.studentProgram}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {section.id === 'matches' && section.items.map((match: any) => (
                        <button
                          key={match.id}
                          onClick={() => setSelectedStudent(match.student)}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-left"
                        >
                          {match.student?.photo_visible && match.student?.photo_url ? (
                            <img
                              src={match.student.photo_url}
                              alt={getStudentName(match.student)}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-pink-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shrink-0">
                              {getStudentInitials(match.student)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">{getStudentName(match.student)}</p>
                            <p className="text-emerald-400 text-xs md:text-sm">Match ✓</p>
                          </div>
                        </button>
                      ))}
                      {section.id === 'likes' && section.items.map((swipe: any) => (
                        <button
                          key={swipe.id}
                          onClick={() => setSelectedStudent(swipe.student)}
                          className="w-full flex items-center gap-3 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/30 transition-all text-left"
                        >
                          {swipe.student?.photo_visible && swipe.student?.photo_url ? (
                            <img
                              src={swipe.student.photo_url}
                              alt={getStudentName(swipe.student)}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-pink-500/30"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shrink-0">
                              {getStudentInitials(swipe.student)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm md:text-base truncate">{getStudentName(swipe.student)}</p>
                            <p className="text-slate-500 text-xs md:text-sm">En attente</p>
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl flex flex-col animate-slide-up md:animate-modal-in max-h-[85vh] md:max-h-[70vh] transition-transform"
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
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-10 md:pb-6">
            
            <div className="flex items-center gap-4 mb-6">
              {selectedStudent.photo_visible && selectedStudent.photo_url ? (
                <img
                  src={selectedStudent.photo_url}
                  alt={getStudentName(selectedStudent)}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-pink-500/50"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                  {getStudentInitials(selectedStudent)}
                </div>
              )}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{getStudentName(selectedStudent)}</h3>
                <p className="text-pink-400 text-sm md:text-base">{selectedStudent.program}</p>
                <p className="text-slate-400 text-xs md:text-sm">{selectedStudent.school}</p>
              </div>
            </div>

            {selectedStudent.about && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">À propos</h4>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">{selectedStudent.about}</p>
              </div>
            )}

            {selectedStudent.skills && selectedStudent.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map((skill: any) => (
                    <span key={skill.id} className="px-3 py-1 md:px-4 md:py-1.5 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 text-xs md:text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.experience && selectedStudent.experience.length > 0 && (
              <div className="mb-4">
                <h4 className="text-slate-500 text-xs md:text-sm uppercase tracking-widest mb-2">Expérience</h4>
                <div className="space-y-2">
                  {selectedStudent.experience.map((exp: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 md:p-4">
                      <p className="text-white font-semibold text-sm md:text-base">{exp.position}</p>
                      <p className="text-pink-400 text-xs md:text-sm">{exp.company}</p>
                      <p className="text-slate-500 text-xs md:text-sm">{exp.duration}</p>
                      {exp.description && <p className="text-slate-400 text-xs md:text-sm mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent.linkedin_url && (
              <div className="mb-4">
                <a
                  href={selectedStudent.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {selectedStudent.cv_url && (
                <a
                  href={selectedStudent.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 md:py-4 bg-white/10 border border-white/10 rounded-xl text-white font-medium text-sm md:text-base text-center hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">description</span>
                  Voir le CV
                </a>
              )}
              <button
                onClick={() => setSelectedStudent(null)}
                className="flex-1 py-3 md:py-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-white font-medium text-sm md:text-base"
              >
                Fermer
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyScheduleScreen;
