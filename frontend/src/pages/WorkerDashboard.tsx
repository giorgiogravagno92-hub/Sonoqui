import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DIPLOMAS, DEGREES, PROFESSIONS, CITIES, REGIONS_AND_PROVINCES, COMPUTER_SKILLS_LIST, ORGANIZATIONAL_SKILLS_LIST, PROVINCE_SIGLE } from '../utils/constants';

interface WorkerDashboardProps {
  onNotifyMobile?: (title: string, message: string) => void;
}

const capitalizeCity = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onNotifyMobile }) => {
  const [profile, setProfile] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);

  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
  const [availRoles, setAvailRoles] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [noSalaryPref, setNoSalaryPref] = useState(false);

  // Work Experience local form states
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCity, setNewExpCity] = useState('');
  const [newExpProvince, setNewExpProvince] = useState('');
  const [newExpSigla, setNewExpSigla] = useState('');
  const [newExpStart, setNewExpStart] = useState('');
  const [newExpEnd, setNewExpEnd] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  
  // Availability activation modal states
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [availStatus, setAvailStatus] = useState('DISPONIBILE_PROPOSTE');
  
  // Advanced availability selection states
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<{ name: string; region: string; maxDistance: number }[]>([]);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [availNotes, setAvailNotes] = useState('');

  // Structured skills states
  const [computerSkills, setComputerSkills] = useState<Record<string, string>>({});
  const [organizationalSkills, setOrganizationalSkills] = useState<Record<string, string>>({});
  const [compSkillsOpen, setCompSkillsOpen] = useState(false);
  const [orgSkillsOpen, setOrgSkillsOpen] = useState(false);

  // Multiple educations states
  const [educationTitles, setEducationTitles] = useState<{ level: string; field: string }[]>([]);
  const [newEduLevel, setNewEduLevel] = useState('DIPLOMA');
  const [newEduField, setNewEduField] = useState('');

  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    profession: '',
    city: '',
    province: '',
    region: '',
    educationLevel: 'NESSUNO',
    educationField: '',
    skills: '{}',
    certifications: '',
    hasLicense: false,
    hasCar: false,
    maxDistanceKm: 50,
    desiredContract: 'TEMPO_INDETERMINATO',
    desiredSalary: '',
    cvPdfUrl: '',
    videoPresentationUrl: '',
    availabilityRegionsProvinces: '[]',
    availabilityContracts: '[]',
    educationTitles: '[]',
    notes: '',
    workExperiences: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize skills and education states when editing is toggled or profile changes
  useEffect(() => {
    if (profile) {
      try {
        const parsed = JSON.parse(profile.skills || '{}');
        setComputerSkills(parsed.computerSkills || {});
        setOrganizationalSkills(parsed.organizationalSkills || {});
      } catch (e) {
        setComputerSkills({});
        setOrganizationalSkills({});
      }
      try {
        const parsedEdu = JSON.parse(profile.educationTitles || '[]');
        setEducationTitles(parsedEdu);
      } catch (e) {
        setEducationTitles([]);
      }
    }
  }, [profile, isEditing]);

  const fetchData = async () => {
    try {
      const prof = await api.worker.getProfile();
      setProfile(prof);
      setFormData({
        ...prof,
        workExperiences: prof.workExperiences || [],
        availabilityRegionsProvinces: prof.availabilityRegionsProvinces || '[]',
        availabilityContracts: prof.availabilityContracts || '[]',
        educationTitles: prof.educationTitles || '[]',
        notes: prof.notes || ''
      });

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
    
    // Parse availabilityRegionsProvinces
    let parsedRegionsProvinces: any[] = [];
    try {
      parsedRegionsProvinces = JSON.parse(profile.availabilityRegionsProvinces || '[]');
    } catch (e) {
      parsedRegionsProvinces = [];
    }

    const regions: string[] = parsedRegionsProvinces.map(r => r.region);
    const provinces: { name: string; region: string; maxDistance: number }[] = [];
    parsedRegionsProvinces.forEach(r => {
      if (r.provinces) {
        r.provinces.forEach((p: any) => {
          provinces.push({ name: p.name, region: r.region, maxDistance: p.maxDistance || 50 });
        });
      }
    });

    setSelectedRegions(regions);
    setSelectedProvinces(provinces);

    // Parse availabilityContracts
    let parsedContracts: string[] = [];
    try {
      parsedContracts = JSON.parse(profile.availabilityContracts || '[]');
    } catch (e) {
      parsedContracts = [];
    }
    setSelectedContracts(parsedContracts);
    setAvailNotes(profile.notes || '');

    // Parse availabilityRoles
    let parsedRoles: string[] = [];
    try {
      parsedRoles = JSON.parse(profile.availabilityRoles || '[]');
    } catch (e) {
      parsedRoles = [];
    }
    if (parsedRoles.length === 0 && profile.profession) {
      parsedRoles = [profile.profession];
    }
    setAvailRoles(parsedRoles);

    // Parse desiredSalary min and max
    const sal = profile.desiredSalary || '';
    if (sal === 'Nessuna preferenza') {
      setNoSalaryPref(true);
      setMinSalary('');
      setMaxSalary('');
    } else if (sal.includes('-')) {
      const parts = sal.split('-');
      setMinSalary(parts[0].trim());
      setMaxSalary(parts[1].trim());
      setNoSalaryPref(false);
    } else {
      setMinSalary(sal);
      setMaxSalary('');
      setNoSalaryPref(false);
    }

    setShowAvailModal(true);
  };

  const handleToggleRegion = (region: string) => {
    if (region === 'Tutte le regioni') {
      if (selectedRegions.includes('Tutte le regioni')) {
        setSelectedRegions([]);
      } else {
        setSelectedRegions(['Tutte le regioni']);
        setSelectedProvinces([]);
      }
    } else {
      let updated = [...selectedRegions];
      if (updated.includes('Tutte le regioni')) {
        updated = [];
      }
      if (updated.includes(region)) {
        updated = updated.filter(r => r !== region);
        setSelectedProvinces(selectedProvinces.filter(p => p.region !== region));
      } else {
        updated.push(region);
      }
      setSelectedRegions(updated);
    }
  };

  const handleToggleProvince = (provName: string, region: string) => {
    const exists = selectedProvinces.find(p => p.name === provName && p.region === region);
    if (exists) {
      setSelectedProvinces(selectedProvinces.filter(p => !(p.name === provName && p.region === region)));
    } else {
      setSelectedProvinces([...selectedProvinces, { name: provName, region, maxDistance: 50 }]);
    }
  };

  const handleDistanceChange = (provName: string, region: string, dist: number) => {
    setSelectedProvinces(selectedProvinces.map(p => {
      if (p.name === provName && p.region === region) {
        return { ...p, maxDistance: dist };
      }
      return p;
    }));
  };

  const handleToggleContract = (contract: string) => {
    if (contract === 'Nessuna preferenza') {
      if (selectedContracts.includes('Nessuna preferenza')) {
        setSelectedContracts([]);
      } else {
        setSelectedContracts(['Nessuna preferenza']);
      }
    } else {
      let updated = selectedContracts.filter(c => c !== 'Nessuna preferenza');
      if (updated.includes(contract)) {
        updated = updated.filter(c => c !== contract);
      } else {
        updated.push(contract);
      }
      setSelectedContracts(updated);
    }
  };

  const handleActivateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRegions.length === 0) {
      alert('Seleziona almeno una regione di interesse per attivare la disponibilità.');
      return;
    }

    const regionsWithoutProvinces = selectedRegions.filter(r => r !== 'Tutte le regioni' && !selectedProvinces.some(p => p.region === r));
    if (regionsWithoutProvinces.length > 0) {
      alert(`Seleziona almeno una provincia per la regione: ${regionsWithoutProvinces.join(', ')}.`);
      return;
    }

    const regionsProvincesStructure = selectedRegions.map(r => {
      const regionProvinces = selectedProvinces.filter(p => p.region === r).map(p => ({
        name: p.name,
        maxDistance: p.maxDistance
      }));
      return {
        region: r,
        provinces: regionProvinces
      };
    });

    if (availRoles.length === 0) {
      alert('Seleziona almeno un ruolo/professione per attivare la disponibilità.');
      return;
    }

    const salaryStr = noSalaryPref ? 'Nessuna preferenza' : (minSalary && maxSalary ? `${minSalary} - ${maxSalary}` : minSalary || '');

    try {
      const res = await api.worker.toggleAvailability({
        status: 'DISPONIBILE_PROPOSTE',
        availabilityRegionsProvinces: JSON.stringify(regionsProvincesStructure),
        availabilityContracts: JSON.stringify(selectedContracts),
        availabilityRoles: JSON.stringify(availRoles),
        desiredSalary: salaryStr,
        notes: availNotes
      });
      if (res.profile) {
        setProfile(res.profile);
        setFormData({
          ...res.profile,
          workExperiences: res.profile.workExperiences || [],
          availabilityRegionsProvinces: res.profile.availabilityRegionsProvinces || '[]',
          availabilityContracts: res.profile.availabilityContracts || '[]',
          availabilityRoles: res.profile.availabilityRoles || '[]',
          notes: res.profile.notes || ''
        });
      }
      setShowAvailModal(false);
      if (onNotifyMobile) {
        onNotifyMobile('Stato Attivo 🟢', 'Disponibilità a ricevere proposte attivata.');
      }
    } catch (err) {
      console.error(err);
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
      const skillsStr = JSON.stringify({ computerSkills, organizationalSkills });
      const educationsStr = JSON.stringify(educationTitles);
      const updated = await api.worker.updateProfile({
        ...formData,
        skills: skillsStr,
        educationTitles: educationsStr
      });
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
      {/* Riquadro Unico Ricezione Proposte */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--border-glass)' }}>
        <h4 style={{ marginBottom: '14px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
          STATO RICEZIONE PROPOSTE
        </h4>
        
        {/* Toggle buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <button 
            type="button"
            className="btn"
            onClick={() => openAvailabilityModal('DISPONIBILE_PROPOSTE')}
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
            🟢 Attiva Ricezione Proposte
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
            🔴 Non Disponibile
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
                <strong>Regioni e Province attive:</strong>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {(() => {
                    let regions = [];
                    try {
                      regions = JSON.parse(profile.availabilityRegionsProvinces || '[]');
                    } catch(e) {}
                    if (regions.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Nessuna specificata</span>;
                    return regions.map((r: any) => (
                      <span key={r.region} className="tag" style={{ borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px', fontSize: '0.75rem', padding: '3px 8px' }}>
                        📍 {r.region}: {r.provinces && r.provinces.length > 0 ? r.provinces.map((p: any) => `${p.name} (${p.maxDistance}km)`).join(', ') : 'Tutte le province'}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <strong>Contratti desiderati:</strong>{' '}
                {(() => {
                  let contracts = [];
                  try {
                    contracts = JSON.parse(profile.availabilityContracts || '[]');
                  } catch(e) {}
                  if (contracts.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Nessuna preferenza</span>;
                  return contracts.join(', ');
                })()}
              </div>

              {profile.notes && (
                <div>
                  <strong>Note:</strong> <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{profile.notes}"</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
            ℹ️ Il tuo profilo non è attualmente ricercabile dalle aziende. Clicca su "Attiva Ricezione Proposte" per impostare i requisiti ed essere visibile.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px', paddingBottom: '8px' }}>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('profile')}
        >
          📄 Profilo CV
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'notifications' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'notifications' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', position: 'relative' }}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifiche
          {interviews.filter(i => i.status === 'PENDING').length > 0 && (
            <span style={{ position: 'absolute', top: '0', right: '10px', background: 'var(--accent-red)', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem' }}>
              {interviews.filter(i => i.status === 'PENDING').length}
            </span>
          )}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Città</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.city || ''} 
                    onChange={(e) => setFormData({...formData, city: capitalizeCity(e.target.value)})} 
                    required 
                    autoComplete="off" 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Provincia</label>
                  <select 
                    className="form-control" 
                    value={formData.province || ''} 
                    onChange={(e) => {
                      const selectedProv = e.target.value;
                      const associatedSigla = PROVINCE_SIGLE[selectedProv] || '';
                      setFormData({
                        ...formData, 
                        province: selectedProv,
                        sigla: associatedSigla
                      });
                    }} 
                    required
                  >
                    <option value="">-- Seleziona --</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sigla</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.sigla || ''} 
                    onChange={(e) => setFormData({...formData, sigla: e.target.value.toUpperCase()})} 
                    maxLength={2} 
                    required 
                    autoComplete="off" 
                  />
                </div>
              </div>

              {/* Competenze Strutturate in Sottocategorie */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Competenze Professionali</label>
                
                {/* Collapsible Computer Skills */}
                <div style={{ marginBottom: '12px', border: '1px solid var(--border-glass)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div 
                    type="button"
                    onClick={() => setCompSkillsOpen(!compSkillsOpen)}
                    style={{ padding: '12px', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: compSkillsOpen ? '1px solid var(--border-glass)' : 'none' }}
                  >
                    <span>💻 Competenze informatiche ({Object.keys(computerSkills).length} selezionate)</span>
                    <span>{compSkillsOpen ? '▲' : '▼'}</span>
                  </div>
                  {compSkillsOpen && (
                    <div style={{ padding: '12px', background: '#ffffff', maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '6px', color: 'var(--text-secondary)' }}>Competenza</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '60px' }}>Base</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '60px' }}>Intermedio</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '60px' }}>Avanzato</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '60px' }}>Nessuna</th>
                          </tr>
                        </thead>
                        <tbody>
                          {COMPUTER_SKILLS_LIST.map(skill => {
                            const currentLevel = computerSkills[skill] || '';
                            return (
                              <tr key={skill} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px', fontWeight: 500, color: 'var(--text-primary)' }}>{skill}</td>
                                {['Base', 'Intermedio', 'Avanzato'].map(level => (
                                  <td key={level} style={{ padding: '6px', textAlign: 'center' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={currentLevel === level}
                                      onChange={() => {
                                        if (currentLevel === level) {
                                          const copy = { ...computerSkills };
                                          delete copy[skill];
                                          setComputerSkills(copy);
                                        } else {
                                          setComputerSkills({ ...computerSkills, [skill]: level });
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </td>
                                ))}
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={currentLevel === ''}
                                    onChange={() => {
                                      const copy = { ...computerSkills };
                                      delete copy[skill];
                                      setComputerSkills(copy);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Collapsible Organizational Skills */}
                <div style={{ border: '1px solid var(--border-glass)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div 
                    type="button"
                    onClick={() => setOrgSkillsOpen(!orgSkillsOpen)}
                    style={{ padding: '12px', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: orgSkillsOpen ? '1px solid var(--border-glass)' : 'none' }}
                  >
                    <span>🖐️ Competenze organizzative ({Object.keys(organizationalSkills).length} selezionate)</span>
                    <span>{orgSkillsOpen ? '▲' : '▼'}</span>
                  </div>
                  {orgSkillsOpen && (
                    <div style={{ padding: '12px', background: '#ffffff', maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '6px', color: 'var(--text-secondary)', width: '30%' }}>Competenza</th>
                            <th style={{ padding: '6px', color: 'var(--text-secondary)', width: '40%' }}>Descrizione</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '50px' }}>Base</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '50px' }}>Intermedio</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '50px' }}>Avanzato</th>
                            <th style={{ padding: '6px', textAlign: 'center', color: 'var(--text-secondary)', width: '50px' }}>Nessuna</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ORGANIZATIONAL_SKILLS_LIST.map(skill => {
                            const currentLevel = organizationalSkills[skill.name] || '';
                            return (
                              <tr key={skill.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>{skill.name}</td>
                                <td style={{ padding: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{skill.description}</td>
                                {['Base', 'Intermedio', 'Avanzato'].map(level => (
                                  <td key={level} style={{ padding: '6px', textAlign: 'center' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={currentLevel === level}
                                      onChange={() => {
                                        if (currentLevel === level) {
                                          const copy = { ...organizationalSkills };
                                          delete copy[skill.name];
                                          setOrganizationalSkills(copy);
                                        } else {
                                          setOrganizationalSkills({ ...organizationalSkills, [skill.name]: level });
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </td>
                                ))}
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={currentLevel === ''}
                                    onChange={() => {
                                      const copy = { ...organizationalSkills };
                                      delete copy[skill.name];
                                      setOrganizationalSkills(copy);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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

              {/* Sezione Titoli di Studio in Modifica */}
              <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🎓 Titoli di Studio Conseguiti (uno o più)
                </h4>

                {/* Lista titoli aggiunti */}
                {educationTitles.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {educationTitles.map((edu, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>
                            {edu.level === 'LICENZA_MEDIA' ? 'Licenza Media' : edu.level === 'DIPLOMA' ? 'Diploma' : edu.level === 'LAUREA' ? 'Laurea' : edu.level}
                          </strong>
                          {edu.field && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '8px' }}>• {edu.field}</span>}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setEducationTitles(educationTitles.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Elimina
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Nessun titolo di studio inserito.</p>
                )}

                {/* Form inserimento nuovo titolo */}
                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-glass)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Livello</label>
                      <select 
                        className="form-control" 
                        value={newEduLevel}
                        onChange={(e) => {
                          setNewEduLevel(e.target.value);
                          setNewEduField('');
                        }}
                      >
                        <option value="LICENZA_MEDIA">Licenza Media</option>
                        <option value="DIPLOMA">Diploma</option>
                        <option value="LAUREA">Laurea</option>
                      </select>
                    </div>

                    {newEduLevel === 'DIPLOMA' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Diploma</label>
                        <select 
                          className="form-control" 
                          value={newEduField} 
                          onChange={(e) => setNewEduField(e.target.value)}
                        >
                          <option value="">-- Seleziona Diploma --</option>
                          {DIPLOMAS.map((dip) => (
                            <option key={dip} value={dip}>{dip}</option>
                          ))}
                          <option value="Altro Diploma">Altro Diploma</option>
                        </select>
                      </div>
                    )}

                    {newEduLevel === 'LAUREA' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Laurea</label>
                        <select 
                          className="form-control" 
                          value={newEduField} 
                          onChange={(e) => setNewEduField(e.target.value)}
                        >
                          <option value="">-- Seleziona Laurea --</option>
                          {DEGREES.map((deg) => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if ((newEduLevel === 'DIPLOMA' || newEduLevel === 'LAUREA') && !newEduField) {
                        alert('Seleziona il tipo di titolo specifico.');
                        return;
                      }
                      const newItem = {
                        level: newEduLevel,
                        field: newEduLevel === 'LICENZA_MEDIA' ? '' : newEduField
                      };
                      setEducationTitles([...educationTitles, newItem]);
                      setNewEduField('');
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.75rem', width: '100%', marginTop: '6px' }}
                  >
                    + Aggiungi Titolo di Studio
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note / Presentazione del Candidato</label>
                <textarea 
                  className="form-control" 
                  value={formData.notes || ''} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  placeholder="Inserisci qui una breve presentazione, disponibilità o note particolari per le aziende..." 
                  rows={4}
                />
              </div>

              {/* Sezione Esperienze Lavorative in Modifica */}
              <div style={{ border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ marginBottom: '14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  💼 Esperienze Lavorative Precedenti
                </h4>

                {/* Lista esperienze aggiunte */}
                {(formData.workExperiences || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {(formData.workExperiences || []).map((exp: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{exp.role}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          🏢 {exp.companyName || 'Azienda non specificata'} {exp.city ? `• ${exp.city}` : ''} {exp.province ? ` (${exp.sigla ? exp.sigla : exp.province})` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          📅 {exp.startDate} - {exp.endDate || 'Presente'}
                        </div>
                        {exp.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                            {exp.description}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpIndex(idx);
                            setNewExpCompany(exp.companyName || '');
                            setNewExpRole(exp.role || '');
                            setNewExpCity(exp.city || '');
                            setNewExpProvince(exp.province || '');
                            setNewExpSigla(exp.sigla || '');
                            setNewExpStart(exp.startDate || '');
                            setNewExpEnd(exp.endDate || '');
                            setNewExpDesc(exp.description || '');
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '90px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--accent-blue)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: 600
                          }}
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.workExperiences.filter((_: any, i: number) => i !== idx);
                            setFormData({ ...formData, workExperiences: updated });
                            if (editingExpIndex === idx) {
                              setEditingExpIndex(null);
                              setNewExpCompany('');
                              setNewExpRole('');
                              setNewExpCity('');
                              setNewExpProvince('');
                              setNewExpSigla('');
                              setNewExpStart('');
                              setNewExpEnd('');
                              setNewExpDesc('');
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--accent-red)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Rimuovi
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Nessuna esperienza inserita nel CV.</p>
                )}

                {/* Form per aggiungere/modificare esperienza */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <h5 style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--accent-blue)' }}>
                    {editingExpIndex !== null ? '✏️ Modifica Esperienza' : 'Aggiungi Nuova Esperienza'}
                  </h5>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Azienda</label>
                    <input type="text" className="form-control" style={{ padding: '8px' }} value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} autoComplete="off" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Città</label>
                      <input type="text" className="form-control" style={{ padding: '8px' }} value={newExpCity} onChange={(e) => setNewExpCity(capitalizeCity(e.target.value))} autoComplete="off" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Provincia</label>
                      <select 
                        className="form-control" 
                        style={{ padding: '6px' }}
                        value={newExpProvince} 
                        onChange={(e) => {
                          const selected = e.target.value;
                          setNewExpProvince(selected);
                          setNewExpSigla(PROVINCE_SIGLE[selected] || '');
                        }}
                      >
                        <option value="">-- Seleziona --</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Sigla</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ padding: '8px' }} 
                        value={newExpSigla} 
                        onChange={(e) => setNewExpSigla(e.target.value.toUpperCase())} 
                        maxLength={2} 
                        autoComplete="off" 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Ruolo *</label>
                    <select 
                      className="form-control" 
                      value={PROFESSIONS.includes(newExpRole) ? newExpRole : (newExpRole ? 'Altra professione' : '')} 
                      onChange={(e) => {
                        if (e.target.value === 'Altra professione') {
                          setNewExpRole('');
                        } else {
                          setNewExpRole(e.target.value);
                        }
                      }}
                    >
                      <option value="">-- Seleziona Ruolo --</option>
                      {PROFESSIONS.map((prof) => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                      <option value="Altra professione">Altra professione</option>
                    </select>

                    {(newExpRole === '' || (newExpRole && !PROFESSIONS.includes(newExpRole))) && (
                      <div className="form-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Specifica ruolo personalizzato</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ padding: '8px' }} 
                          value={newExpRole} 
                          onChange={(e) => setNewExpRole(e.target.value)} 
                          autoComplete="off" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-control-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Data Inizio</label>
                      <input type="date" className="form-control" style={{ padding: '6px' }} value={newExpStart} onChange={(e) => setNewExpStart(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ fontSize: '0.7rem', margin: 0 }}>Data Fine</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem', cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 600 }}>
                          <input 
                            type="checkbox" 
                            checked={newExpEnd === 'Presente'} 
                            onChange={(e) => setNewExpEnd(e.target.checked ? 'Presente' : '')} 
                          />
                          Attuale
                        </label>
                      </div>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={{ padding: '6px' }} 
                        value={newExpEnd === 'Presente' ? new Date().toISOString().split('T')[0] : newExpEnd} 
                        onChange={(e) => setNewExpEnd(e.target.value)} 
                        disabled={newExpEnd === 'Presente'} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Descrivi Mansioni</label>
                    <textarea className="form-control" style={{ padding: '8px', resize: 'vertical' }} rows={2} value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} autoComplete="off" />
                  </div>
                  {editingExpIndex !== null ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newExpRole) {
                            alert('Il Ruolo è un campo obbligatorio.');
                            return;
                          }
                          const todayStr = new Date().toISOString().split('T')[0];
                          const endCompare = newExpEnd === 'Presente' ? todayStr : newExpEnd;
                          if (newExpStart && endCompare) {
                            if (new Date(newExpStart) > new Date(endCompare)) {
                              alert("La data di inizio non può essere superiore alla data di fine (o a quella odierna per il lavoro attuale).");
                              return;
                            }
                          }

                          const updatedExp = {
                            companyName: newExpCompany || '',
                            role: newExpRole,
                            city: newExpCity,
                            province: newExpProvince,
                            sigla: newExpSigla,
                            startDate: newExpStart,
                            endDate: newExpEnd || 'Presente',
                            description: newExpDesc
                          };

                          const list = [...(formData.workExperiences || [])];
                           list[editingExpIndex] = updatedExp;

                          setFormData({
                            ...formData,
                            workExperiences: list
                          });

                          setNewExpCompany('');
                          setNewExpRole('');
                          setNewExpCity('');
                          setNewExpProvince('');
                          setNewExpSigla('');
                          setNewExpStart('');
                          setNewExpEnd('');
                          setNewExpDesc('');
                          setEditingExpIndex(null);
                        }}
                        className="btn btn-success"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}
                      >
                        💾 Salva Modifiche
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewExpCompany('');
                          setNewExpRole('');
                          setNewExpCity('');
                          setNewExpProvince('');
                          setNewExpSigla('');
                          setNewExpStart('');
                          setNewExpEnd('');
                          setNewExpDesc('');
                          setEditingExpIndex(null);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExpRole) {
                          alert('Il Ruolo è un campo obbligatorio.');
                          return;
                        }
                        const todayStr = new Date().toISOString().split('T')[0];
                        const endCompare = newExpEnd === 'Presente' ? todayStr : newExpEnd;
                        if (newExpStart && endCompare) {
                          if (new Date(newExpStart) > new Date(endCompare)) {
                            alert("La data di inizio non può essere superiore alla data di fine (o a quella odierna per il lavoro attuale).");
                            return;
                          }
                        }

                        const newExp = {
                          companyName: newExpCompany || '',
                          role: newExpRole,
                          city: newExpCity,
                          province: newExpProvince,
                          sigla: newExpSigla,
                          startDate: newExpStart,
                          endDate: newExpEnd || 'Presente',
                          description: newExpDesc
                        };
                        setFormData({
                          ...formData,
                          workExperiences: [...(formData.workExperiences || []), newExp]
                        });
                        setNewExpCompany('');
                        setNewExpRole('');
                        setNewExpCity('');
                        setNewExpProvince('');
                        setNewExpSigla('');
                        setNewExpStart('');
                        setNewExpEnd('');
                        setNewExpDesc('');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', marginTop: '4px' }}
                    >
                      + Inserisci Esperienza
                    </button>
                  )}
                </div>
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
                <div><strong>Professione:</strong> {profile.profession}</div>
                <div>
                  <strong>Titolo/i di Studio:</strong>
                  {(() => {
                    let edus = [];
                    try {
                      edus = JSON.parse(profile.educationTitles || '[]');
                    } catch (e) {}
                    if (edus.length === 0) {
                      // Fallback for legacy
                      if (!profile.educationLevel || profile.educationLevel === 'NESSUNO') {
                        return <span style={{ marginLeft: '6px' }}>Nessun Titolo</span>;
                      }
                      const label = profile.educationLevel === 'LICENZA_MEDIA' ? 'Licenza Media' : 
                                    profile.educationLevel === 'DIPLOMA' ? 'Diploma' : 'Laurea';
                      return <span style={{ marginLeft: '6px' }}>{label} {profile.educationField ? `- ${profile.educationField}` : ''}</span>;
                    }
                    return (
                      <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                        {edus.map((edu: any, i: number) => {
                          const label = edu.level === 'LICENZA_MEDIA' ? 'Licenza Media' : 
                                        edu.level === 'DIPLOMA' ? 'Diploma' : 
                                        edu.level === 'LAUREA' ? 'Laurea' : edu.level;
                          return (
                            <li key={i}>
                              {label} {edu.field ? ` - ${edu.field}` : ''}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
                <div><strong>Patente B:</strong> {profile.hasLicense ? 'Sì' : 'No'} | <strong>Automunito:</strong> {profile.hasCar ? 'Sì' : 'No'}</div>
                {profile.notes && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Note / Presentazione:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{profile.notes}</span>
                  </div>
                )}
                
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    let parsed = { computerSkills: {}, organizationalSkills: {} };
                    try {
                      parsed = JSON.parse(profile.skills || '{}');
                    } catch (e) {
                      // Fallback for legacy skills
                      const skillsArr = (profile.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                      if (skillsArr.length > 0) {
                        return (
                          <div>
                            <strong>Competenze:</strong>
                            <div className="tag-list" style={{ marginTop: '4px' }}>
                              {skillsArr.map((skill: string, i: number) => (
                                <span key={i} className="tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    const compSkills = parsed.computerSkills || {};
                    const orgSkills = parsed.organizationalSkills || {};
                    const compKeys = Object.keys(compSkills);
                    const orgKeys = Object.keys(orgSkills);

                    return (
                      <>
                        {compKeys.length > 0 && (
                          <div>
                            <strong>Competenze Informatiche:</strong>
                            <div className="tag-list" style={{ marginTop: '4px' }}>
                              {compKeys.map(skill => (
                                <span key={skill} className="tag" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--accent-blue)' }}>
                                  {skill} ({compSkills[skill]})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {orgKeys.length > 0 && (
                          <div>
                            <strong>Competenze Organizzative:</strong>
                            <div className="tag-list" style={{ marginTop: '4px' }}>
                              {orgKeys.map(skill => (
                                <span key={skill} className="tag" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-green)' }}>
                                  {skill} ({orgSkills[skill]})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
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

                {/* Esperienze Lavorative Section in Display Mode */}
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block', marginBottom: '10px' }}>
                    💼 Esperienze Lavorative Precedenti:
                  </strong>
                  {profile.workExperiences && profile.workExperiences.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {profile.workExperiences.map((exp: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>🏢</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{exp.role}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                📅 {exp.startDate} - {exp.endDate || 'Presente'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {exp.companyName || 'Azienda non specificata'} {exp.city ? `• ${exp.city}` : ''} {exp.province ? `(${exp.sigla ? exp.sigla : exp.province})` : ''}
                            </div>
                            {exp.description && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4', fontStyle: 'italic' }}>
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nessuna esperienza lavorativa inserita nel CV.</p>
                  )}
                </div>

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

      {/* Notifications and Proposals Tab */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Proposte Iniziali Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✉️ Proposte Iniziali Ricevute
            </h3>
            {interviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                Nessuna proposta iniziale ricevuta al momento.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {interviews.map((req) => (
                  <div 
                    key={req.id} 
                    className="glass-card" 
                    style={{ 
                      padding: '16px', 
                      borderLeft: req.status === 'PENDING' ? '3px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                      background: req.status === 'PENDING' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{req.company.companyName || `${req.company.firstName} ${req.company.lastName}`}</strong>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          background: req.status === 'INTERESTED' || req.status === 'ACCEPTED' ? 'rgba(16,185,129,0.1)' : 
                                      (req.status === 'MORE_INFO' ? 'rgba(245,158,11,0.1)' : 
                                      (req.status === 'PENDING' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)')),
                          color: req.status === 'INTERESTED' || req.status === 'ACCEPTED' ? 'var(--accent-green)' : 
                                 (req.status === 'MORE_INFO' ? 'var(--accent-yellow)' : 
                                 (req.status === 'PENDING' ? 'var(--accent-blue)' : 'var(--accent-red)')),
                          fontWeight: 700
                        }}
                      >
                        {req.status === 'PENDING' ? 'IN ATTESA DI VALUTAZIONE' : 
                         req.status === 'INTERESTED' ? 'INTERESSATO A CONTATTO' :
                         req.status === 'MORE_INFO' ? 'RICHIESTE INFO' :
                         req.status === 'NOT_INTERESTED' ? 'NON INTERESSATO' :
                         req.status === 'ACCEPTED' ? 'ACCETTATO' : 'RIFIUTATO'}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>{req.message}</p>
                    
                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '8px 12px', fontSize: '0.75rem', flex: '1 1 auto', minWidth: '150px' }} 
                          onClick={() => handleInterviewResponse(req.id, 'INTERESTED')}
                        >
                          🤝 Interessato a essere contattato
                        </button>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '8px 12px', fontSize: '0.75rem', flex: '1 1 auto', minWidth: '150px', background: 'var(--accent-yellow)', borderColor: 'var(--accent-yellow)', color: '#000' }} 
                          onClick={() => handleInterviewResponse(req.id, 'MORE_INFO')}
                        >
                          ❓ Interessato ad ottenere maggiori informazioni
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '8px 12px', fontSize: '0.75rem', flex: '1 1 auto', minWidth: '100px' }} 
                          onClick={() => handleInterviewResponse(req.id, 'NOT_INTERESTED')}
                        >
                          ✕ Non interessato
                        </button>
                      </div>
                    )}

                    {['ACCEPTED', 'INTERESTED', 'MORE_INFO'].includes(req.status) && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', marginTop: '10px' }}>
                        <strong>📞 Contatto Azienda:</strong> {req.company.contactPerson} {req.company.contactPhone ? ` - ${req.company.contactPhone}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifiche push storiche */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: '#fff' }}>Storico Notifiche Push</h3>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                Nessuna notifica ricevuta al momento.
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0 0' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showAvailModal && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-close" onClick={() => setShowAvailModal(false)}>&times;</div>
            
            <h3 style={{ marginBottom: '10px', fontSize: '1.25rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
              🟢 Attiva Ricezione Proposte
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Imposta i tuoi requisiti geografici e contrattuali. Verrai cercato solo per proposte che corrispondono a queste preferenze.
            </p>

            <form onSubmit={handleActivateAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. CONFIGURAZIONE GEOGRAFICA */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                  1. Area Geografica di Interesse
                </label>
                
                {/* 1.1 REGIONI */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px', display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    1.1 Seleziona Regioni
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                    gap: '8px', 
                    maxHeight: '140px', 
                    overflowY: 'auto',
                    padding: '8px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)'
                  }}>
                    {Object.keys(REGIONS_AND_PROVINCES).map((region) => {
                      const isSelected = selectedRegions.includes(region);
                      return (
                        <button
                          type="button"
                          key={region}
                          onClick={() => handleToggleRegion(region)}
                          style={{
                            padding: '6px 8px',
                            fontSize: '0.7rem',
                            textAlign: 'left',
                            borderRadius: '6px',
                            border: '1px solid ' + (isSelected ? 'var(--accent-blue)' : 'var(--border-input)'),
                            background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                            color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: isSelected ? 600 : 'normal',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{region}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 PROVINCE */}
                {selectedRegions.length > 0 && !selectedRegions.includes('Tutte le regioni') && (
                  <div style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px', display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      1.2 Seleziona Province di Interesse
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedRegions.map((region) => (
                        <div key={region} style={{ 
                          background: '#f1f5f9', 
                          padding: '10px', 
                          borderRadius: '8px',
                          border: '1px solid var(--border-glass)' 
                        }}>
                          <strong style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'block', marginBottom: '6px' }}>
                            📍 Reg. {region}
                          </strong>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {(REGIONS_AND_PROVINCES[region] || []).map((prov) => {
                              const isSelected = selectedProvinces.some(p => p.name === prov && p.region === region);
                              return (
                                <button
                                  type="button"
                                  key={prov}
                                  onClick={() => handleToggleProvince(prov, region)}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.65rem',
                                    borderRadius: '12px',
                                    border: '1px solid ' + (isSelected ? 'var(--accent-green)' : 'var(--border-input)'),
                                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                                    color: isSelected ? 'var(--accent-green)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: isSelected ? 600 : 'normal',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {isSelected ? '✓ ' : ''}{prov}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.3 DISTANZA */}
                {selectedProvinces.length > 0 && !selectedRegions.includes('Tutte le regioni') && (
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px', display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      1.3 Imposta Distanza Massima (Km) per Provincia
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      padding: '8px',
                      background: '#f1f5f9',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)'
                    }}>
                      {selectedProvinces.map((prov) => (
                        <div 
                          key={`${prov.region}-${prov.name}`} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: '#ffffff', 
                            padding: '6px 10px', 
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            📍 {prov.name} ({prov.region})
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="range" 
                              min="5" 
                              max="200" 
                              step="5"
                              value={prov.maxDistance} 
                              onChange={(e) => handleDistanceChange(prov.name, prov.region, Number(e.target.value))}
                              style={{ width: '80px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.7rem', minWidth: '40px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {prov.maxDistance} Km
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. RUOLO CON ELENCO DI TUTTE LE PROFESSIONI */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                  2. Ruolo (Seleziona uno o più ruoli d'interesse)
                </label>
                
                {/* Select dropdown */}
                <div style={{ marginBottom: '8px' }}>
                  <select
                    className="form-control"
                    value=""
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected && !availRoles.includes(selected)) {
                        setAvailRoles([...availRoles, selected]);
                      }
                    }}
                  >
                    <option value="">-- Aggiungi un Ruolo --</option>
                    {PROFESSIONS.map((prof) => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>

                {/* Selected roles list */}
                {availRoles.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    gap: '6px', 
                    flexWrap: 'wrap', 
                    padding: '10px', 
                    background: '#f1f5f9', 
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)'
                  }}>
                    {availRoles.map((role) => (
                      <span 
                        key={role} 
                        style={{ 
                          background: 'rgba(59,130,246,0.1)', 
                          color: 'var(--accent-blue)', 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          fontSize: '0.75rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontWeight: 600
                        }}
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => setAvailRoles(availRoles.filter(r => r !== role))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-red)',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            padding: '0 2px'
                          }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nessun ruolo selezionato. Verrai cercato per la tua professione principale.</p>
                )}
              </div>

              {/* 3. REDDITO DESIDERATO (MIN E MAX) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                  3. Reddito Desiderato (Mensile Netto)
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Minimo (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ padding: '8px' }}
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      disabled={noSalaryPref}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Massimo (€)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ padding: '8px' }}
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      disabled={noSalaryPref}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input 
                    type="checkbox" 
                    checked={noSalaryPref} 
                    onChange={(e) => {
                      setNoSalaryPref(e.target.checked);
                      if (e.target.checked) {
                        setMinSalary('');
                        setMaxSalary('');
                      }
                    }} 
                  />
                  Nessuna preferenza
                </label>
              </div>

              {/* 4. CONTRATTO DESIDERATO */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px', display: 'block', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                  4. Tipologia Contratto Desiderato
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '10px',
                  background: '#f1f5f9', 
                  padding: '12px', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)'
                }}>
                  {['Determinato', 'Indeterminato', 'Part-time', 'Apprendistato', 'Partita iva', 'Nessuna preferenza'].map((c) => {
                    const isChecked = selectedContracts.includes(c);
                    return (
                      <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleToggleContract(c)} 
                          style={{ cursor: 'pointer' }}
                        />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. CAMPO NOTE */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
                  5. Note Aggiuntive per le Aziende
                </label>
                <textarea 
                  className="form-control" 
                  value={availNotes} 
                  onChange={(e) => setAvailNotes(e.target.value)} 
                  autoComplete="off"
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ marginTop: '10px', width: '100%', padding: '14px', fontSize: '0.9rem', fontWeight: 700 }}>
                ✅ Conferma e Attiva Ricezione Proposte
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
