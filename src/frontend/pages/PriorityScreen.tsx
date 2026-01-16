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

// Composant pour chaque carte d'entreprise triable
const SortableItem = ({ id, match }: { id: number, match: any }) => {
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
      className="bg-[#1E293B]/80 backdrop-blur-xl p-4 rounded-2xl mb-3 border border-white/10 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <div className="bg-white/10 p-2 rounded-lg text-xs font-bold text-slate-400 w-8 h-8 flex items-center justify-center">
        {/* L'index sera géré par l'ordre dans la liste */}
        <span className="material-symbols-outlined text-sm">drag_indicator</span>
      </div>
      <img 
        src={match.company.logo_url || '/assets/company-default.svg'} 
        className="w-12 h-12 rounded-full object-contain bg-white p-1" 
        alt={match.company.name} 
      />
      <div className="flex-1">
        <h3 className="text-white font-bold">{match.company.name}</h3>
        <p className="text-slate-400 text-xs">{match.company.sector}</p>
      </div>
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
    // Utilisation de la nouvelle fonction structurée
    await api.finalizePlan(orderedIds);
    navigate('/schedule');
  } catch (err: any) {
    alert("Erreur lors de la validation du planning : " + err.message);
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col p-6 relative">
      <div className="bg-gradient-blur fixed inset-0 z-0"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Classez vos Matchs</h1>
          
          {/* Indicateur Anti-Stress demandé */}
          <div className="bg-primary/20 border border-primary/30 p-4 rounded-2xl flex items-start gap-3 text-left">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-sm text-slate-200">
              <strong>Conseil :</strong> Classez vos entreprises préférées en haut. 
              Nous les placerons au milieu de votre journée pour que vous soyez au top de votre forme !
            </p>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-white">Chargement de vos matchs...</div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={matches.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {matches.map((match, index) => (
                <div key={match.id} className="relative">
                  <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-primary font-bold opacity-50">
                    #{index + 1}
                  </span>
                  <SortableItem id={match.id} match={match} />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}

        <button 
          onClick={handleConfirm}
          className="w-full mt-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          Valider mon planning personnalisé
        </button>
      </div>
    </div>
  );
};

export default PriorityScreen;