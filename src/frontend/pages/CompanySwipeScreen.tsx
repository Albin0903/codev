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

    setSlideDirection(direction);

    try {
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
      
      if (data.match) {
        const myConfetti = confetti.create(undefined, { resize: true, useWorker: true });
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
      <div className="h-full flex items-center justify-center bg-[#0F172A]">
        <div className="text-slate-200 animate-pulse">Recherche de talents...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-[#0F172A]">
        <span className="material-symbols-outlined text-6xl text-slate-500 mb-4">sentiment_satisfied</span>
        <h2 className="text-xl font-bold text-white mb-2">C'est tout pour le moment !</h2>
        <p className="text-slate-400 text-sm max-w-xs">Revenez plus tard pour découvrir de nouveaux profils.</p>
      </div>
    );
  }

  return (
    <div ref={confettiContainerRef} className="flex flex-col h-full w-full relative pt-4 pb-28 overflow-hidden bg-[#0F172A]">
      
      {/* Card Container - Pleine largeur mais centré visuellement */}
      <div className="flex-1 flex items-center justify-center relative w-full min-h-0 px-4 mb-6 perspective-1000">
        
        {/* Main Card */}
        <div 
          className={`relative flex flex-col w-full h-full bg-[#1E293B] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 z-10 transition-all duration-500 ease-out transform ${
            slideDirection === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : 
            slideDirection === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : 
            'translate-x-0 rotate-0 opacity-100'
          }`}
        >
          
          {/* Header avec Max-Width pour centrer le contenu */}
          <div className="w-full py-8 px-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5 shrink-0">
            <div className="max-w-4xl mx-auto flex items-center gap-6">
              {student.photo_visible && student.photo_url ? (
                <img src={student.photo_url} alt="Avatar" className="h-20 w-20 rounded-2xl object-cover border-2 border-white/10 shadow-xl" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="text-white text-3xl font-bold tracking-tight">{student.user?.first_name} {student.user?.last_name}</h2>
                <p className="text-violet-400 font-medium text-lg">{student.program}</p>
                <p className="text-slate-400 text-sm">{student.school} • {student.year || 'M1'}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
              
              {/* Badges Row */}
              <div className="flex flex-wrap gap-3">
                {student.location && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-sm text-pink-400">location_on</span> {student.location}
                  </div>
                )}
                {student.availability && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-white/5 text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-sm text-emerald-400">calendar_today</span> {student.availability}
                  </div>
                )}
              </div>

              {/* Grid 2 colonnes pour Expérience et Formation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Expérience */}
                <section className="space-y-4">
                  <h3 className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">work</span> Expériences
                  </h3>
                  <div className="space-y-3">
                    {student.experience?.slice(0, 3).map((exp, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-white font-bold text-sm">{exp.position}</p>
                        <p className="text-slate-400 text-xs">{exp.company} • {exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Formation */}
                <section className="space-y-4">
                  <h3 className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">school</span> Formations
                  </h3>
                  <div className="space-y-3">
                    {student.education?.slice(0, 3).map((edu, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors">
                        <p className="text-white font-bold text-sm">{edu.degree}</p>
                        <p className="text-slate-400 text-xs">{edu.school} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Compétences (Badges compacts) */}
              <section className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Stack Technique</h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span key={skill.id} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold uppercase">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>

              {/* À propos (Citation style) */}
              {student.about && (
                <section className="pt-6 border-t border-white/5">
                  <p className="text-slate-400 text-base leading-relaxed italic font-serif">
                    "{student.about}"
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Centered */}
      <div className="flex justify-center items-center gap-10 shrink-0 z-30 pb-4">
        <button 
          onClick={() => handleSwipe('left')}
          className="h-16 w-16 flex items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all shadow-xl hover:scale-110 active:scale-90"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        
        <button 
          onClick={() => handleSwipe('right')}
          className="h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-2xl shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-4xl fill">favorite</span>
        </button>
      </div>
    </div>
  );
};

export default CompanySwipeScreen;