import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface StudentCard {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
  school: string;
  program: string;
  year: string;
  preferences: string;
  availability: string;
  duration: string;
  location: string;
  skills: Array<{ id: number; name: string }>;
  photo_url: string | null;
  photo_visible: boolean;
  linkedin_url: string;
  github_url: string;
}

const CompanySwipeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  const fetchNextStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/company/students/next_card/', {
        headers: {
          'Authorization': `Token ${api.getToken()}`,
        },
      });
      
      if (response.status === 204) {
        setStudent(null);
      } else if (response.ok) {
        const data = await response.json();
        setStudent(data);
        setShowDetails(false);
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

  useEffect(() => {
    fetchNextStudent();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!student || slideDirection) return;

    // 1. Animation
    setSlideDirection(direction);

    try {
      // 2. API Call
      const response = await fetch('http://localhost:8000/api/company/swipes/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${api.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.id,
          direction: direction,
        }),
      });
      
      const data = await response.json();
      
      // 3. Match Effect
      if (data.match) {
        const myConfetti = confetti.create(undefined, {
          resize: true,
          useWorker: true
        });
        
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#0d69f2', '#ec4899', '#8b5cf6'],
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
          setSlideDirection(null);
          fetchNextStudent();
        }, 300);
      }
    } catch (error) {
      console.error('Swipe failed:', error);
      setSlideDirection(null);
    }
  };

  if (loading && !student) {
    return (
      <div className="h-full flex items-center justify-center overflow-hidden">
        <div className="text-slate-200">Chargement...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <span className="material-symbols-outlined text-6xl text-slate-500 mb-4">sentiment_satisfied</span>
        <h2 className="text-xl font-bold text-white mb-2">C'est tout pour le moment !</h2>
        <p className="text-slate-400 text-sm max-w-xs">Vous avez vu tous les profils disponibles. Revenez plus tard pour découvrir de nouveaux étudiants.</p>
      </div>
    );
  }

  return (
    <div ref={confettiContainerRef} className="flex flex-col h-full w-full relative pt-4 pb-28 overflow-hidden">
      
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
          
          {/* Header with Avatar/Photo */}
          <div className="w-full h-28 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center px-6 border-b border-white/5 relative">
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="flex items-center gap-4 z-10 w-full">
              {/* Photo ou Avatar */}
              {student.photo_visible && student.photo_url ? (
                <img 
                  src={student.photo_url} 
                  alt="Photo"
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-white/10 shadow-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-white/10">
                  {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <h2 className="text-white text-xl font-bold leading-tight truncate">
                  {student.user?.first_name} {student.user?.last_name}
                </h2>
                <p className="text-slate-300 text-sm truncate">{student.program}</p>
                <p className="text-slate-400 text-xs truncate">{student.school} • {student.year}</p>
              </div>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 flex flex-col p-5 gap-5 overflow-y-auto no-scrollbar">
            
            {/* Location & Availability */}
            <div className="flex flex-col gap-3">
              {student.location && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-base text-pink-400">location_on</span>
                  {student.location}
                </div>
              )}
              {student.availability && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-base text-emerald-400">schedule</span>
                  {student.availability}
                </div>
              )}
              {student.duration && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-base text-cyan-400">hourglass_top</span>
                  {student.duration}
                </div>
              )}
            </div>

            {/* Skills */}
            {student.skills && student.skills.length > 0 && (
              <div>
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span 
                      key={skill.id} 
                      className="px-3 py-1 rounded-full text-xs font-bold border bg-primary/10 text-primary border-primary/30"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {student.preferences && (
              <div>
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-2">À propos</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {student.preferences}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3 mt-2">
              {student.linkedin_url && (
                <a 
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition"
                >
                  <span className="material-symbols-outlined text-sm">link</span>
                  LinkedIn
                </a>
              )}
              {student.github_url && (
                <a 
                  href={student.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-medium hover:bg-slate-500/20 transition"
                >
                  <span className="material-symbols-outlined text-sm">code</span>
                  GitHub
                </a>
              )}
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
      {showDetails && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-white/10">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E293B] border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {student.photo_visible && student.photo_url ? (
                  <img 
                    src={student.photo_url} 
                    alt="Photo"
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-lg font-bold">
                    {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-white font-bold">{student.user?.first_name} {student.user?.last_name}</h3>
                  <p className="text-slate-400 text-xs">{student.program}</p>
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
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">École</p>
                  <p className="text-white font-bold text-sm">{student.school}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Année</p>
                  <p className="text-white font-bold text-sm">{student.year}</p>
                </div>
                {student.availability && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Disponibilité</p>
                    <p className="text-white font-bold text-sm">{student.availability}</p>
                  </div>
                )}
                {student.duration && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Durée</p>
                    <p className="text-white font-bold text-sm">{student.duration}</p>
                  </div>
                )}
              </div>

              {/* Compétences */}
              {student.skills && student.skills.length > 0 && (
                <div>
                  <h4 className="text-slate-300 text-sm font-bold mb-2">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill) => (
                      <span 
                        key={skill.id} 
                        className="px-3 py-1 rounded-full text-xs font-bold border bg-primary/10 text-primary border-primary/30"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* À propos */}
              {student.preferences && (
                <div>
                  <h4 className="text-slate-300 text-sm font-bold mb-2">À propos</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{student.preferences}</p>
                </div>
              )}

              {/* Liens */}
              <div className="flex gap-2">
                {student.linkedin_url && (
                  <a 
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-400 font-medium text-sm transition"
                  >
                    <span className="material-symbols-outlined">link</span>
                    LinkedIn
                  </a>
                )}
                {student.github_url && (
                  <a 
                    href={student.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 font-medium text-sm transition"
                  >
                    <span className="material-symbols-outlined">code</span>
                    GitHub
                  </a>
                )}
              </div>
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

export default CompanySwipeScreen;
