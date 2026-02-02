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
          className="px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold shadow-lg hover:brightness-110 transition"
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20 shadow-xl">
                  {company?.name?.[0] || 'E'}
                </div>
              )}
              <button
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 text-white text-[11px] border border-white/20 hover:bg-pink-500 transition-colors"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? '...' : 'Changer'}
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
              <p className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold">Profil</p>
              <h1 className="text-2xl font-bold text-white">{company?.name || 'Entreprise'}</h1>
              <p className="text-slate-300 text-sm">{company?.sector || 'Secteur non défini'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30 hover:bg-pink-500/30 transition-all"
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
        <h2 className="text-lg font-bold text-white mb-3">Offres actives</h2>
        {!Array.isArray(offers) || offers.length === 0 ? (
          <div className="text-slate-400 text-sm">Aucune offre pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{offer.title}</p>
                    <p className="text-slate-400 text-xs">{offer.location}</p>
                  </div>
                  {/* Badge STAGE en Violet */}
                  <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Stage</span>
                </div>
                <p className="text-slate-300 text-xs line-clamp-2">{offer.description}</p>
                {offer.requirements && <p className="text-slate-400 text-xs">Prérequis : {offer.requirements}</p>}
                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
        
                  <span>DURÉE : {offer.duration}</span>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 pointer-events-auto">
          {/* Fenêtre en plus grand (max-w-2xl) */}
          <div className="w-full max-w-2xl bg-[#0f172a] rounded-[2rem] border border-white/10 shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold">Modification</p>
                <h3 className="text-2xl font-bold text-white">Profil entreprise</h3>
              </div>
              <button className="p-2 rounded-full bg-white/10 text-slate-400 hover:text-white" onClick={() => setEditing(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/5">
              <button className="px-6 py-2 rounded-xl bg-white/5 text-slate-400 font-bold" onClick={() => setEditing(false)}>Annuler</button>
              <button
                className="px-8 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:brightness-110"
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
                Sauvegarder
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-modal-container') || document.body
      )}
    </div>
  );
};

const InfoTile = ({ icon, label, value, subtitle, multiline, isLink }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg group hover:border-pink-500/30 transition-all">
    <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
      <span className="material-symbols-outlined text-sm text-pink-400">{icon}</span>
      {label}
    </div>
    {isLink && value ? (
      <a href={value} target="_blank" rel="noreferrer" className="text-pink-300 text-sm font-semibold hover:underline break-words block">{value}</a>
    ) : (
      <p className={`text-slate-200 text-sm font-medium ${multiline ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>{value}</p>
    )}
    {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
  </div>
);

const TextField = ({ label, value, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">{label}</label>
    <input
      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-pink-500 outline-none transition-all font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextArea = ({ label, value, onChange, className }: any) => (
  <div className={`flex flex-col gap-1 ${className || ''}`}>
    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">{label}</label>
    <textarea
      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:border-pink-500 outline-none transition-all font-medium min-h-[100px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CompanyProfileScreen;