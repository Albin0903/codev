import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Interview {
  id: number;
  time: string;
  studentName: string;
  studentProgram: string;
  location: string;
  status: 'confirmed' | 'pending' | 'scheduled';
  date: Date;
}

const CompanyScheduleScreen: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const interviewsResponse = await api.getCompanyInterviews();
        const interviewsData = interviewsResponse.results || interviewsResponse;
        
        if (Array.isArray(interviewsData)) {
          const formattedInterviews = interviewsData.map((interview: any) => ({
            id: interview.id,
            time: new Date(interview.time_slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            studentName: `${interview.match.student.user.first_name} ${interview.match.student.user.last_name}`,
            studentProgram: interview.match.student.program || 'Étudiant',
            location: interview.room || 'Stand A01',
            status: interview.status as 'confirmed' | 'pending' | 'scheduled',
            date: new Date(interview.time_slot)
          }));
          formattedInterviews.sort((a: Interview, b: Interview) => a.date.getTime() - b.date.getTime());
          setInterviews(formattedInterviews);
        }

        const matchesResponse = await api.getCompanyMatches();
        const matchesData = matchesResponse.results || matchesResponse;
        if (Array.isArray(matchesData)) {
          setPendingMatches(matchesData.length);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextInterview = interviews[0];
  const otherInterviews = interviews.slice(1);

  return (
    // max-w-4xl au lieu de max-w-6xl pour réduire la largeur globale
    <div className="flex flex-col px-4 pt-6 pb-20 gap-6 w-full max-w-4xl mx-auto bg-[#0F172A] min-h-screen font-display">
      
      {/* HEADER - Plus compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 font-black mb-0.5">Planning Recruteur</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Gestion des entretiens</h1>
        </div>
        <div className="flex items-center">
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-bold">
               Entreprise 
            </span>
        </div>
      </div>

      {/* STATS GRID - Plus petite hauteur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Candidats matchés</p>
            <p className="text-2xl font-black text-white">{pendingMatches}</p>
          </div>
          <span className="material-symbols-outlined text-2xl text-pink-500/20">group_add</span>
        </div>
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Sessions programmées</p>
            <p className="text-2xl font-black text-white">{interviews.length}</p>
          </div>
          <span className="material-symbols-outlined text-2xl text-indigo-500/20">event_upcoming</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-slate-500 text-xs font-bold tracking-widest uppercase italic">Chargement...</div>
      ) : (
        <div className="space-y-6">
          
          {/* NEXT INTERVIEW - Taille réduite */}
          {nextInterview && (
            <section className="space-y-3">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 pl-1">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                Prochaines rencontres
              </h2>
              
              <div className="relative bg-gradient-to-r from-pink-500/5 to-indigo-500/5 border border-pink-500/40 rounded-3xl p-5 shadow-xl transition-all hover:border-pink-500/60">
                <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                    {nextInterview.studentName.charAt(0)}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-1">
                      <span className="text-pink-400 font-black text-sm">{nextInterview.time}</span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {nextInterview.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight">{nextInterview.studentName}</h3>
                    <p className="text-slate-400 font-medium text-xs italic">{nextInterview.studentProgram}</p>
                    <div className="text-slate-500 text-[10px] mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                      <span className="material-symbols-outlined text-[12px] text-pink-400">location_on</span>
                      {nextInterview.location}
                    </div>
                  </div>

                  <button className="px-5 py-2 rounded-xl bg-white text-black font-black text-[10px] hover:scale-105 transition-transform shadow-md">
                      VOIR CV
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* LIST OF OTHER INTERVIEWS - Plus compacte */}
          {otherInterviews.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-black text-slate-500 tracking-tight pl-1 uppercase tracking-widest">Sessions suivantes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {otherInterviews.map((interview) => (
                  <div key={interview.id} className="bg-[#1E293B]/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                      {interview.studentName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-indigo-400 font-bold text-[11px]">{interview.time}</span>
                        <span className="text-[8px] font-black text-orange-400 uppercase tracking-tighter">
                          {interview.status}
                        </span>
                      </div>
                      <h4 className="text-white font-bold text-sm truncate">{interview.studentName}</h4>
                      <p className="text-slate-500 text-[10px] truncate">{interview.studentProgram}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* FOOTER - Plus discret */}
      <div className="flex flex-col items-center py-2 opacity-10">
          <p className="text-[8px] font-bold uppercase tracking-widest text-white italic">Archives des entretiens</p>
      </div>
    </div>
  );
};

export default CompanyScheduleScreen;