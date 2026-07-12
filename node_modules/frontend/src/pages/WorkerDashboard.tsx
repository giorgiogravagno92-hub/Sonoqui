import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DIPLOMAS, DEGREES, PROFESSIONS, CITIES } from '../utils/constants';

interface WorkerDashboardProps {
  onNotifyMobile?: (title: string, message: string) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onNotifyMobile }) => {
  const [profile, setProfile] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'interviews' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  
  // Availability activation modal states
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [availStatus, setAvailStatus] = useState('DISPONIBILE_SUBITO');
  const [availProfession, setAvailProfession] = useState('');
  const [availCity, setAvailCity] = useState('');
  const [availDistance, setAvailDistance] = useState(50);
  const [availDetails, setAvailDetails] = useState('');
  const [availProfessionsList, setAvailProfessionsList] = useState<string[]>([]);
  const [tempSingleProf, setTempSingleProf] = useState('');
  const [showCustomProfInput, setShowCustomProfInput] = useState(false);
  const [customProfText, setCustomProfText] = useState('');

  // Form states
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    profession: '',
    specialization: '',
    city: '',
    province: '',
    region: '',
    experienceYears: 0,
    educationLevel: 'NESSUNO',
    educationField: '',
    skills: '',
    certifications: '',
    hasLicense: false,
    hasCar: false,
    maxDistanceKm: 50,
    desiredContract: 'TEMPO_INDETERMINATO',
    desiredSalary: '',
    cvPdfUrl: '',
    videoPresentationUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const prof = await api.worker.getProfile();
      setProfile(prof);
      setFormData(prof);

      const ints = await api.worker.getInterviews();
      setInterviews(ints);

      const notifs = await api.worker.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching worker dashboard data:', err);
    }
  };

  const openAvailabilityModal = (status: string) => {
    setAvailStatus(status);
    const existingProfs = profile.profession 
      ? profile.profession.split(',').map((x: string) => x.trim()).filter(Boolean)
      : [];
    setAvailProfessionsList(existingProfs);
    setAvailCity(profile.city || '');
    setAvailDistance(profile.maxDistanceKm || 50);
    setAvailDetails(profile.availabilityDetails || '');
    setTempSingleProf('');
    setShowCustomProfInput(false);
    setCustomProfText('');
    setShowAvailModal(true);
  };

  const handleActivateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availProfessionsList.length === 0) {
      alert('Seleziona almeno una professione per attivare la disponibilità.');
      return;
    }
    const joinedProfessions = availProfessionsList.join(', ');
    try {
      const res = await api.worker.toggleAvailability({
        status: availStatus,
        profession: joinedProfessions,
        city: availCity,
        maxDistanceKm: Number(availDistance),
        availabilityDetails: availDetails
      });
      if (res.profile) {
        setProfile(res.profile);
        setFormData(res.profile);
      } else {
        setProfile((prev: any) => ({
          ...prev,
          availabilityStatus: availStatus,
          profession: joinedProfessions,
          city: availCity,
          maxDistanceKm: Number(availDistance),
          availabilityDetails: availDetails
        }));
      }
      setShowAvailModal(false);
      if (onNotifyMobile) {
        onNotifyMobile('Stato Attivo 🟢', `Disponibilità attivata come ${availStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSingleActiveProfession = async (profToRemove: string) => {
    const currentList = profile.profession.split(',').map((x: string) => x.trim()).filter(Boolean);
    const updatedList = currentList.filter((x: string) => x !== profToRemove);
    if (updatedList.length === 0) {
      handleDeactivateAvailability();
    } else {
      try {
        const res = await api.worker.toggleAvailability({
          status: profile.availabilityStatus,
          profession: updatedList.join(', '),
          city: profile.city,
          maxDistanceKm: profile.maxDistanceKm,
          availabilityDetails: profile.availabilityDetails
        });
        if (res.profile) {
          setProfile(res.profile);
          setFormData(res.profile);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeactivateAvailability = async () => {
    try {
      const res = await api.worker.toggleAvailability({
        status: 'NON_DISPONIBILE'
      });
      setProfile((prev: any) => ({ ...prev, availabilityStatus: 'NON_DISPONIBILE' }));
      if (onNotifyMobile) {
        onNotifyMobile('Stato Disattivo 🔴', 'Hai disattivato la tua disponibilità.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === 'NON_DISPONIBILE') {
      handleDeactivateAvailability();
    } else {
      openAvailabilityModal(status);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.worker.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      if (onNotifyMobile) {
        onNotifyMobile('Profilo Salvato', 'Le informazioni del tuo CV strutturato sono state aggiornate.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const simulatePDFUpload = () => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setFormData((f: any) => ({ ...f, cvPdfUrl: 'cv_caricato_firmato.pdf' }));
          setTimeout(() => setUploadProgress(null), 1000);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const simulateVideoUpload = () => {
    setVideoProgress(10);
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setFormData((f: any) => ({ ...f, videoPresentationUrl: 'video_presentazione_2026.mp4' }));
          setTimeout(() => setVideoProgress(null), 1000);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleInterviewResponse = async (id: string, status: string) => {
    try {
      await api.worker.respondToInterview(id, status);
      // Refresh interviews list
      const ints = await api.worker.getInterviews();
      setInterviews(ints);
      if (onNotifyMobile) {
        onNotifyMobile(
          status === 'ACCEPTED' ? 'Colloquio Accettato' : 'Colloquio Rifiutato',
          status === 'ACCEPTED' 
            ? 'Hai accettato la richiesta. I contatti sono ora visibili all\'azienda.'
            : 'Hai rifiutato la richiesta.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div style={{ padding: '24px', textAlign: 'center' }}>Caricamento dashboard in corso...</div>;

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Riquadro Unico Disponibilità */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--border-glass)' }}>
        <h4 style={{ marginBottom: '14px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
          DISPONIBILITÀ
        </h4>
        
        {/* Toggle buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <button 
            type="button"
            className="btn"
            onClick={() => openAvailabilityModal('DISPONIBILE_SUBITO')}
            style={{ 
              padding: '12px', 
              fontSize: '0.85rem',
              fontWeight: 700,
              background: profile.availabilityStatus !== 'NON_DISPONIBILE' ? 'var(--accent-green)' : 'transparent',
              color: profile.availabilityStatus !== 'NON_DISPONIBILE' ? '#fff' : 'var(--text-muted)',
              border: '1px solid ' + (profile.availabilityStatus !== 'NON_DISPONIBILE' ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'),
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🟢 Attiva
          </button>

          <button 
            type="button"
            className="btn"
            onClick={handleDeactivateAvailability}
            style={{ 
              padding: '12px', 
              fontSize: '0.85rem',
              fontWeight: 700,
              background: profile.availabilityStatus === 'NON_DISPONIBILE' ? 'var(--accent-red)' : 'transparent',
              color: profile.availabilityStatus === 'NON_DISPONIBILE' ? '#fff' : 'var(--text-muted)',
              border: '1px solid ' + (profile.availabilityStatus === 'NON_DISPONIBILE' ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)'),
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔴 Non Attiva
          </button>
        </div>

        {/* Status Details / Summary */}
        {profile.availabilityStatus !== 'NON_DISPONIBILE' ? (
          <div 
            onClick={() => openAvailabilityModal(profile.availabilityStatus)}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px dashed rgba(16, 185, 129, 0.2)', 
              padding: '16px', 
              borderRadius: '10px', 
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Clicca per modificare i requisiti di disponibilità"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--accent-green)', fontSize: '0.9rem' }}>📋 Riepilogo Ricerca Lavoro</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✏️ Modifica</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <strong>Professioni attive:</strong>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {profile.profession.split(',').map((p: string) => {
                    const trimmed = p.trim();
                    if (!trimmed) return null;
                    return (
                      <span key={trimmed} className="tag" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', padding: '2px 6px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px' }}>
                        {trimmed}
                        <span 
                          style={{ cursor: 'pointer', color: 'var(--accent-red)', fontWeight: 'bold' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSingleActiveProfession(trimmed);
                          }}
                        >
                          &times;
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div><strong>Sede di lavoro:</strong> {profile.city} (entro {profile.maxDistanceKm} Km)</div>
              <div><strong>Orari & Giorni:</strong> {profile.availabilityDetails || 'Non specificati'}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
            ℹ️ Il tuo profilo non è attualmente ricercabile dalle aziende. Clicca su "Attiva" per impostare i requisiti ed essere visibile.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px', paddingBottom: '8px' }}>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'profile' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('profile')}
        >
          📄 Profilo CV
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'interviews' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'interviews' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', position: 'relative' }}
          onClick={() => setActiveTab('interviews')}
        >
          ✉️ Colloqui
          {interviews.filter(i => i.status === 'PENDING').length > 0 && (
            <span style={{ position: 'absolute', top: '0', right: '10px', background: 'var(--accent-red)', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem' }}>
              {interviews.filter(i => i.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'notifications' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'notifications' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifiche
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '16px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Modifica CV Strutturato</h3>

              <div className="form-control-row">
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input type="text" className="form-control" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Cognome</label>
                  <input type="text" className="form-control" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Professione</label>
                <select 
                  className="form-control" 
                  value={formData.profession && !PROFESSIONS.includes(formData.profession) ? 'Altra professione' : (formData.profession || '')}
                  onChange={(e) => {
                    if (e.target.value === 'Altra professione') {
                      setFormData({ ...formData, profession: '' });
                    } else {
                      setFormData({ ...formData, profession: e.target.value });
                    }
                  }}
                  required
                >
                  <option value="">-- Seleziona Professione --</option>
                  {PROFESSIONS.map((prof) => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                  <option value="Altra professione">Altra professione</option>
                </select>

                {(formData.profession === '' || (formData.profession && !PROFESSIONS.includes(formData.profession))) && (
                  <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specifica professione personalizzata</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.profession || ''} 
                      onChange={(e) => setFormData({...formData, profession: e.target.value})} 
                      placeholder="es. Astronauta, Sommelier" 
                      required 
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Specializzazione</label>
                <input type="text" className="form-control" value={formData.specialization || ''} onChange={(e) => setFormData({...formData, specialization: e.target.value})} placeholder="es. Impianti Industriali" />
              </div>

              <div className="form-control-row">
                <div className="form-group">
                  <label className="form-label">Città</label>
                  <select 
                    className="form-control" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    required
                  >
                    <option value="">-- Seleziona Città --</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Provincia (Sigla)</label>
                  <input type="text" className="form-control" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value.toUpperCase()})} maxLength={2} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Anni Esperienza</label>
                <input type="number" className="form-control" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: e.target.value})} min={0} required />
              </div>

              <div className="form-group">
                <label className="form-label">Competenze (separate da virgola)</label>
                <input type="text" className="form-control" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="es. Cablaggio, Quadri Elettrici" required />
              </div>

              <div className="form-group">
                <label className="form-label">Certificazioni</label>
                <input type="text" className="form-control" value={formData.certifications || ''} onChange={(e) => setFormData({...formData, certifications: e.target.value})} placeholder="es. PES/PAV, FGAS" />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <label className="switch-container">
                  <span className="form-label" style={{ margin: 0 }}>Automunito</span>
                  <label className="switch">
                    <input type="checkbox" checked={formData.hasCar} onChange={(e) => setFormData({...formData, hasCar: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </label>
                <label className="switch-container">
                  <span className="form-label" style={{ margin: 0 }}>Patente</span>
                  <label className="switch">
                    <input type="checkbox" checked={formData.hasLicense} onChange={(e) => setFormData({...formData, hasLicense: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Titolo di Studio</label>
                <select 
                  className="form-control" 
                  value={formData.educationLevel || 'NESSUNO'} 
                  onChange={(e) => setFormData({...formData, educationLevel: e.target.value, educationField: e.target.value === 'NESSUNO' || e.target.value === 'LICENZA_MEDIA' ? '' : ''})}
                >
                  <option value="NESSUNO">Nessun Titolo</option>
                  <option value="LICENZA_MEDIA">Licenza Media</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="LAUREA">Laurea</option>
                </select>
              </div>

              {formData.educationLevel === 'DIPLOMA' && (
                <div className="form-group">
                  <label className="form-label">Tipo di Diploma</label>
                  <select 
                    className="form-control" 
                    value={formData.educationField || ''} 
                    onChange={(e) => setFormData({...formData, educationField: e.target.value})}
                    required
                  >
                    <option value="">-- Seleziona Diploma --</option>
                    {DIPLOMAS.map((dip) => (
                      <option key={dip} value={dip}>{dip}</option>
                    ))}
                    <option value="Altro Diploma">Altro Diploma</option>
                  </select>
                </div>
              )}

              {formData.educationLevel === 'LAUREA' && (
                <div className="form-group">
                  <label className="form-label">Tipo di Laurea</label>
                  <select 
                    className="form-control" 
                    value={formData.educationField || ''} 
                    onChange={(e) => setFormData({...formData, educationField: e.target.value})}
                    required
                  >
                    <option value="">-- Seleziona Laurea --</option>
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Contratto Desiderato</label>
                <select className="form-control" value={formData.desiredContract} onChange={(e) => setFormData({...formData, desiredContract: e.target.value})}>
                  <option value="TEMPO_INDETERMINATO">Indeterminato</option>
                  <option value="TEMPO_DETERMINATO">Determinato</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="APPRENDISTATO">Apprendistato</option>
                  <option value="COLLABORAZIONE">Collaborazione / P.IVA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Retribuzione Desiderata (Facoltativa)</label>
                <input type="text" className="form-control" value={formData.desiredSalary || ''} onChange={(e) => setFormData({...formData, desiredSalary: e.target.value})} placeholder="es. €1.800/mese o RAL €30k" />
              </div>

              {/* PDF & Video Upload Simulator */}
              <div style={{ border: '1px dashed var(--border-glass)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '0.85rem' }}>📄 CV PDF & 🎥 Video Presentazione</h5>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', flex: 1 }} onClick={simulatePDFUpload}>
                    {formData.cvPdfUrl ? '✓ CV Caricato (PDF)' : '📎 Carica CV PDF'}
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem', flex: 1 }} onClick={simulateVideoUpload}>
                    {formData.videoPresentationUrl ? '✓ Video Caricato' : '🎥 Registra Video'}
                  </button>
                </div>

                {uploadProgress !== null && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ background: 'var(--accent-blue)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.2s' }}></div>
                  </div>
                )}
                {videoProgress !== null && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--accent-purple)', height: '100%', width: `${videoProgress}%`, transition: 'width 0.2s' }}></div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salva CV</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Annulla</button>
              </div>
            </form>
          ) : (
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>CV Digitale Strutturato</h3>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setIsEditing(true)}>
                  ✏️ Modifica
                </button>
              </div>



              {/* Candidate Info Grid */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                <img 
                  src={profile.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                  alt="Avatar" 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{profile.firstName} {profile.lastName}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {profile.city} ({profile.province}), {profile.region}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>Professione:</strong> {profile.profession} {profile.specialization ? `(${profile.specialization})` : ''}</div>
                <div><strong>Esperienza:</strong> {profile.experienceYears} anni</div>
                <div>
                  <strong>Titolo di Studio:</strong> {
                    profile.educationLevel === 'NESSUNO' || !profile.educationLevel ? 'Nessun Titolo' :
                    profile.educationLevel === 'LICENZA_MEDIA' ? 'Licenza Media' :
                    `${profile.educationLevel === 'DIPLOMA' ? 'Diploma' : 'Laurea'} - ${profile.educationField || ''}`
                  }
                </div>
                <div><strong>Contratto Desiderato:</strong> {profile.desiredContract.replace('_', ' ')}</div>
                {profile.desiredSalary && <div><strong>Retribuzione desiderata:</strong> {profile.desiredSalary}</div>}
                <div><strong>Patente B:</strong> {profile.hasLicense ? 'Sì' : 'No'} | <strong>Automunito:</strong> {profile.hasCar ? 'Sì' : 'No'}</div>
                
                <div style={{ marginTop: '8px' }}>
                  <strong>Competenze:</strong>
                  <div className="tag-list">
                    {profile.skills.split(',').map((skill: string, i: number) => (
                      <span key={i} className="tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>

                {profile.certifications && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>Certificazioni:</strong>
                    <div className="tag-list">
                      {profile.certifications.split(',').map((cert: string, i: number) => (
                        <span key={i} className="tag" style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#d8b4fe' }}>{cert.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Status */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  {profile.cvPdfUrl && <span style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>📎 CV PDF Caricato</span>}
                  {profile.videoPresentationUrl && <span style={{ background: 'rgba(139,92,246,0.1)', color: '#d8b4fe', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>🎥 Video Presentazione</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Richieste di Colloquio Ricevute</h3>
          {interviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              Nessuna richiesta di colloquio ricevuta al momento.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interviews.map((req) => (
                <div key={req.id} className="glass-card" style={{ padding: '16px', borderLeft: req.status === 'PENDING' ? '3px solid var(--accent-blue)' : '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{req.company.companyName}</strong>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: req.status === 'ACCEPTED' ? 'rgba(16,185,129,0.1)' : (req.status === 'DECLINED' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'),
                        color: req.status === 'ACCEPTED' ? 'var(--accent-green)' : (req.status === 'DECLINED' ? 'var(--accent-red)' : 'var(--accent-blue)'),
                        fontWeight: 700
                      }}
                    >
                      {req.status === 'PENDING' ? 'IN ATTESA' : (req.status === 'ACCEPTED' ? 'ACCETTATO' : 'RIFIUTATO')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{req.message}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    📅 Data proposta: <strong>{req.interviewDate}</strong>
                  </div>

                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }} onClick={() => handleInterviewResponse(req.id, 'ACCEPTED')}>
                        Accetta
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }} onClick={() => handleInterviewResponse(req.id, 'DECLINED')}>
                        Rifiuta
                      </button>
                    </div>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      📞 Contatto: {req.company.contactPerson} - {req.company.contactPhone || 'Non inserito'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Storico Notifiche Push</h3>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
              Nessuna notifica ricevuta.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((n) => (
                <div key={n.id} className="glass-card" style={{ padding: '12px', background: n.read ? 'rgba(15,23,42,0.4)' : 'var(--bg-card)', borderLeft: n.read ? 'none' : '2px solid var(--accent-purple)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAvailModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px' }}>
            <div className="modal-close" onClick={() => setShowAvailModal(false)}>&times;</div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🟢 Attiva la tua Disponibilità
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Conferma i requisiti di ricerca lavoro per farti trovare dalle aziende giuste.
            </p>

            <form onSubmit={handleActivateAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Professioni Attivate (una o più)</label>
                
                {/* Active Professions List */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {availProfessionsList.map(p => (
                    <span key={p} className="tag" style={{ background: 'var(--accent-blue)', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'transparent' }}>
                      {p}
                      <span 
                        style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }} 
                        onClick={() => setAvailProfessionsList(availProfessionsList.filter(item => item !== p))}
                      >
                        &times;
                      </span>
                    </span>
                  ))}
                  {availProfessionsList.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nessuna professione selezionata</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    className="form-control" 
                    value={tempSingleProf}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Altra professione') {
                        setShowCustomProfInput(true);
                        setTempSingleProf('');
                      } else if (val) {
                        if (!availProfessionsList.includes(val)) {
                          setAvailProfessionsList([...availProfessionsList, val]);
                        }
                        setTempSingleProf('');
                      }
                    }}
                  >
                    <option value="">+ Aggiungi Professione...</option>
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Altra professione">Altra professione</option>
                  </select>
                </div>

                {showCustomProfInput && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={customProfText}
                      onChange={(e) => setCustomProfText(e.target.value)}
                      placeholder="Specifica professione personalizzata..." 
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        if (customProfText) {
                          const trimmed = customProfText.trim();
                          if (trimmed && !availProfessionsList.includes(trimmed)) {
                            setAvailProfessionsList([...availProfessionsList, trimmed]);
                          }
                          setCustomProfText('');
                          setShowCustomProfInput(false);
                        }
                      }}
                    >
                      Aggiungi
                    </button>
                  </div>
                )}
              </div>

              <div className="form-control-row">
                <div className="form-group">
                  <label className="form-label">Città di Riferimento</label>
                  <select 
                    className="form-control" 
                    value={availCity} 
                    onChange={(e) => setAvailCity(e.target.value)} 
                    required 
                  >
                    <option value="">-- Seleziona Città --</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Distanza Max (Km)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={availDistance} 
                    onChange={(e) => setAvailDistance(Number(e.target.value))} 
                    min={1}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Disponibilità oraria e giorni</label>
                <textarea 
                  className="form-control" 
                  value={availDetails} 
                  onChange={(e) => setAvailDetails(e.target.value)} 
                  placeholder="es. Lun-Ven 8:00-14:00, Full-time, o Turni"
                  rows={2}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ marginTop: '10px', width: '100%' }}>
                ✅ Conferma e Attiva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
