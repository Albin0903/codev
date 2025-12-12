import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  role: string;
  about: string;
  availability: string;
  duration: string;
  location: string;
  skills: Array<{ id: number; name: string }>;
  experience: Array<{ position: string; company: string; duration: string; description?: string }>;
  education: Array<{ degree: string; school: string; year: string; description?: string }>;
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
          className={`relative flex flex-col w-full h-full bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-10 transition-all duration-500 ease-out transform ${
            slideDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : 
            slideDirection === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : 
            'translate-x-0 rotate-0 opacity-100'
          }`}
        >
          
          {/* Header with Avatar/Photo */}
          <div className="w-full py-4 px-5 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4 w-full">
              {student.photo_visible && student.photo_url ? (
                <img 
                  src={student.photo_url} 
                  alt="Photo"
                  className="h-14 w-14 rounded-xl object-cover border-2 border-white/10 shadow-lg"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/10">
                  {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <h2 className="text-white text-lg font-bold leading-tight truncate">
                  {student.user?.first_name} {student.user?.last_name}
                </h2>
                <p className="text-slate-300 text-sm truncate">{student.program}</p>
                <p className="text-slate-400 text-xs truncate">{student.role || 'Étudiant'}{student.year ? ` • ${student.year}` : ''} • {student.school}</p>
              </div>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            
            {/* Info Cards Row */}
            <div className="flex flex-wrap gap-2 p-4 border-b border-white/5">
              {student.location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <span className="material-symbols-outlined text-xs text-pink-400">location_on</span>
                  <span className="text-slate-300 text-xs">{student.location}</span>
                </div>
              )}
              {student.availability && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="material-symbols-outlined text-xs text-emerald-400">schedule</span>
                  <span className="text-slate-300 text-xs">{student.availability}</span>
                </div>
              )}
              {student.duration && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <span className="material-symbols-outlined text-xs text-cyan-400">hourglass_top</span>
                  <span className="text-slate-300 text-xs">{student.duration}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {student.skills && student.skills.length > 0 && (
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.slice(0, 6).map((skill) => (
                    <span 
                      key={skill.id} 
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-primary/10 text-primary border-primary/30"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {student.skills.length > 6 && (
                    <span className="px-2 py-1 text-[10px] text-slate-500">+{student.skills.length - 6}</span>
                  )}
                </div>
              </div>
            )}

            {/* Experience - Highlighted */}
            {Array.isArray(student.experience) && student.experience.length > 0 && (
              <div className="px-4 py-3 border-b border-white/5 bg-amber-500/5">
                <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">work</span>
                  Expérience
                </h3>
                <div className="space-y-2">
                  {student.experience.slice(0, 2).map((exp, i) => (
                    <div key={i} className="bg-amber-500/10 rounded-lg p-2.5 border border-amber-500/20">
                      <p className="text-amber-100 font-bold text-sm">{exp.position}</p>
                      <p className="text-slate-400 text-xs">{exp.company} • {exp.duration}</p>
                    </div>
                  ))}
                  {student.experience.length > 2 && (
                    <p className="text-slate-500 text-xs text-center">+{student.experience.length - 2} autre(s)</p>
                  )}
                </div>
              </div>
            )}

            {/* Education - Highlighted */}
            {Array.isArray(student.education) && student.education.length > 0 && (
              <div className="px-4 py-3 border-b border-white/5 bg-blue-500/5">
                <h3 className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Formation
                </h3>
                <div className="space-y-2">
                  {student.education.slice(0, 2).map((edu, i) => (
                    <div key={i} className="bg-blue-500/10 rounded-lg p-2.5 border border-blue-500/20">
                      <p className="text-blue-100 font-bold text-sm">{edu.degree}</p>
                      <p className="text-slate-400 text-xs">{edu.school} • {edu.year}</p>
                    </div>
                  ))}
                  {student.education.length > 2 && (
                    <p className="text-slate-500 text-xs text-center">+{student.education.length - 2} autre(s)</p>
                  )}
                </div>
              </div>
            )}

            {/* About - Compact */}
            {student.about && (
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">À propos</h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {student.about}
                </p>
              </div>
            )}

            {/* Social Links & CV */}
            <div className="flex flex-wrap gap-2 p-4">
              {student.linkedin_url && (
                <a 
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition"
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-medium hover:bg-slate-500/20 transition"
                >
                  <span className="material-symbols-outlined text-sm">code</span>
                  GitHub
                </a>
              )}
              {student.cv_url && (
                <a 
                  href={student.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Voir CV
                </a>
              )}
            </div>

            {/* Voir plus button */}
            <div className="p-4 pt-0">
              <button
                onClick={() => setShowDetails(true)}
                className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">info</span>
                Voir le profil complet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Voir Plus - Même design que l'aperçu recruteur */}
      {showDetails && student && createPortal(
        <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm pointer-events-auto">
          <div className="w-[90%] max-w-md h-[90%] flex flex-col bg-[#1E293B] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowDetails(false)} 
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header with Avatar/Photo */}
            <div className="w-full py-4 px-5 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center border-b border-white/5 shrink-0">
              <div className="flex items-center gap-4 w-full">
                {student.photo_visible && student.photo_url ? (
                  <img 
                    src={student.photo_url} 
                    alt="Photo"
                    className="h-14 w-14 rounded-xl object-cover border-2 border-white/10 shadow-lg"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/10">
                    {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <h2 className="text-white text-lg font-bold leading-tight truncate">
                    {student.user?.first_name} {student.user?.last_name}
                  </h2>
                  <p className="text-slate-300 text-sm truncate">{student.program}</p>
                  <p className="text-slate-400 text-xs truncate">{student.role || 'Étudiant'}{student.year ? ` • ${student.year}` : ''} • {student.school}</p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-2 p-4 border-b border-white/5">
                  {student.location && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <span className="material-symbols-outlined text-xs text-pink-400">location_on</span>
                      <span className="text-slate-300 text-xs">{student.location}</span>
                    </div>
                  )}
                  {student.availability && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xs text-emerald-400">schedule</span>
                      <span className="text-slate-300 text-xs">{student.availability}</span>
                    </div>
                  )}
                  {student.duration && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="material-symbols-outlined text-xs text-cyan-400">hourglass_top</span>
                      <span className="text-slate-300 text-xs">{student.duration}</span>
                    </div>
                  )}
                </div>

                {/* Skills - Full */}
                {student.skills && student.skills.length > 0 && (
                  <div className="px-4 py-3 border-b border-white/5">
                    <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {student.skills.map((skill) => (
                        <span 
                          key={skill.id} 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-primary/10 text-primary border-primary/30"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience - Full */}
                {Array.isArray(student.experience) && student.experience.length > 0 && (
                  <div className="px-4 py-3 border-b border-white/5 bg-amber-500/5">
                    <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">work</span>
                      Expérience
                    </h3>
                    <div className="space-y-2">
                      {student.experience.map((exp, i) => (
                        <div key={i} className="bg-amber-500/10 rounded-lg p-2.5 border border-amber-500/20">
                          <p className="text-amber-100 font-bold text-sm">{exp.position}</p>
                          <p className="text-slate-400 text-xs">{exp.company} • {exp.duration}</p>
                          {exp.description && (
                            <p className="text-slate-500 text-xs mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education - Full */}
                {Array.isArray(student.education) && student.education.length > 0 && (
                  <div className="px-4 py-3 border-b border-white/5 bg-blue-500/5">
                    <h3 className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">school</span>
                      Formation
                    </h3>
                    <div className="space-y-2">
                      {student.education.map((edu, i) => (
                        <div key={i} className="bg-blue-500/10 rounded-lg p-2.5 border border-blue-500/20">
                          <p className="text-blue-100 font-bold text-sm">{edu.degree}</p>
                          <p className="text-slate-400 text-xs">{edu.school} • {edu.year}</p>
                          {edu.description && (
                            <p className="text-slate-500 text-xs mt-1">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About - Full */}
                {student.about && (
                  <div className="px-4 py-3 border-b border-white/5">
                    <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1.5">À propos</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {student.about}
                    </p>
                  </div>
                )}

                {/* Social Links & CV */}
                <div className="flex flex-wrap gap-2 p-4">
                  {student.linkedin_url && (
                    <a 
                      href={student.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition"
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-medium hover:bg-slate-500/20 transition"
                    >
                      <span className="material-symbols-outlined text-sm">code</span>
                      GitHub
                    </a>
                  )}
                  {student.cv_url && (
                    <a 
                      href={student.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
                    >
                      <span className="material-symbols-outlined text-sm">description</span>
                      Voir CV
                    </a>
                  )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 shrink-0 bg-slate-800/50">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-modal-container') || document.body
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
