import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import { useBottomNav } from '../contexts/BottomNavContext';

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { hideNav, showNav } = useBottomNav();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await api.getCurrentUser();
        setUserData(data);

        // Extract first_name and last_name from username if not set
        let firstName = data?.user?.first_name || '';
        let lastName = data?.user?.last_name || '';
        if ((!firstName || !lastName) && data?.user?.username) {
          const parts = data.user.username.split('.');
          if (parts.length >= 2) {
            firstName = firstName || parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            lastName = lastName || parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
          }
        }

        setFormData({
          first_name: firstName,
          last_name: lastName,
          school: data?.school || '',
          school_url: data?.school_url || '',
          availability: data?.availability || '',
          duration: data?.duration || '',
          education: data?.education || [],
          experience: data?.experience || [],
          hobbies: data?.hobbies || [],
          theme: data?.theme || 'dark',
          skills: data?.skills ? data.skills.map((s: any) => s.name) : [],
          program: data?.program || '',
          year: data?.year || '',
          role: data?.role || 'etudiant',
          about: data?.about || '',
          linkedin_url: data?.linkedin_url || '',
          github_url: data?.github_url || '',
          website_url: data?.website_url || '',
          location: data?.location || '',
          languages: data?.languages || [],
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

  // Handle modal visibility and bottom nav + lock body scroll
  useEffect(() => {
    if (editingProfile || showCvImportModal || confirmModal?.show) {
      hideNav();
      document.body.style.overflow = 'hidden';
    } else {
      showNav();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingProfile, showCvImportModal, confirmModal, hideNav, showNav]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCVUpload = async (file: File) => {
    setUploadingCV(true);
    try {
      const updated = await api.uploadCV(file);
      setUserData(updated);
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
  };

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const updated = await api.uploadPhoto(file);
      setUserData(updated);
      setFormData((prev: any) => ({ ...prev, photo_url: updated.photo_url, photo_visible: updated.photo_visible }));
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0f172a]">
        <p className="text-slate-300 font-semibold mb-4">Vous devez être connecté pour voir cette page.</p>
        <button
          onClick={() => { api.clearAuth(); navigate('/login'); }}
          className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const shortAbout = userData?.about?.length > 100
    ? userData.about.substring(0, 100) + '...'
    : userData?.about;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0f172a] overflow-y-auto overflow-x-hidden pb-32 md:pt-24">
      <div className="md:hidden">
        <AppHeader />
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cvInputRef}
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCVUpload(file);
        }}
      />
      <input
        type="file"
        ref={photoInputRef}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoUpload(file);
        }}
      />

      {/* Profile Card */}
      <div className="px-4">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden relative">

          {/* Action Button - Inside Card */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => {
                setEditingProfile(true);
                setFormData((prev: any) => ({
                  ...prev,
                  first_name: userData?.user?.first_name || '',
                  last_name: userData?.user?.last_name || '',
                  school: userData?.school || '',
                  school_url: userData?.school_url || '',
                  program: userData?.program || '',
                  year: userData?.year || '',
                  role: userData?.role || 'etudiant',
                  about: userData?.about || '',
                  availability: userData?.availability || '',
                  duration: userData?.duration || '',
                  education: userData?.education || [],
                  experience: userData?.experience || [],
                  hobbies: userData?.hobbies || [],
                  skills: userData?.skills ? userData.skills.map((s: any) => s.name) : [],
                  linkedin_url: userData?.linkedin_url || '',
                  github_url: userData?.github_url || '',
                  website_url: userData?.website_url || '',
                  location: userData?.location || '',
                  languages: userData?.languages || [],
                  phone: userData?.phone || '',
                  photo_url: userData?.photo_url || null,
                  photo_visible: userData?.photo_visible ?? true,
                }));
              }}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>

          {/* Photo & Name */}
          <div className="p-6 flex items-center gap-4 border-b border-white/5">
            <div className="relative">
              {userData?.photo_url && userData?.photo_visible !== false ? (
                <img
                  src={userData.photo_url}
                  alt="Photo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500/50"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl font-bold">
                  {userData?.user?.first_name?.[0]}{userData?.user?.last_name?.[0]}
                </div>
              )}
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-xl md:text-2xl font-bold truncate">{userData?.user?.first_name} {userData?.user?.last_name}</h2>
              <p className="text-pink-400 text-sm md:text-base font-medium">{userData?.program || 'Étudiant'}</p>
              <p className="text-slate-400 text-xs md:text-sm mt-1">{userData?.school} • {userData?.year}</p>
            </div>
          </div>

          {/* Photo Visibility Toggle */}
          {userData?.photo_url && (
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-slate-400 text-xs md:text-sm">Visibilité photo</span>
              <button
                onClick={async () => {
                  const newValue = !(userData?.photo_visible !== false);
                  setUserData((prev: any) => ({ ...prev, photo_visible: newValue }));
                  try {
                    await api.togglePhotoVisibility();
                  } catch (err) {
                    setUserData((prev: any) => ({ ...prev, photo_visible: !newValue }));
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${userData?.photo_visible !== false
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {userData?.photo_visible !== false ? 'visibility' : 'visibility_off'}
                </span>
                {userData?.photo_visible !== false ? 'Visible' : 'Masquée'}
              </button>
            </div>
          )}

          {/* Admin Access */}
          {userData?.user?.is_staff && (
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-red-500/10">
              <span className="text-red-400 text-xs md:text-sm font-bold">Administration</span>
              <button
                onClick={() => navigate('/admin')}
                className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Accéder
              </button>
            </div>
          )}

          {/* Social Links - Highlighted */}
          {(userData?.linkedin_url || userData?.github_url || userData?.website_url) && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex flex-wrap gap-2">
                {userData?.linkedin_url && (
                  <a
                    href={userData.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl text-pink-400 text-xs md:text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                )}
                {userData?.github_url && (
                  <a
                    href={userData.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs md:text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                    GitHub
                  </a>
                )}
                {userData?.website_url && (
                  <a
                    href={userData.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs md:text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm md:text-base">language</span>
                    Site web
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Info Badges */}
          <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-white/5">
            {userData?.location && (
              <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                <span className="material-symbols-outlined text-sm md:text-base text-pink-400">location_on</span>
                {userData.location}
              </div>
            )}
            {userData?.availability && (
              <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                <span className="material-symbols-outlined text-sm md:text-base text-pink-400">calendar_today</span>
                {userData.availability}
              </div>
            )}
            {userData?.duration && (
              <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
                <span className="material-symbols-outlined text-sm md:text-base text-pink-400">schedule</span>
                {userData.duration}
              </div>
            )}
            {userData?.role && (
              <div className="flex items-center gap-1.5 text-slate-300 text-xs md:text-sm bg-pink-500/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-pink-500/20">
                <span className="material-symbols-outlined text-sm md:text-base text-pink-400">work</span>
                {userData.role}
              </div>
            )}
          </div>

          {/* About */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">À propos</h3>
              {userData?.about?.length > 100 && (
                <button onClick={() => toggleSection('about')} className="text-pink-400 text-xs md:text-sm">
                  {expandedSection === 'about' ? 'Moins' : 'Plus'}
                </button>
              )}
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {expandedSection === 'about' ? userData?.about : shortAbout || 'Non renseigné'}
            </p>
          </div>

          {/* Skills */}
          {userData?.skills?.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Compétences</h3>
                {userData.skills.length > 6 && (
                  <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-pink-400 text-xs md:text-sm">
                    {showAllSkills ? 'Moins' : `+${userData.skills.length - 6}`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllSkills ? userData.skills : userData.skills.slice(0, 6)).map((skill: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience - Accordion */}
          <div className="border-b border-white/5">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-400 md:text-2xl">work</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Expérience</h3>
                  <p className="text-slate-500 text-xs md:text-sm">{userData?.experience?.length || 0} expérience(s)</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSection === 'experience' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {expandedSection === 'experience' && userData?.experience?.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {userData.experience.map((exp: any, i: number) => (
                  <div key={i} className="bg-amber-500/10 rounded-xl p-3 md:p-4 border border-amber-500/20">
                    <p className="text-white font-semibold text-sm md:text-base">{exp.position}</p>
                    <p className="text-amber-400 text-xs md:text-sm">{exp.company}</p>
                    <p className="text-slate-500 text-xs md:text-sm">{exp.duration}</p>
                    {exp.description && <p className="text-slate-400 text-xs md:text-sm mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education - Accordion */}
          <div className="border-b border-white/5">
            <button
              onClick={() => toggleSection('education')}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-pink-400 md:text-2xl">school</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Formation</h3>
                  <p className="text-slate-500 text-xs md:text-sm">{userData?.education?.length || 0} formation(s)</p>
                </div>
              </div>
              <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSection === 'education' ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {expandedSection === 'education' && userData?.education?.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {userData.education.map((edu: any, i: number) => (
                  <div key={i} className="bg-pink-500/10 rounded-xl p-3 md:p-4 border border-pink-500/20">
                    <p className="text-white font-semibold text-sm md:text-base">{edu.degree}</p>
                    <p className="text-pink-400 text-xs md:text-sm">{edu.school}</p>
                    <p className="text-slate-500 text-xs md:text-sm">{edu.year}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Languages */}
          {userData?.languages?.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Langues</h3>
              <div className="flex flex-wrap gap-2">
                {userData.languages.map((lang: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {typeof lang === 'string' ? lang : `${lang.language} (${lang.level})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {userData?.hobbies?.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Loisirs</h3>
              <div className="flex flex-wrap gap-2">
                {userData.hobbies.map((hobby: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CV Section */}
      <div className="px-4 mt-4">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Curriculum Vitae</h3>

          {userData?.cv_url ? (
            <div className="flex items-center gap-2">
              <a
                href={userData.cv_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center gap-3 px-4 py-3 md:px-5 md:py-4 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl text-pink-400 transition-colors"
              >
                <span className="material-symbols-outlined md:text-2xl">description</span>
                <span className="text-sm md:text-base font-medium truncate">{userData.cv_name || 'Mon CV'}</span>
              </a>
              <button
                onClick={() => cvInputRef.current?.click()}
                disabled={uploadingCV}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 transition-colors"
                title="Remplacer"
              >
                <span className="material-symbols-outlined">{uploadingCV ? 'hourglass_empty' : 'upload'}</span>
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
                        setUserData((prev: any) => ({ ...prev, cv: null, cv_url: null, cv_name: null }));
                        setCvExtractedData(null);
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
                className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-colors"
                title="Supprimer"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => cvInputRef.current?.click()}
              disabled={uploadingCV}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
            >
              {uploadingCV ? (
                <>
                  <span className="material-symbols-outlined animate-spin">hourglass_empty</span>
                  Upload en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">upload_file</span>
                  Importer mon CV
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* CV Extracted Data Banner */}
      {cvExtractedData && Object.keys(cvExtractedData).length > 0 && (
        <div className="px-4 mt-4">
          <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-pink-400">auto_awesome</span>
              <span className="text-pink-300 font-bold text-sm">CV analysé avec succès !</span>
              <button
                onClick={() => setCvExtractedData(null)}
                className="ml-auto text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="text-slate-400 text-xs mb-3">
              Des informations ont été extraites. Voulez-vous mettre à jour votre profil ?
            </p>
            <button
              onClick={() => setShowCvImportModal(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm hover:from-pink-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">sync</span>
              Mettre à jour depuis le CV
            </button>
          </div>
        </div>
      )}

      {/* CV Import Modal */}
      {showCvImportModal && cvExtractedData && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] rounded-2xl mx-4 max-w-md w-full max-h-[85%] flex flex-col border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-pink-400">description</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Importer depuis le CV</h3>
                  <p className="text-slate-400 text-xs">Données extraites automatiquement</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {[
                { key: 'program', label: 'Formation' },
                { key: 'year', label: 'Année' },
                { key: 'role', label: 'Statut' },
                { key: 'about', label: 'À propos' },
                { key: 'location', label: 'Localisation' },
                { key: 'phone', label: 'Téléphone' },
                { key: 'linkedin_url', label: 'LinkedIn' },
                { key: 'github_url', label: 'GitHub' },
                { key: 'availability', label: 'Disponibilité' },
                { key: 'duration', label: 'Durée' },
                { key: 'skills', label: 'Compétences' },
                { key: 'languages', label: 'Langues' },
                { key: 'experience', label: 'Expérience' },
                { key: 'education', label: 'Formation' },
                { key: 'hobbies', label: 'Loisirs' },
              ].map((field) => {
                const value = cvExtractedData[field.key];
                const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
                let display = value;
                if (Array.isArray(value)) {
                  if (field.key === 'experience' || field.key === 'education') {
                    display = `${value.length} élément(s)`;
                  } else if (field.key === 'languages') {
                    display = value.map((l: any) => l.language).join(', ');
                  } else {
                    display = value.join(', ');
                  }
                }

                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border ${hasValue
                        ? 'bg-pink-500/10 border-pink-500/30'
                        : 'bg-slate-700/30 border-slate-600/30'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-sm ${hasValue ? 'text-pink-400' : 'text-slate-500'}`}>
                        {hasValue ? 'check_circle' : 'remove_circle'}
                      </span>
                      <span className={`text-xs font-bold uppercase ${hasValue ? 'text-pink-300' : 'text-slate-500'}`}>
                        {field.label}
                      </span>
                    </div>
                    <p className={`text-xs pl-6 truncate ${hasValue ? 'text-slate-300' : 'text-slate-600'}`}>
                      {hasValue ? display : 'Non trouvé'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-white/5 shrink-0 space-y-3">
              <button
                onClick={async () => {
                  try {
                    const payload: any = {};
                    const fields = ['linkedin_url', 'github_url', 'website_url', 'phone', 'location', 'about', 'availability', 'duration', 'program', 'year', 'role', 'languages', 'education', 'experience', 'hobbies', 'skills'];
                    fields.forEach(f => {
                      if (cvExtractedData[f]) payload[f] = cvExtractedData[f];
                    });
                    const updated = await api.updateCurrentUser(payload);
                    setUserData(updated);
                    setShowCvImportModal(false);
                    setCvExtractedData(null);
                  } catch (err) {
                    console.error('Erreur import CV:', err);
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm"
              >
                Appliquer les modifications
              </button>
              <button
                onClick={() => setShowCvImportModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Modal */}
      {confirmModal?.show && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e293b] rounded-2xl p-6 mx-4 max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
            <p className="text-slate-300 text-sm mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-slate-300 font-medium hover:bg-white/20"
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Profile Modal */}
      {editingProfile && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-[85vh] flex flex-col bg-slate-900 rounded-t-3xl border-t border-white/10 shadow-2xl overflow-hidden">

            <div className="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
              <h3 className="text-lg font-bold text-white">Modifier le profil</h3>
              <button onClick={() => setEditingProfile(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">Prénom</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">Nom</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">Formation</label>
                <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">École</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Année</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Disponibilité</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" placeholder="Ex: Mars 2026" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Durée</label>
                  <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" placeholder="Ex: 6 mois" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Localisation</label>
                <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" placeholder="Ex: Lyon, France" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">À propos</label>
                <textarea className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none resize-none" rows={3} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">Compétences (séparées par des virgules)</label>
                <input className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={(formData.skills || []).join(', ')} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
              </div>

              {/* Experience */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">work</span>
                  Expérience
                </h4>
                <div className="space-y-2">
                  {(formData.experience || []).map((exp: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="flex gap-2">
                        <input placeholder="Poste" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={exp.position || ''} onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx] = { ...newExp[idx], position: e.target.value };
                          setFormData({ ...formData, experience: newExp });
                        }} />
                        <button onClick={() => setFormData({ ...formData, experience: formData.experience.filter((_: any, i: number) => i !== idx) })} className="p-2 rounded-lg bg-red-500/20 text-red-400">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input placeholder="Entreprise" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={exp.company || ''} onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx] = { ...newExp[idx], company: e.target.value };
                          setFormData({ ...formData, experience: newExp });
                        }} />
                        <input placeholder="Durée" className="w-24 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={exp.duration || ''} onChange={(e) => {
                          const newExp = [...formData.experience];
                          newExp[idx] = { ...newExp[idx], duration: e.target.value };
                          setFormData({ ...formData, experience: newExp });
                        }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setFormData({ ...formData, experience: [...(formData.experience || []), { position: '', company: '', duration: '' }] })} className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Education */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">school</span>
                  Formation
                </h4>
                <div className="space-y-2">
                  {(formData.education || []).map((edu: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-2">
                      <div className="flex gap-2">
                        <input placeholder="Diplôme" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={edu.degree || ''} onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx] = { ...newEdu[idx], degree: e.target.value };
                          setFormData({ ...formData, education: newEdu });
                        }} />
                        <button onClick={() => setFormData({ ...formData, education: formData.education.filter((_: any, i: number) => i !== idx) })} className="p-2 rounded-lg bg-red-500/20 text-red-400">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input placeholder="École" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={edu.school || ''} onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx] = { ...newEdu[idx], school: e.target.value };
                          setFormData({ ...formData, education: newEdu });
                        }} />
                        <input placeholder="Année" className="w-20 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={edu.year || ''} onChange={(e) => {
                          const newEdu = [...formData.education];
                          newEdu[idx] = { ...newEdu[idx], year: e.target.value };
                          setFormData({ ...formData, education: newEdu });
                        }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setFormData({ ...formData, education: [...(formData.education || []), { degree: '', school: '', year: '' }] })} className="w-full py-2 rounded-lg bg-pink-500/20 text-pink-300 text-sm font-medium flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">translate</span>
                  Langues
                </h4>
                <div className="space-y-2">
                  {(formData.languages || []).map((lang: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="Langue" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={lang.language || ''} onChange={(e) => {
                        const newLangs = [...formData.languages];
                        newLangs[idx] = { ...newLangs[idx], language: e.target.value };
                        setFormData({ ...formData, languages: newLangs });
                      }} />
                      <select className="p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={lang.level || 'Courant'} onChange={(e) => {
                        const newLangs = [...formData.languages];
                        newLangs[idx] = { ...newLangs[idx], level: e.target.value };
                        setFormData({ ...formData, languages: newLangs });
                      }}>
                        <option value="Natif">Natif</option>
                        <option value="Courant">Courant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Débutant">Débutant</option>
                      </select>
                      <button onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_: any, i: number) => i !== idx) })} className="p-2 rounded-lg bg-red-500/10 text-red-400">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setFormData({ ...formData, languages: [...(formData.languages || []), { language: '', level: 'Courant' }] })} className="w-full py-2 rounded-lg bg-rose-500/20 text-rose-300 text-sm font-medium flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">link</span>
                  Liens
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">LinkedIn</label>
                    <input type="url" placeholder="https://linkedin.com/in/..." className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 outline-none" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">GitHub</label>
                    <input type="url" placeholder="https://github.com/..." className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-slate-500 outline-none" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1.5">Site web</label>
                    <input type="url" placeholder="https://..." className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-rose-500 outline-none" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Hobbies */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">interests</span>
                  Loisirs
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.hobbies || []).map((hobby: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                      {hobby}
                      <button onClick={() => setFormData({ ...formData, hobbies: formData.hobbies.filter((_: any, i: number) => i !== idx) })} className="ml-1 text-rose-400 hover:text-rose-200">
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Ajouter un loisir" className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      setFormData({ ...formData, hobbies: [...(formData.hobbies || []), (e.target as HTMLInputElement).value.trim()] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }} />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/5 flex gap-3 shrink-0">
              <button className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-medium" onClick={() => setEditingProfile(false)}>Annuler</button>
              <button className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-bold" onClick={async () => {
                try {
                  const payload: any = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    school: formData.school,
                    school_url: formData.school_url || null,
                    program: formData.program,
                    year: formData.year,
                    role: formData.role,
                    about: formData.about,
                    availability: formData.availability,
                    duration: formData.duration,
                    education: formData.education,
                    experience: formData.experience,
                    hobbies: formData.hobbies,
                    linkedin_url: formData.linkedin_url || null,
                    github_url: formData.github_url || null,
                    website_url: formData.website_url || null,
                    location: formData.location || '',
                    languages: formData.languages || [],
                    phone: formData.phone || '',
                    skills: formData.skills || [],
                  };
                  const updated = await api.updateCurrentUser(payload);
                  setUserData(updated);
                  setEditingProfile(false);
                } catch (err) {
                  console.error('Erreur update:', err);
                }
              }}>Enregistrer</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProfileScreen;
