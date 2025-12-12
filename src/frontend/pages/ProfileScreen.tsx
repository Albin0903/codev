import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type ConfirmModal = { show: boolean; title: string; message: string; onConfirm: () => void } | null;

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);
  const [cvExtractedData, setCvExtractedData] = useState<any>(null);
  const [showCvImportModal, setShowCvImportModal] = useState(false);
  const cvInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await api.getCurrentUser();
        setUserData(data);
        setFormData({
          first_name: data?.user?.first_name || '',
          last_name: data?.user?.last_name || '',
          school: data?.school || '',
          school_url: data?.school_url || '',
          availability: data?.availability || '',
          duration: data?.duration || '',
          education: data?.education || '',
          experience: data?.experience || '',
          hobbies: data?.hobbies || '',
          theme: data?.theme || 'dark',
          skills: data?.skills ? data.skills.map((s: any) => s.name) : [],
          program: data?.program || '',
          year: data?.year || '',
          gender: data?.gender || '',
          preferences: data?.preferences || '',
          linkedin_url: data?.linkedin_url || '',
          github_url: data?.github_url || '',
          website_url: data?.website_url || '',
          location: data?.location || '',
          languages: data?.languages || '',
          phone: data?.phone || '',
          photo_url: data?.photo_url || null,
          photo_visible: data?.photo_visible ?? true,
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <div className="text-white text-lg font-semibold">Vous devez être connecté pour voir cette page.</div>
        <button
          className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-lg hover:brightness-110 transition"
          onClick={() => {
            api.clearAuth();
            navigate('/login');
          }}
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 pt-6 pb-32 gap-6 w-full max-w-full">
      {/* Profile Card */}
      <div className="relative bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 backdrop-blur-xl border-2 border-emerald-400/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Visible Recruteur</span>
          </div>
          <button
            className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 text-emerald-300 hover:text-emerald-200 hover:from-emerald-500/30 hover:to-cyan-500/30 transition-all"
            onClick={() => {
              setEditingProfile(true);
              setFormData((prev:any) => ({
                ...prev,
                first_name: userData?.user?.first_name || '',
                last_name: userData?.user?.last_name || '',
                school: userData?.school || '',
                school_url: userData?.school_url || '',
                program: userData?.program || '',
                year: userData?.year || '',
                gender: userData?.gender || '',
                preferences: userData?.preferences || '',
                availability: userData?.availability || '',
                duration: userData?.duration || '',
                education: userData?.education || '',
                experience: userData?.experience || '',
                hobbies: userData?.hobbies || '',
                theme: userData?.theme || 'dark',
                skills: userData?.skills ? userData.skills.map((s: any) => s.name) : [],
                linkedin_url: userData?.linkedin_url || '',
                github_url: userData?.github_url || '',
                website_url: userData?.website_url || '',
                location: userData?.location || '',
                languages: userData?.languages || '',
                phone: userData?.phone || '',
                photo_url: userData?.photo_url || null,
                photo_visible: userData?.photo_visible ?? true,
              }));
            }}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        </div>

        {/* Header with photo */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <div
              className={`relative w-32 h-32 rounded-full bg-cover bg-center border-4 border-gradient-to-br from-emerald-400 to-cyan-400 shadow-2xl transition-all duration-500 ${userData?.photo_visible !== false ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}
              style={{
                backgroundImage: userData?.photo_url
                  ? `url('${userData.photo_url}')`
                  : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIgyh970J8ZRbvf_3KpzT_qfnVepKOwF-6xTGoqON5owZfrwVR5MdRLDI7IMXCRP4zSE0FcwOSFwVg_SFBXFYWvRDDVmJ7d-r5JS8MBjoKtDtJfAkLu0GjZeVLeDH02q1rdfVzlldv7Eo0nXG2bG-_BMU4-_c1885UpCDSfmczFN8Hq8GgjpEvv5DsyYQan1wn33_rzUxdUWEoRAFVFqLCvmAE9q4_BT-KM6i4lwHMFUpMNYyKHn96_UGJv7Kg2nm7c0ABlEWegEE")',
              }}
            ></div>
            <button
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full border shadow-lg flex items-center gap-2 text-[11px] font-semibold transition-all duration-200 ${
                userData?.photo_visible !== false
                  ? 'bg-emerald-500 text-emerald-100 border-emerald-400/70 hover:bg-emerald-600'
                  : 'bg-slate-800 text-slate-200 border-white/15 hover:bg-slate-700'
              }`}
              onClick={async () => {
                const currentValue = userData?.photo_visible !== false;
                const newValue = !currentValue;
                
                // Optimistic update
                setUserData((prev:any) => ({ ...prev, photo_visible: newValue }));
                setFormData((prev:any) => ({ ...prev, photo_visible: newValue }));
                
                try {
                  const updated = await api.togglePhotoVisibility();
                  if (updated && typeof updated === 'object') {
                    setUserData(updated);
                    setFormData((prev:any) => ({ ...prev, photo_visible: updated.photo_visible ?? newValue }));
                  }
                } catch (err) {
                  console.error('Toggle photo visibility error:', err);
                  // Rollback on error
                  setUserData((prev:any) => ({ ...prev, photo_visible: currentValue }));
                  setFormData((prev:any) => ({ ...prev, photo_visible: currentValue }));
                }
              }}
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              {userData?.photo_visible !== false ? 'Visible' : 'Masqué'}
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent tracking-tight">
              {userData.user?.first_name} {userData.user?.last_name}
            </h1>
            <p className="text-slate-300 text-sm mt-2">
              {userData.gender === 'F' ? 'Étudiante' : 'Étudiant'} à{' '}
              <a
                href={userData.school_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors"
              >
                {userData.school || 'École'}
              </a>
            </p>
            <p className="text-slate-400 text-xs mt-1 px-4">{userData.program || 'Formation'}</p>
          </div>
        </div>

            {/* Social Actions Bar */}
            <div className="relative mb-8 px-2">
                <div className="flex justify-center gap-3 items-center flex-wrap">
                    <SocialButton href={userData.linkedin_url || '#'} disabled={!userData.linkedin_url} iconSvg={<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>} />
                    <SocialButton href={userData.github_url || '#'} disabled={!userData.github_url} iconSvg={<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>} />
                    <SocialButton href={userData.website_url || '#'} disabled={!userData.website_url} iconName="public" />
                    <div className="w-px bg-white/10 mx-1 h-8"></div>
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={cvInputRef}
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCV(true);
                        try {
                          const updated = await api.uploadCV(file);
                          setUserData(updated);
                          // Stocker les données extraites pour affichage
                          if (updated.extracted_from_cv) {
                            setCvExtractedData(updated.extracted_from_cv);
                          }
                        } catch (err: any) {
                          setConfirmModal({
                            show: true,
                            title: 'Erreur',
                            message: err.message || 'Erreur lors de l\'upload du CV',
                            onConfirm: () => setConfirmModal(null)
                          });
                        } finally {
                          setUploadingCV(false);
                          if (cvInputRef.current) cvInputRef.current.value = '';
                        }
                      }}
                    />
                    {/* CV Button with upload/view/delete */}
                    {userData.cv_url ? (
                      <div className="flex items-center gap-1">
                        <a 
                          href={userData.cv_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="h-10 px-4 rounded-l-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          <span className="material-symbols-outlined text-[18px]">description</span>
                          <span className="max-w-[80px] truncate">{userData.cv_name || 'CV'}</span>
                        </a>
                        <button 
                          onClick={() => cvInputRef.current?.click()}
                          disabled={uploadingCV}
                          className="h-10 px-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center hover:from-teal-600 hover:to-cyan-600 transition-colors"
                          title="Remplacer le CV"
                        >
                          <span className="material-symbols-outlined text-[16px]">{uploadingCV ? 'hourglass_empty' : 'upload'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              show: true,
                              title: 'Supprimer le CV',
                              message: 'Êtes-vous sûr de vouloir supprimer votre CV ?',
                              onConfirm: async () => {
                                try {
                                  await api.deleteCV();
                                  setUserData((prev: any) => ({...prev, cv: null, cv_url: null, cv_name: null}));
                                  setCvExtractedData(null);
                                  setConfirmModal(null);
                                } catch (err: any) {
                                  console.error('Delete CV error:', err);
                                  setConfirmModal({
                                    show: true,
                                    title: 'Erreur',
                                    message: err.message || 'Erreur lors de la suppression',
                                    onConfirm: () => setConfirmModal(null)
                                  });
                                }
                              }
                            });
                          }}
                          className="h-10 px-2 rounded-r-xl bg-gradient-to-r from-red-500/80 to-rose-500/80 text-white flex items-center justify-center hover:from-red-600 hover:to-rose-600 transition-colors"
                          title="Supprimer le CV"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => cvInputRef.current?.click()}
                        disabled={uploadingCV}
                        className="h-10 px-4 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {uploadingCV ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">hourglass_empty</span>
                            Upload...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            Ajouter CV
                          </>
                        )}
                      </button>
                    )}
                </div>
            </div>

            {cvExtractedData && Object.keys(cvExtractedData).length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-violet-400">auto_awesome</span>
                  <span className="text-violet-300 font-bold text-sm">CV analysé avec succès !</span>
                  <button 
                    onClick={() => setCvExtractedData(null)}
                    className="ml-auto text-slate-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <p className="text-slate-400 text-xs mb-3">
                  Des informations ont été extraites de votre CV. Voulez-vous les utiliser pour mettre à jour votre profil ?
                </p>
                <button
                  onClick={() => setShowCvImportModal(true)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:from-violet-600 hover:to-fuchsia-600 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">sync</span>
                  Mettre à jour le profil depuis le CV
                </button>
              </div>
            )}

            {/* CV Import Modal */}
            {showCvImportModal && cvExtractedData && createPortal(
              <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
                <div className="bg-[#1e293b] rounded-2xl mx-4 max-w-md w-full max-h-[85%] flex flex-col border border-white/10 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="p-5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-violet-400">description</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Importer depuis le CV</h3>
                        <p className="text-slate-400 text-xs">Sélectionnez les champs à mettre à jour</p>
                      </div>
                    </div>
                  </div>

                  {/* Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-3">
                      {/* Define all fields to check */}
                      {[
                        { key: 'linkedin_url', label: 'LinkedIn', icon: 'link', color: 'blue' },
                        { key: 'github_url', label: 'GitHub', icon: 'code', color: 'slate' },
                        { key: 'website_url', label: 'Site web', icon: 'public', color: 'cyan' },
                        { key: 'phone', label: 'Téléphone', icon: 'phone', color: 'amber' },
                        { key: 'location', label: 'Localisation', icon: 'location_on', color: 'pink' },
                        { key: 'languages', label: 'Langues', icon: 'translate', color: 'violet' },
                        { key: 'education', label: 'Éducation', icon: 'school', color: 'blue' },
                        { key: 'experience', label: 'Expérience', icon: 'work', color: 'amber' },
                        { key: 'skills', label: 'Compétences', icon: 'psychology', color: 'cyan' },
                      ].map((field) => {
                        const hasValue = field.key === 'skills' 
                          ? cvExtractedData.skills && cvExtractedData.skills.length > 0
                          : !!cvExtractedData[field.key];
                        const value = field.key === 'skills'
                          ? cvExtractedData.skills?.join(', ')
                          : cvExtractedData[field.key];
                        
                        return (
                          <div 
                            key={field.key} 
                            className={`p-3 rounded-xl border ${
                              hasValue 
                                ? 'bg-emerald-500/10 border-emerald-400/30' 
                                : 'bg-red-500/10 border-red-400/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`material-symbols-outlined text-sm ${hasValue ? 'text-emerald-400' : 'text-red-400'}`}>
                                {hasValue ? 'check_circle' : 'error'}
                              </span>
                              <span className={`text-xs font-bold uppercase tracking-wide ${hasValue ? 'text-emerald-300' : 'text-red-300'}`}>
                                {field.label}
                              </span>
                              {!hasValue && (
                                <span className="ml-auto text-[10px] text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
                                  Non trouvé
                                </span>
                              )}
                            </div>
                            {hasValue ? (
                              <p className="text-slate-300 text-xs truncate pl-6">{value}</p>
                            ) : (
                              <p className="text-slate-500 text-xs italic pl-6">Aucune donnée extraite du CV</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-white/5 shrink-0 space-y-3">
                    <button
                      onClick={async () => {
                        try {
                          // Build payload with extracted data
                          const payload: any = {};
                          
                          if (cvExtractedData.linkedin_url) payload.linkedin_url = cvExtractedData.linkedin_url;
                          if (cvExtractedData.github_url) payload.github_url = cvExtractedData.github_url;
                          if (cvExtractedData.website_url) payload.website_url = cvExtractedData.website_url;
                          if (cvExtractedData.phone) payload.phone = cvExtractedData.phone;
                          if (cvExtractedData.location) payload.location = cvExtractedData.location;
                          if (cvExtractedData.languages) payload.languages = cvExtractedData.languages;
                          if (cvExtractedData.education) payload.education = cvExtractedData.education;
                          if (cvExtractedData.experience) payload.experience = cvExtractedData.experience;
                          if (cvExtractedData.skills && cvExtractedData.skills.length > 0) {
                            payload.skills = cvExtractedData.skills;
                          }

                          const updated = await api.updateCurrentUser(payload);
                          setUserData(updated);
                          setShowCvImportModal(false);
                          setCvExtractedData(null);
                          
                          // Show success
                          setConfirmModal({
                            show: true,
                            title: 'Profil mis à jour !',
                            message: 'Les informations de votre CV ont été importées avec succès.',
                            onConfirm: () => setConfirmModal(null)
                          });
                        } catch (err) {
                          console.error('Erreur import CV:', err);
                          setConfirmModal({
                            show: true,
                            title: 'Erreur',
                            message: 'Impossible de mettre à jour le profil.',
                            onConfirm: () => setConfirmModal(null)
                          });
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">check</span>
                      Appliquer les modifications
                    </button>
                    <button
                      onClick={() => setShowCvImportModal(false)}
                      className="w-full py-2.5 rounded-xl bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>,
              document.getElementById('app-modal-container') || document.body
            )}
            
            {/* Confirm Modal Portal */}
            {confirmModal?.show && createPortal(
              <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
                <div className="bg-[#1e293b] rounded-2xl p-6 mx-4 max-w-sm w-full border border-white/10 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
                  <p className="text-slate-300 text-sm mb-6">{confirmModal.message}</p>
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => setConfirmModal(null)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-slate-300 font-medium hover:bg-white/20 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={confirmModal.onConfirm}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>,
              document.getElementById('app-modal-container') || document.body
            )}
            
                    {/* Profile Edit Modal */}
                    {editingProfile && createPortal(
                      <div className="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm pointer-events-auto">
                        <div className="w-[90%] max-w-md h-[80%] flex flex-col bg-[#0f172a]/95 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                        
                        {/* Header - Fixed */}
                        <div className="flex justify-between items-center p-6 pb-4 border-b border-white/5 shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Modifier le profil</h3>
                                <p className="text-slate-400 text-sm">Mettez à jour vos informations personnelles</p>
                            </div>
                            <button onClick={() => setEditingProfile(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {/* Photo management inside modal */}
                          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#1e293b]/60 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">Photo de profil</p>
                                <p className="text-xs text-slate-400">Importez ou supprimez votre photo depuis cet écran.</p>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  ref={photoInputRef}
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadingPhoto(true);
                                    try {
                                      const updated = await api.uploadPhoto(file);
                                      setUserData(updated);
                                      setFormData((prev:any) => ({...prev, photo_url: updated.photo_url, photo_visible: updated.photo_visible}));
                                      setConfirmModal({
                                        show: true,
                                        title: 'Succès',
                                        message: 'Votre photo a été mise à jour avec succès.',
                                        onConfirm: () => setConfirmModal(null)
                                      });
                                    } catch (err: any) {
                                      setConfirmModal({
                                        show: true,
                                        title: 'Erreur',
                                        message: err.message || 'Erreur lors de l\'upload de la photo',
                                        onConfirm: () => setConfirmModal(null)
                                      });
                                    } finally {
                                      setUploadingPhoto(false);
                                      if (photoInputRef.current) photoInputRef.current.value = '';
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => photoInputRef.current?.click()}
                                  disabled={uploadingPhoto}
                                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                                >
                                  {uploadingPhoto ? 'Upload...' : 'Importer'}
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      show: true,
                                      title: 'Supprimer la photo',
                                      message: 'Supprimer définitivement la photo ?',
                                      onConfirm: async () => {
                                        try {
                                          await api.deletePhoto();
                                          setUserData((prev:any) => ({...prev, photo_url: null, photo: null, photo_visible: false}));
                                          setFormData((prev:any) => ({...prev, photo_url: null, photo_visible: false}));
                                          setConfirmModal(null);
                                        } catch (err: any) {
                                          setConfirmModal({
                                            show: true,
                                            title: 'Erreur',
                                            message: err.message || 'Erreur lors de la suppression',
                                            onConfirm: () => setConfirmModal(null)
                                          });
                                        }
                                      }
                                    });
                                  }}
                                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 hover:from-red-600 hover:to-rose-600"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Prénom</label>
                            <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                          </div>
                            <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Nom</label>
                            <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                            </div>
                            <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">École</label>
                            <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})} />
                            </div>
                            <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Site de l'école (URL)</label>
                            <input type="url" className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.school_url} onChange={(e) => setFormData({...formData, school_url: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Formation</label>
                              <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Disponibilité</label>
                              <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Durée souhaitée</label>
                              <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Année</label>
                              <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Genre</label>
                              <select className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                <option value="M">Homme</option>
                                <option value="F">Femme</option>
                                <option value="O">Autre</option>
                              </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">À propos</label>
                              <textarea className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" rows={3} value={formData.preferences} onChange={(e) => setFormData({...formData, preferences: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Compétences (séparées par des virgules)</label>
                              <input className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={(formData.skills||[]).join(', ')} onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Éducation</label>
                              <textarea className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" rows={2} value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Expérience</label>
                              <textarea className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" rows={2} value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Loisirs</label>
                              <textarea className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" rows={2} value={formData.hobbies} onChange={(e) => setFormData({...formData, hobbies: e.target.value})} />
                            </div>
                            
                            {/* Section Liens sociaux */}
                            <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/5">
                              <h4 className="text-sm font-bold text-violet-300 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">link</span>
                                Liens & Réseaux sociaux
                              </h4>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">Profil LinkedIn</label>
                              <input type="url" placeholder="https://linkedin.com/in/..." className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all" value={formData.linkedin_url} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Profil GitHub</label>
                              <input type="url" placeholder="https://github.com/..." className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-slate-300 focus:ring-1 focus:ring-slate-300 outline-none transition-all" value={formData.github_url} onChange={(e) => setFormData({...formData, github_url: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5">Site personnel / Portfolio</label>
                              <input type="url" placeholder="https://..." className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all" value={formData.website_url} onChange={(e) => setFormData({...formData, website_url: e.target.value})} />
                            </div>
                            
                            {/* Section Infos complémentaires */}
                            <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/5">
                              <h4 className="text-sm font-bold text-emerald-300 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">info</span>
                                Informations complémentaires
                              </h4>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">Localisation</label>
                              <input placeholder="Lyon, France" className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none transition-all" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-1.5">Langues</label>
                              <input placeholder="Français, Anglais" className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-violet-400 focus:ring-1 focus:ring-violet-400 outline-none transition-all" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">Téléphone</label>
                              <input type="tel" placeholder="+33 6 12 34 56 78" className="w-full p-3 rounded-xl bg-[#1e293b]/50 border border-white/10 text-white placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            </div>
                          </div>
                        </div>
                          
                          {/* Footer Actions - Fixed */}
                          <div className="p-6 pt-4 bg-[#0f172a]/95 border-t border-white/5 flex justify-end gap-3 shrink-0">
                            <button className="px-6 py-3 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-colors" onClick={() => setEditingProfile(false)}>Annuler</button>
                            <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all transform hover:scale-105 active:scale-95" onClick={async () => {
                              try {
                                // Build payload: include user fields at top-level so backend will update user and student
                                const payload: any = {
                                  school: formData.school,
                                  school_url: formData.school_url || '',
                                  program: formData.program,
                                  year: formData.year,
                                  gender: formData.gender,
                                  preferences: formData.preferences,
                                  availability: formData.availability,
                                  duration: formData.duration,
                                  education: formData.education,
                                  experience: formData.experience,
                                  hobbies: formData.hobbies,
                                  theme: formData.theme,
                                  linkedin_url: formData.linkedin_url || '',
                                  github_url: formData.github_url || '',
                                  website_url: formData.website_url || '',
                                  location: formData.location || '',
                                  languages: formData.languages || '',
                                  phone: formData.phone || '',
                                };
                                // include user fields to update separately
                                    if (formData.first_name !== undefined) payload['first_name'] = formData.first_name;
                                    if (formData.last_name !== undefined) payload['last_name'] = formData.last_name;
                                    // send skills array if present
                                    if (formData.skills && Array.isArray(formData.skills)) payload['skills'] = formData.skills;

                                    const updated = await api.updateCurrentUser(payload);
                                setUserData(updated);
                                setEditingProfile(false);
                              } catch (err) {
                                console.error('Erreur update:', err);
                                alert('Impossible de sauvegarder les modifications.');
                              }
                            }}>Enregistrer</button>
                          </div>
                        </div>
                      </div>,
                      document.getElementById('app-modal-container') || document.body
                    )}

        {/* About Me */}
        <div className="mb-6">
          <h3 className="text-transparent bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-xs font-bold uppercase tracking-wider mb-3">
            À propos
          </h3>
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20 rounded-2xl p-4">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {userData.preferences || 'Pas de description'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: 'calendar_today', label: 'Disponibilité', value: userData.availability || 'Non renseigné', gradient: 'from-emerald-500/20 to-cyan-500/20', border: 'border-emerald-400/30', iconColor: 'text-emerald-400' },
            { icon: 'hourglass_top', label: 'Durée', value: userData.duration || 'Non renseigné', gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-400/30', iconColor: 'text-orange-400' },
            { icon: 'location_on', label: 'Localisation', value: userData.location || 'Non renseigné', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-400/30', iconColor: 'text-pink-400' },
            { icon: 'translate', label: 'Langues', value: userData.languages || 'Non renseigné', gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-400/30', iconColor: 'text-violet-400' },
          ].map((item, i) => (
            <div key={i} className={`bg-gradient-to-br ${item.gradient} rounded-xl p-3 border ${item.border} flex flex-col gap-1`}>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <span className={`material-symbols-outlined text-sm ${item.iconColor}`}>{item.icon}</span>
                {item.label}
              </div>
              <span className="text-slate-100 text-sm font-semibold break-words">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-xs font-bold uppercase tracking-wider mb-3">
            Compétences
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.skills && userData.skills.length > 0 ? (
              userData.skills.map((skill: any) => (
                <span key={skill.id} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                  {skill.name}
                </span>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Aucune compétence ajoutée</p>
            )}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/20 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-amber-400">work</span>
              </div>
              <h3 className="text-amber-300 font-bold text-sm">Expérience</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap break-words">{userData.experience || "Aucune expérience renseignée"}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/20 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-blue-400">school</span>
              </div>
              <h3 className="text-blue-300 font-bold text-sm">Éducation</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap break-words">{userData.education || "Aucune formation renseignée"}</p>
          </div>
        </div>

        {/* Hobbies */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-400/20 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-400/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg text-rose-400">interests</span>
              </div>
              <h3 className="text-rose-300 font-bold text-sm">Loisirs</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap break-words">{userData.hobbies || "Président du BDE, participation à 3 Hackathons (1er prix 2023), Photographie urbaine, Escalade de bloc."}</p>
          </div>
        </div>
      </div>

      {/* Application Settings Section */}
      <div className="mt-2">
          <h3 className="text-lg font-bold text-white mb-4 px-2">Paramètres de l'application</h3>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-violet-400">palette</span>
                      <span className="text-slate-200 font-semibold">Thème</span>
                  </div>
                  <div className="flex gap-2">
                      <button 
                          onClick={async () => {
                            const newTheme = 'light';
                            setFormData({...formData, theme: newTheme});
                            try {
                              const updated = await api.updateCurrentUser({ theme: newTheme });
                              setUserData(updated);
                              localStorage.setItem('app_theme', newTheme);
                              document.documentElement.classList.remove('dark');
                              document.documentElement.classList.add('light');
                            } catch (err) {
                              console.error('Theme update error:', err);
                            }
                          }} 
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              formData.theme === 'light' 
                                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400/50 text-amber-200' 
                                  : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-slate-300'
                          }`}
                      >
                          ☀️ Clair
                      </button>
                      <button 
                          onClick={async () => {
                            const newTheme = 'dark';
                            setFormData({...formData, theme: newTheme});
                            try {
                              const updated = await api.updateCurrentUser({ theme: newTheme });
                              setUserData(updated);
                              localStorage.setItem('app_theme', newTheme);
                              document.documentElement.classList.remove('light');
                              document.documentElement.classList.add('dark');
                            } catch (err) {
                              console.error('Theme update error:', err);
                            }
                          }} 
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              formData.theme === 'dark' 
                                  ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/50 text-indigo-200' 
                                  : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-slate-300'
                          }`}
                      >
                          🌙 Sombre
                      </button>
                  </div>
              </div>
              <div className="h-px bg-white/5 mb-4"></div>
              <SettingsItem icon="notifications" label="Notifications" />
              <div className="h-px bg-white/5 my-3"></div>
              <SettingsItem icon="lock" label="Confidentialité" />
              <div className="h-px bg-white/5 my-3"></div>
              <SettingsItem icon="description" label="Conditions d'utilisation" />
          </div>
          
          <button
            className="w-full mt-6 py-4 rounded-2xl border-2 border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-colors"
            onClick={async () => {
              await api.logout();
              navigate('/login');
            }}
          >
              Déconnexion
          </button>
      </div>

    </div>
  );
};

const SocialButton = ({ href, iconSvg, iconName, disabled }: { href: string, iconSvg?: React.ReactNode, iconName?: string, disabled?: boolean }) => (
    <a 
        href={disabled ? undefined : href}
        target={disabled ? undefined : "_blank"}
        rel="noreferrer"
        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/10 shadow-lg ${
          disabled 
            ? 'bg-[#101722]/40 text-slate-600 cursor-not-allowed opacity-50' 
            : 'bg-[#101722]/80 text-slate-400 hover:bg-white hover:text-[#101722] cursor-pointer'
        }`}
        onClick={(e) => disabled && e.preventDefault()}
    >
        {iconSvg ? (
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{iconSvg}</svg>
        ) : (
            <span className="material-symbols-outlined text-[20px]">{iconName}</span>
        )}
    </a>
);

const SettingsItem = ({ icon, label }: { icon: string, label: string }) => (
    <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">{icon}</span>
            <span className="text-slate-200 font-medium text-sm">{label}</span>
        </div>
        <span className="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
    </div>
);

export default ProfileScreen;
