import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  time: string;
  title: string;
  person: string;
  location: string;
  status: 'confirmed' | 'pending';
  logo: string;
  companyUrl?: string;
  color: 'emerald' | 'orange';
  date: Date;
}

const ScheduleScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Interviews
        const interviewsResponse = await api.getInterviews();
        const interviewsData = interviewsResponse.results || interviewsResponse;

        if (Array.isArray(interviewsData)) {
          const formattedEvents = interviewsData.map((interview: any) => ({
            id: interview.id,
            time: new Date(interview.time_slot).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            title: `Entretien avec ${interview.match.company.name}`,
            person: interview.match.company.contact_name || 'Recruteur',
            location: interview.room || 'Stand A01',
            status: interview.status,
            logo: interview.match.company.logo_url || interview.match.company.logo || '/assets/company-default.svg',
            companyUrl: interview.match.company.website || '',
            color: (interview.status === 'confirmed' ? 'emerald' : 'orange') as 'emerald' | 'orange',
            date: new Date(interview.time_slot)
          }));
          formattedEvents.sort((a: Event, b: Event) => a.date.getTime() - b.date.getTime());
          setEvents(formattedEvents);
        }

        // Fetch Matches for "RDV en attente"
        const matchesResponse = await api.getMatches();
        const matchesData = matchesResponse.results || matchesResponse;
        if (Array.isArray(matchesData)) {
          setPendingAppointments(matchesData.length);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextEvent = events[0];
  const otherEvents = events.slice(1);
  const hasEvents = events.length > 0;
  const hasAnyData = hasEvents || pendingAppointments > 0;

  // Affichage normal avec la structure complète - même si vide
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="bg-gradient-blur"></div>
      
      <main className="flex-grow overflow-y-auto px-4 pb-32 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Forum Entreprise</p>
          <div className="rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary-dark dark:bg-primary-dark dark:text-primary-light">
            Jour J
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingAppointments}</span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Matchs en attente</span>
          </div>
          <div className="flex flex-col rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Entretiens programmés</span>
          </div>
        </div>
        <button style={{ marginTop: '2em', marginBottom: '1em' }}
            onClick={() => navigate('/priorities')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1E293B]/60 backdrop-blur-xl border border-primary/30 rounded-2xl text-primary font-bold text-sm hover:bg-primary/10 transition-all active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">sort</span>
            Modifier l'ordre de mes entretiens
          </button>

        {loading ? (
          <div className="mt-8 text-center text-slate-500">Chargement...</div>
        ) : hasEvents ? (
          <>
            {/* Swipe Hint */}
            <div className="mt-8 mb-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">Swipe vers le bas pour voir les entretiens passés</p>
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">expand_more</span>
            </div>

            <div className="space-y-4">
              <h2 className="px-2 text-lg font-bold text-slate-900 dark:text-white">Prochain RDV</h2>
              
              {nextEvent && (
                <div className="relative rounded-lg border-2 border-primary shadow-glass backdrop-blur-lg dark:border-primary-light">
                  <div className="rounded-[11px] bg-card-light p-4 dark:bg-card-dark">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aujourd'hui, {nextEvent.time}</p>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        nextEvent.status === 'confirmed' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                      }`}>
                        <span className={`w-3 h-3 inline-block rounded-full ${
                          nextEvent.status === 'confirmed' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}></span>
                        {nextEvent.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <img
                        src={nextEvent.logo}
                        alt="Company logo"
                        className="w-10 h-10 shrink-0 rounded-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-normal text-slate-900 dark:text-white">{nextEvent.title}</p>
                        {nextEvent.companyUrl && (
                          <a href={nextEvent.companyUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium hover:underline block">Visiter le site</a>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400">{nextEvent.person}, {nextEvent.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Events */}
              {otherEvents.length > 0 && (
                <>
                  <h2 className="px-2 pt-4 text-lg font-bold text-slate-900 dark:text-white">Autres entretiens</h2>
                  {otherEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-border-light bg-card-light p-4 shadow-glass backdrop-blur-lg dark:border-border-dark dark:bg-card-dark">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{event.time}</p>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          event.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                        }`}>
                          <span className={`w-3 h-3 inline-block rounded-full ${
                            event.status === 'confirmed' ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}></span>
                          {event.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <img
                          src={event.logo}
                          alt="Company logo"
                          className="w-10 h-10 shrink-0 rounded-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/company-default.svg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-base font-semibold leading-normal text-slate-900 dark:text-white">{event.title}</p>
                          {event.companyUrl && (
                            <a href={event.companyUrl} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium hover:underline block">Visiter le site</a>
                          )}
                          <p className="text-sm text-slate-500 dark:text-slate-400">{event.person}, {event.location}</p>
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
            <p className="text-slate-500 text-xs mt-1">Les entreprises vous contacteront après un match.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScheduleScreen;
