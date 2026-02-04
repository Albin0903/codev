import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';

interface StudentCard {
  id: number;
  user: { first_name: string; last_name: string };
  school: string;
  program: string;
  year: string;
  role: string;
  about: string;
  availability: string;
  duration: string;
  location: string;
  skills: Array<{ id: number; name: string }>;
  experience: Array<{ position: string; company: string; duration: string; description?: string }>;
  education: Array<{ degree: string; school: string; year: string }>;
  languages: Array<{ language: string; level: string } | string>;
  photo_url: string | null;
  photo_visible: boolean;
  linkedin_url: string;
  github_url: string;
  cv_url: string | null;
}

const CompanySwipeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | 'enter' | null>('enter');
  const cardScrollRef = useRef<HTMLDivElement>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);

  // Lock body scroll on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const fetchNextStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/company/students/next_card/', {
        headers: { 'Authorization': `Token ${api.getToken()}` },
      });
      
      if (response.status === 204) {
        setStudent(null);
      } else if (response.ok) {
        setStudent(await response.json());
        setSwipeAnimation('enter');
        setTimeout(() => setSwipeAnimation(null), 400);
        if (cardScrollRef.current) cardScrollRef.current.scrollTop = 0;
        setShowAllSkills(false);
        setExpandedExp(null);
      } else {
        setStudent(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNextStudent(); }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!student || swipeAnimation) return;
    setSwipeAnimation(direction);

    try {
      const response = await fetch('http://localhost:8000/api/company/swipes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${api.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: student.id, direction }),
      });
      
      const data = await response.json();
      
      if (data.match) {
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
              matchType: 'company',
              studentName: `${student.user?.first_name} ${student.user?.last_name}`,
              studentPhoto: student.photo_visible && student.photo_url ? student.photo_url : null,
              studentInitials: `${student.user?.first_name?.[0]}${student.user?.last_name?.[0]}`
            }
          });
        }, 1500);
      } else {
        setTimeout(() => {
          setSwipeAnimation(null);
          fetchNextStudent();
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

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Recherche de talents...</span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-pink-400">sentiment_satisfied</span>
        </div>
        <h2 className="text-xl font-bold mb-2">C'est tout pour le moment !</h2>
        <p className="text-slate-400 text-sm max-w-xs">Revenez plus tard pour découvrir de nouveaux profils.</p>
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
              {/* Student Header */}
              <div className="p-6 flex items-center gap-6 border-b border-white/5 sticky top-0 bg-[#1e293b] md:bg-[#1e293b] z-10">
                {student.photo_visible && student.photo_url ? (
                  <img src={student.photo_url} alt="Avatar" className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover border-2 border-pink-500/50 shadow-lg" />
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-xl md:text-3xl font-bold truncate">{student.user?.first_name} {student.user?.last_name}</h2>
                <p className="text-pink-400 text-base md:text-xl font-medium">{student.program}</p>
                <p className="text-slate-400 text-sm md:text-base">{student.school} • {student.year}</p>
              </div>
            </div>

            {/* Quick Info Badges */}
            <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-white/5">
              {student.location && (
                <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-base md:text-lg text-pink-400">location_on</span>
                  {student.location}
                </div>
              )}
              {student.availability && (
                <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-base md:text-lg text-pink-400">calendar_today</span>
                  {student.availability}
                </div>
              )}
              {student.duration && (
                <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/5">
                  <span className="material-symbols-outlined text-base md:text-lg text-pink-400">schedule</span>
                  {student.duration}
                </div>
              )}
              {student.role && (
                <div className="flex items-center gap-1.5 text-slate-300 text-sm md:text-base bg-pink-500/10 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-pink-500/20">
                  <span className="material-symbols-outlined text-base md:text-lg text-pink-400">work</span>
                  {student.role}
                </div>
              )}
            </div>

            {/* About */}
            <div className="px-6 py-6 border-b border-white/5">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">À propos</h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                {student.about || 'Non renseigné'}
              </p>
            </div>

            {/* Skills */}
            {student.skills?.length > 0 && (
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Compétences</h3>
                  {student.skills.length > 6 && (
                    <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-pink-400 text-xs md:text-sm">
                      {showAllSkills ? 'Moins' : `+${student.skills.length - 6}`}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {(showAllSkills ? student.skills : student.skills.slice(0, 6)).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {student.experience?.length > 0 && (
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-white/5">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 md:mb-4">Expérience</h3>
                <div className="space-y-3 md:space-y-4">
                  {student.experience.map((exp, i) => {
                    const descTooLong = exp.description && exp.description.length > 80;
                    const shortDesc = descTooLong ? exp.description.substring(0, 80) + '...' : exp.description;
                    return (
                      <div key={i} className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4">
                        <p className="text-white font-semibold text-sm md:text-base">{exp.position}</p>
                        <p className="text-pink-400 text-xs md:text-sm">{exp.company}</p>
                        <p className="text-slate-500 text-xs md:text-sm">{exp.duration}</p>
                        {exp.description && (
                          <div className="mt-1 md:mt-2">
                            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                              {expandedExp === i ? exp.description : shortDesc}
                            </p>
                            {descTooLong && (
                              <button 
                                onClick={() => setExpandedExp(expandedExp === i ? null : i)} 
                                className="text-pink-400 text-xs md:text-sm mt-1"
                              >
                                {expandedExp === i ? 'Moins' : 'Plus'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Education */}
            {student.education?.length > 0 && (
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-white/5">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 md:mb-4">Formation</h3>
                <div className="space-y-3 md:space-y-4">
                  {student.education.map((edu, i) => (
                    <div key={i} className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4">
                      <p className="text-white font-semibold text-sm md:text-base">{edu.degree}</p>
                      <p className="text-pink-400 text-xs md:text-sm">{edu.school}</p>
                      <p className="text-slate-500 text-xs md:text-sm">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {student.languages?.length > 0 && (
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-white/5">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 md:mb-4">Langues</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {student.languages.map((lang, i) => (
                    <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium bg-white/5 text-slate-300 border border-white/10">
                      {typeof lang === 'string' ? lang : `${lang.language} (${lang.level})`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="px-5 md:px-6 py-4 md:py-5">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 md:mb-4">Liens</h3>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {student.linkedin_url && (
                  <a 
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl md:rounded-2xl text-blue-400 text-sm md:text-base transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                )}
                {student.github_url && (
                  <a 
                    href={student.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl text-slate-300 text-sm md:text-base transition-colors"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </a>
                )}
                {student.cv_url && (
                  <a 
                    href={student.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl md:rounded-2xl text-pink-400 text-sm md:text-base transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg md:text-xl">description</span>
                    Voir CV
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Padding for scroll */}
            <div className="h-4"></div>
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

export default CompanySwipeScreen;
