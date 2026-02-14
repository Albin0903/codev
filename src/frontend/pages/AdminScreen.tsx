import React, { useState } from 'react';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';

const AdminScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (type: 'matches' | 'db') => {
        if (!confirm(type === 'db' ? "ATTENTION: Cela va TOUT effacer !" : "Voulez-vous réinitialiser les matchs ?")) return;

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const token = api.getToken();
            const endpoint = type === 'db' ? 'reset-db/' : 'reset-matches/';

            const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Opération réussie');
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    const handleComputeScores = async () => {
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const token = api.getToken();
            const response = await fetch('http://localhost:8000/api/compute-scores/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || `${data.count} scores calculés`);
            } else {
                setError(data.error || 'Une erreur est survenue');
            }
        } catch (err: any) {
            setError(err.message || 'Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-4 text-white">
            <AppHeader />
            <div className="max-w-md mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-center">Administration</h1>

                {message && (
                    <div className="p-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-semibold mb-2">🧠 Scores IA</h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Pré-calcule les scores de matching entre tous les étudiants et toutes les offres.
                            À lancer après l'ajout de nouveaux profils ou offres.
                        </p>
                        <button
                            onClick={handleComputeScores}
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Calcul en cours...' : 'Calculer les Scores IA'}
                        </button>
                    </div>

                    <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-semibold mb-2">Matchs & Swipes</h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Supprime uniquement les interactions (likes, matchs, rendez-vous, scores).
                            Les profils étudiants et entreprises sont conservés.
                        </p>
                        <button
                            onClick={() => handleReset('matches')}
                            disabled={loading}
                            className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : 'Réinitialiser les Matchs'}
                        </button>
                    </div>

                    <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-semibold mb-2 text-red-400">DANGER ZONE</h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Réinitialise TOUTE la base de données. Tous les comptes seront supprimés.
                        </p>
                        <button
                            onClick={() => handleReset('db')}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : 'Reset Database (Full)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminScreen;
