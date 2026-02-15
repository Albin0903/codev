import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';

const SortableItem = ({ id, match, index }: { id: number, match: any, index: number, key?: any }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-slate-800/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/10 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-pink-500/30 transition-colors"
    >
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xs md:text-sm font-bold">
        {index + 1}
      </div>
      <img 
        src={match.company.logo_url || '/assets/company-default.svg'} 
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-white p-1.5 border border-white/10" 
        alt={match.company.name} 
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm md:text-base truncate">{match.company.name}</h3>
        <p className="text-slate-400 text-xs md:text-sm truncate">{match.company.sector}</p>
      </div>
      <span className="material-symbols-outlined text-slate-500 text-lg md:text-xl">drag_indicator</span>
    </div>
  );
};

const PriorityScreen: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.getMatches();
        setMatches(response.results || response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMatches((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConfirm = async () => {
    try {
      const orderedIds = matches.map(m => m.id);
      await api.finalizePlan(orderedIds);
      navigate('/schedule');
    } catch (err: any) {
      alert("Erreur lors de la validation du planning : " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0f172a]">
      
      <div className="md:hidden">
        <AppHeader 
          leftElement={
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
          }
        />
      </div>

      {/* Desktop Breadcrumb/Back */}
      <div className="hidden md:flex px-8 py-4 items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium md:text-base">Retour</span>
        </button>
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        <h1 className="text-white font-bold text-lg md:text-xl">Priorités de vos matchs</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 md:pb-8">
        
        {/* Info Card - adjusted for desktop */}
        <div className="bg-pink-500/10 border border-pink-500/30 p-4 md:p-6 rounded-2xl flex items-start gap-4 mb-6 md:max-w-4xl">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-pink-400 md:text-2xl">tips_and_updates</span>
          </div>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            <strong className="text-white">Conseil :</strong> Classez vos entreprises préférées en haut. 
            Nous les placerons au meilleur moment de votre journée !
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm">Chargement de vos matchs...</p>
          </div>
        ) : matches.length > 0 ? (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={matches.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 md:max-w-4xl">
                {matches.map((match, index) => (
                  <SortableItem key={match.id} id={match.id} match={match} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-pink-400">inbox</span>
            </div>
            <h3 className="text-white font-semibold mb-1 md:text-lg">Aucun match pour le moment</h3>
            <p className="text-slate-400 text-sm md:text-base max-w-xs">Continuez à swiper pour obtenir des matchs !</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {matches.length > 0 && (
        <div className="fixed bottom-28 md:bottom-8 left-0 right-0 px-4 md:max-w-md md:mx-auto">
          <button 
            onClick={handleConfirm}
            className="w-full py-4 md:py-5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm md:text-base rounded-2xl shadow-xl shadow-pink-500/30 transition-all active:scale-[0.98]"
          >
            Valider mon planning
          </button>
        </div>
      )}
    </div>
  );
};

export default PriorityScreen;
