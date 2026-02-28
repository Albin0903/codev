import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';

interface OfferFormData {
  title: string;
  description: string;
  location: string;
  duration: string;
  requirements: string;
}

const emptyOfferForm: OfferFormData = {
  title: '',
  description: '',
  location: '',
  duration: '',
  requirements: '',
};

const CompanyProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // État de la gestion des offres
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [offerForm, setOfferForm] = useState<OfferFormData>(emptyOfferForm);
  const [savingOffer, setSavingOffer] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<number | null>(null);
  const [deleteConfirmOffer, setDeleteConfirmOffer] = useState<any>(null);

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

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const updated = await api.uploadCompanyLogo(file);
      setCompany(updated);
    } catch (err: any) {
      alert(err.message || 'Impossible de téléverser le logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await api.updateCurrentCompany(formData);
      setCompany(updated);
      setEditing(false);
    } catch (err: any) {
      alert(err.message || 'Sauvegarde impossible');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Gestionnaires du CRUD des offres
  const openAddOfferModal = () => {
    setEditingOffer(null);
    setOfferForm(emptyOfferForm);
    setOfferModalOpen(true);
  };

  const openEditOfferModal = (offer: any) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      location: offer.location || '',
      duration: offer.duration || '',
      requirements: offer.requirements || '',
    });
    setOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setEditingOffer(null);
    setOfferForm(emptyOfferForm);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }
    setSavingOffer(true);
    try {
      if (editingOffer) {
        // Mise à jour d'une offre existante
        const updated = await api.updateCompanyOffer(editingOffer.id, offerForm);
        setOffers(offers.map(o => o.id === updated.id ? updated : o));
      } else {
        // Création d'une nouvelle offre
        const created = await api.createCompanyOffer(offerForm);
        setOffers([created, ...offers]);
      }
      closeOfferModal();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingOffer(false);
    }
  };

  const openDeleteConfirm = (offer: any) => {
    setDeleteConfirmOffer(offer);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOffer(null);
  };

  const confirmDeleteOffer = async () => {
    if (!deleteConfirmOffer) return;
    const offerId = deleteConfirmOffer.id;
    setDeletingOfferId(offerId);
    try {
      await api.deleteCompanyOffer(offerId);
      setOffers(offers.filter(o => o.id !== offerId));
      closeDeleteConfirm();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingOfferId(null);
    }
  };

  // Verrouiller le défilement du corps de la page lors de l'ouverture d'une modale
  useEffect(() => {
    if (editing || offerModalOpen || deleteConfirmOffer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editing, offerModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0f172a]">
        <p className="text-red-400 font-semibold mb-4">{error}</p>
        <button
          onClick={() => { api.clearAuth(); navigate('/login'); }}
          className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const shortDescription = company?.description?.length > 100 
    ? company.description.substring(0, 100) + '...' 
    : company?.description;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f172a] overflow-y-auto overflow-x-hidden pb-32 md:pt-24">
      <div className="md:hidden">
        <AppHeader />
      </div>

      {/* Carte du profil */}
      <div className="px-4">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden relative">
          
          {/* Bouton Modifier - À l'intérieur de la carte */}
          <button
            onClick={() => setEditing(true)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          
          {/* Logo & Nom de l'entreprise */}
          <div className="p-6 flex items-center gap-4 border-b border-white/5">
            <div className="relative">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500/50 bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">
                  {company?.name?.[0] || 'E'}
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl md:text-2xl font-bold">{company?.name || 'Entreprise'}</h2>
              <p className="text-pink-400 text-sm md:text-base font-medium">{company?.sector || 'Secteur'}</p>
              <p className="text-slate-400 text-xs md:text-sm mt-1">{company?.address}</p>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-3 border-b border-white/5">
            <div className="p-4 text-center border-r border-white/5">
              <p className="text-white text-xl md:text-2xl font-bold">{company?.employees || '-'}</p>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">Employés</p>
            </div>
            <div className="p-4 text-center border-r border-white/5">
              <p className="text-white text-xl md:text-2xl font-bold">{offers.length}</p>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">Offres</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-white text-xl md:text-2xl font-bold">{company?.founded_year || '-'}</p>
              <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">Fondée</p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Description</h3>
              {company?.description?.length > 100 && (
                <button onClick={() => toggleSection('desc')} className="text-pink-400 text-xs md:text-sm">
                  {expandedSection === 'desc' ? 'Moins' : 'Plus'}
                </button>
              )}
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {expandedSection === 'desc' ? company?.description : shortDescription || 'Non renseignée'}
            </p>
          </div>

          {/* Infos de contact */}
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Contact</h3>
            <div className="space-y-2">
              {company?.contact_name && (
                <div className="flex items-center gap-2 text-slate-300 text-sm md:text-base">
                  <span className="material-symbols-outlined text-pink-400 text-sm md:text-base">person</span>
                  {company.contact_name}
                </div>
              )}
              {company?.contact_email && (
                <div className="flex items-center gap-2 text-slate-300 text-sm md:text-base">
                  <span className="material-symbols-outlined text-pink-400 text-sm md:text-base">mail</span>
                  {company.contact_email}
                </div>
              )}
              {company?.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-blue-400 text-sm md:text-base hover:underline"
                >
                  <span className="material-symbols-outlined text-sm md:text-base">public</span>
                  {company.website}
                </a>
              )}
            </div>
          </div>

          {/* Avantages */}
          {company?.benefits && (
            <div className="p-4 border-b border-white/5">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Avantages</h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">{company.benefits}</p>
            </div>
          )}
        </div>

        {/* Offres actives */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold md:text-lg">Offres actives ({offers.length})</h2>
            <button
              onClick={openAddOfferModal}
              className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs md:text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-sm md:text-base">add</span>
              Ajouter
            </button>
          </div>
          {offers.length === 0 ? (
            <div className="bg-slate-800/40 rounded-2xl p-6 text-center">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-600 mb-2">work_off</span>
              <p className="text-slate-400 text-sm md:text-base">Aucune offre pour le moment</p>
              <button
                onClick={openAddOfferModal}
                className="mt-4 px-4 py-2 rounded-xl bg-pink-500/20 text-pink-400 text-sm font-semibold hover:bg-pink-500/30 transition-colors"
              >
                Créer votre première offre
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold md:text-lg truncate">{offer.title}</h3>
                      <p className="text-slate-400 text-xs md:text-sm">{offer.location}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <button
                        onClick={() => openEditOfferModal(offer)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Modifier"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(offer)}
                        disabled={deletingOfferId === offer.id}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingOfferId === offer.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-sm">delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm md:text-base line-clamp-2">{offer.description}</p>
                  <p className="text-pink-400 text-xs md:text-sm font-medium mt-2">Durée: {offer.duration}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale d'édition */}
      {editing && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-[85vh] bg-slate-900 rounded-t-3xl border-t border-white/10 flex flex-col overflow-hidden">
            {/* En-tête */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-white font-bold text-lg md:text-xl">Modifier le profil</h3>
              <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Formulaire */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Nom de l'entreprise</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Secteur</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Effectif</label>
                  <input 
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Année création</label>
                  <input 
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Adresse</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Site web</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Contact</label>
                  <input 
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Email</label>
                  <input 
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Description</label>
                <textarea 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Avantages</label>
                <textarea 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                />
              </div>
            </div>

            {/* Pied de page */}
            <div className="p-4 border-t border-white/10 shrink-0">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modale d'offre (Ajout/Édition) */}
      {offerModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-[85vh] bg-slate-900 rounded-t-3xl border-t border-white/10 flex flex-col overflow-hidden">
            {/* En-tête */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-white font-bold text-lg md:text-xl">
                {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h3>
              <button onClick={closeOfferModal} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Formulaire */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Titre de l'offre *</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  placeholder="Ex: Stage développeur full-stack"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Localisation</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  placeholder="Ex: Lyon, France"
                  value={offerForm.location}
                  onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Durée</label>
                <input 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  placeholder="Ex: 6 mois"
                  value={offerForm.duration}
                  onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Description</label>
                <textarea 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none placeholder-slate-500"
                  rows={4}
                  placeholder="Décrivez le stage, les missions..."
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Prérequis</label>
                <textarea 
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none placeholder-slate-500"
                  rows={3}
                  placeholder="Compétences requises, niveau d'études..."
                  value={offerForm.requirements}
                  onChange={(e) => setOfferForm({ ...offerForm, requirements: e.target.value })}
                />
              </div>
            </div>

            {/* Pied de page */}
            <div className="p-4 border-t border-white/10 shrink-0 flex gap-3">
              <button
                onClick={closeOfferModal}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveOffer}
                disabled={savingOffer}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingOffer ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  editingOffer ? 'Mettre à jour' : 'Créer l\'offre'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modale de confirmation de suppression */}
      {deleteConfirmOffer && createPortal(
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Icône */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-3xl">delete_forever</span>
              </div>
            </div>
            
            {/* Contenu */}
            <div className="px-6 pb-4 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Supprimer cette offre ?</h3>
              <p className="text-slate-400 text-sm mb-1">
                <span className="text-white font-medium">{deleteConfirmOffer.title}</span>
              </p>
              <p className="text-slate-500 text-xs">
                Cette action est irréversible.
              </p>
            </div>
            
            {/* Boutons */}
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={deletingOfferId !== null}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteOffer}
                disabled={deletingOfferId !== null}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {deletingOfferId !== null ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CompanyProfileScreen;
