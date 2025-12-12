import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Interview {
  id: number;
  time: string;
  title: string;
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
        // Fetch company interviews
        const interviewsResponse = await api.getCompanyInterviews();
        const interviewsData = interviewsResponse.results || interviewsResponse;
        
        if (Array.isArray(interviewsData)) {
          const formattedInterviews = interviewsData.map((interview: any) => ({
            id: interview.id,
            time: new Date(interview.time_slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            title: `Entretien avec ${interview.match.student.first_name} ${interview.match.student.last_name}`,
            studentName: `${interview.match.student.first_name} ${interview.match.student.last_name}`,
            studentProgram: interview.match.student.program || 'Étudiant',
            location: interview.room || 'Stand A01',
            status: interview.status as 'confirmed' | 'pending' | 'scheduled',
            date: new Date(interview.time_slot)
          }));
          formattedInterviews.sort((a: Interview, b: Interview) => a.date.getTime() - b.date.getTime());
          setInterviews(formattedInterviews);
        }

        // Fetch company matches count
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
  const hasInterviews = interviews.length > 0;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="bg-gradient-blur"></div>
      
      <main className="flex-grow overflow-y-auto px-4 pb-32 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Forum Entreprise</p>
          <div className="rounded-full bg-pink-500/20 px-3 py-1 text-sm font-bold text-pink-400">
            Recruteur
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingMatches}</span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Matchs avec étudiants</span>
          </div>
          <div className="flex flex-col rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{interviews.length}</span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Entretiens programmés</span>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-slate-500">Chargement...</div>
        ) : hasInterviews ? (
          <>
            {/* Swipe Hint */}
            <div className="mt-8 mb-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">Swipe vers le bas pour voir les entretiens passés</p>
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">expand_more</span>
            </div>

            <div className="space-y-4">
              <h2 className="px-2 text-lg font-bold text-slate-900 dark:text-white">Prochain RDV</h2>
              
              {nextInterview && (
                <div className="relative rounded-lg border-2 border-pink-500 shadow-glass backdrop-blur-lg">
                  <div className="rounded-[11px] bg-card-light p-4 dark:bg-card-dark">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aujourd'hui, {nextInterview.time}</p>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        nextInterview.status === 'confirmed' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      }`}>
                        <span className={`w-3 h-3 inline-block rounded-full ${
                          nextInterview.status === 'confirmed' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}></span>
                        {nextInterview.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {nextInterview.studentName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-normal text-slate-900 dark:text-white">{nextInterview.studentName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{nextInterview.studentProgram}</p>
                        <p className="text-xs text-slate-400">{nextInterview.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Interviews */}
              {otherInterviews.length > 0 && (
                <>
                  <h2 className="px-2 pt-4 text-lg font-bold text-slate-900 dark:text-white">Autres entretiens</h2>
                  {otherInterviews.map((interview) => (
                    <div key={interview.id} className="rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{interview.time}</p>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          interview.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                        }`}>
                          <span className={`w-3 h-3 inline-block rounded-full ${
                            interview.status === 'confirmed' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}></span>
                          {interview.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {interview.studentName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold leading-normal text-slate-900 dark:text-white">{interview.studentName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{interview.studentProgram}</p>
                          <p className="text-xs text-slate-400">{interview.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="pt-2 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">expand_less</span>
                <p className="text-xs text-slate-400 dark:text-slate-500">Swipe vers le haut pour voir les futurs entretiens</p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-slate-500 mb-3">event_busy</span>
            <p className="text-slate-400 text-sm">Aucun entretien programmé pour le moment.</p>
            <p className="text-slate-500 text-xs mt-1">Swipez sur des étudiants pour créer des matchs.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyScheduleScreen;
