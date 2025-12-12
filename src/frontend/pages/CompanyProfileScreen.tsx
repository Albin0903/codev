import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { api } from '../services/api';

const CompanyProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const userType = api.getUserType ? api.getUserType() : null;
        if (userType !== 'company') {
          setError('Accès réservé aux comptes entreprise');
          setLoading(false);
          return;
        }
        const data = await api.getCurrentCompany();
        setCompany(data);
        setFormData({
          name: data?.name || '',
          sector: data?.sector || '',
          description: data?.description || '',
          website: data?.website || '',
          contact_email: data?.contact_email || '',
          contact_name: data?.contact_name || '',
          address: data?.address || '',
          employees: data?.employees || '',
          founded_year: data?.founded_year || '',
          benefits: data?.benefits || '',
        });
        const offersData = await api.getCompanyOffers();
        setOffers(Array.isArray(offersData) ? offersData : []);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger le profil entreprise');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const updated = await api.uploadCompanyLogo(file);
      setCompany(updated);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      alert(err.message || 'Impossible de téléverser le logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200">
        Chargement du profil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-200 px-6">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <button
          onClick={() => {
            api.clearAuth();
            navigate('/login');
          }}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-lg hover:brightness-110 transition"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 pt-6 pb-32 gap-6 w-full max-w-full">
      <div className="relative bg-gradient-to-br from-[#0f172a] to-[#0b1323] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="relative flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20 shadow-xl">
                  {company?.name?.[0] || 'E'}
                </div>
              )}
              <button
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] border border-white/20 hover:bg-white/20"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? 'Import...' : 'Changer'}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                  if (logoInputRef.current) logoInputRef.current.value = '';
                }}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 font-semibold">Entreprise</p>
              <h1 className="text-2xl font-bold text-white">{company?.name || 'Entreprise'}</h1>
              <p className="text-slate-300 text-sm">{company?.sector || 'Secteur non défini'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {company?.logo_url && (
              <button
                className="p-2 rounded-xl bg-white/10 text-red-300 border border-white/10 hover:bg-white/20"
                onClick={async () => {
                  try {
                    const updated = await api.deleteCompanyLogo();
                    setCompany(updated);
                  } catch (err: any) {
                    alert(err.message || 'Suppression impossible');
                  }
                }}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            )}
            <button
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-emerald-100 border border-emerald-400/30 hover:brightness-110"
              onClick={() => setEditing(true)}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <InfoTile icon="badge" label="Représentant" value={company?.contact_name || 'Non renseigné'} subtitle={company?.contact_email} />
          <InfoTile icon="business" label="Adresse" value={company?.address || 'Non renseignée'} />
          <InfoTile icon="group" label="Effectif" value={company?.employees ? `${company.employees} personnes` : 'Non renseigné'} />
          <InfoTile icon="event" label="Créée en" value={company?.founded_year || 'Non renseignée'} />
          <InfoTile icon="redeem" label="Avantages" value={company?.benefits || 'Non renseignés'} multiline />
          <InfoTile icon="public" label="Site web" value={company?.website || 'Non renseigné'} isLink={!!company?.website} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-3">Offres de stage</h2>
        {!Array.isArray(offers) || offers.length === 0 ? (
          <div className="text-slate-400 text-sm">Aucune offre pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{offer.title}</p>
                    <p className="text-slate-400 text-xs">{offer.location || 'Localisation non renseignée'}</p>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Stage</span>
                </div>
                <p className="text-slate-300 text-xs whitespace-pre-wrap break-words">{offer.description || 'Pas de description'}</p>
                <p className="text-slate-400 text-xs">Durée : {offer.duration || 'Non renseignée'}</p>
                {offer.requirements && <p className="text-slate-400 text-xs">Prérequis : {offer.requirements}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="w-full mt-2 py-4 rounded-2xl border-2 border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-colors"
        onClick={handleLogout}
      >
        Déconnexion
      </button>

      {editing && createPortal(
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 pointer-events-auto">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 font-semibold">Edition</p>
                <h3 className="text-xl font-bold text-white">Profil entreprise</h3>
              </div>
              <button className="p-2 rounded-full bg-white/10 text-slate-400 hover:text-white" onClick={() => setEditing(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Nom" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
              <TextField label="Secteur" value={formData.sector} onChange={(v) => setFormData({ ...formData, sector: v })} />
              <TextField label="Site web" value={formData.website} onChange={(v) => setFormData({ ...formData, website: v })} />
              <TextField label="Effectif" value={formData.employees} onChange={(v) => setFormData({ ...formData, employees: v })} />
              <TextField label="Année de création" value={formData.founded_year} onChange={(v) => setFormData({ ...formData, founded_year: v })} />
              <TextField label="Adresse" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
              <TextField label="Contact" value={formData.contact_name} onChange={(v) => setFormData({ ...formData, contact_name: v })} />
              <TextField label="Email" value={formData.contact_email} onChange={(v) => setFormData({ ...formData, contact_email: v })} />
              <TextArea label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} className="md:col-span-2" />
              <TextArea label="Avantages" value={formData.benefits} onChange={(v) => setFormData({ ...formData, benefits: v })} className="md:col-span-2" />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-slate-300" onClick={() => setEditing(false)}>Annuler</button>
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-lg hover:brightness-110"
                onClick={async () => {
                  try {
                    const updated = await api.updateCurrentCompany(formData);
                    setCompany(updated);
                    setEditing(false);
                  } catch (err: any) {
                    alert(err.message || 'Sauvegarde impossible');
                  }
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-modal-container') || document.body
      )}
    </div>
  );
};

const InfoTile = ({ icon, label, value, subtitle, multiline, isLink }: { icon: string; label: string; value: string; subtitle?: string; multiline?: boolean; isLink?: boolean; }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 shadow-lg">
    <div className="flex items-center gap-2 mb-1 text-slate-300 text-xs font-semibold">
      <span className="material-symbols-outlined text-sm text-emerald-300">{icon}</span>
      {label}
    </div>
    {isLink && value ? (
      <a href={value} target="_blank" rel="noreferrer" className="text-cyan-200 text-sm font-semibold hover:underline break-words">{value}</a>
    ) : (
      <p className={`text-slate-200 text-sm ${multiline ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>{value}</p>
    )}
    {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
  </div>
);

const TextField = ({ label, value, onChange }: { label: string; value: any; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</label>
    <input
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextArea = ({ label, value, onChange, className }: { label: string; value: any; onChange: (v: string) => void; className?: string }) => (
  <div className={`flex flex-col gap-1 ${className || ''}`}>
    <label className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</label>
    <textarea
      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none resize-none"
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CompanyProfileScreen;
