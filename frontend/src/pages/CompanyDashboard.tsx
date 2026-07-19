import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DIPLOMAS, DEGREES, PROFESSIONS, CITIES, ORGANIZATIONAL_SKILLS_LIST, COMMUNICATIVE_SKILLS_LIST } from '../utils/constants';

interface CompanyDashboardProps {
  onNotifyMobile?: (title: string, message: string) => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ onNotifyMobile }) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'profile'>('search');
  
  // Filter states
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [experienceYearsMin, setExperienceYearsMin] = useState('');
  const [skills, setSkills] = useState('');
  const [hasLicense, setHasLicense] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [desiredContract, setDesiredContract] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [educationField, setEducationField] = useState('');
  const [customProfActive, setCustomProfActive] = useState(false);

  // Interview states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewMessage, setInterviewMessage] = useState('Ciao, vorremmo concordare un colloquio conoscitivo per la posizione aperta.');
  const [interviewDate, setInterviewDate] = useState('2026-07-15T10:00');
  const [interviewSuccess, setInterviewSuccess] = useState(false);

  // Company Profile states
  const [companyProfile, setCompanyProfile] = useState<any>({
    companyName: 'Innovate Tech S.p.A.',
    industry: 'Tecnologia & Software',
    city: 'Milano',
    contactPerson: 'Ing. Alessandro Bianchi',
    contactPhone: '+39 02 1234567',
    logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=60'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    handleSearch();
    fetchFavorites();
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const prof = await api.company.getProfile();
      setCompanyProfile(prof);
    } catch (err) {
      console.log('Error fetching company profile, using default mock');
    }
  };

  const handleSearch = async () => {
    try {
      const params: any = {};
      if (profession) params.profession = profession;
      if (city) params.city = city;
      if (province) params.province = province;
      if (region) params.region = region;
      if (availabilityStatus) params.availabilityStatus = availabilityStatus;
      if (experienceYearsMin) params.experienceYearsMin = experienceYearsMin;
      if (skills) params.skills = skills;
      if (hasLicense) params.hasLicense = 'true';
      if (hasCar) params.hasCar = 'true';
      if (desiredContract) params.desiredContract = desiredContract;
      if (educationLevel) params.educationLevel = educationLevel;
      if (educationField) params.educationField = educationField;

      const results = await api.company.search(params);
      setCandidates(results);
    } catch (err) {
      console.error('Error searching candidates:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await api.company.getFavorites();
      setFavorites(favs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewCandidate = async (candidate: any) => {
    try {
      // Trigger profile view push notification on candidate's device
      const detailedWorker = await api.company.getWorkerDetails(candidate.id);
      setSelectedCandidate(detailedWorker);
      
      if (onNotifyMobile) {
        onNotifyMobile('Notifica Inviata', `Notificato ${detailedWorker.firstName} che hai visualizzato il suo profilo.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (workerId: string) => {
    try {
      await api.company.toggleFavorite(workerId);
      await fetchFavorites();
      if (onNotifyMobile) {
        onNotifyMobile('Preferiti Aggiornati', 'Stato preferito aggiornato con successo.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInterviewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.company.requestInterview({
        workerId: selectedCandidate.id,
        message: interviewMessage,
        date: ""
      });
      setInterviewSuccess(true);
      if (onNotifyMobile) {
        onNotifyMobile('Proposta Inviata', `Proposta iniziale inviata con successo a ${selectedCandidate.firstName}.`);
      }
      setTimeout(() => {
        setShowInterviewModal(false);
        setInterviewSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.company.updateProfile(companyProfile);
      setCompanyProfile(updated);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DISPONIBILE_PROPOSTE': return { text: 'Disponibile a ricevere proposte', class: 'status-available-badge' };
      case 'DISPONIBILE_SUBITO': return { text: 'Subito Disponibile', class: 'status-available-badge' };
      case 'VALUTO_OFFERTE': return { text: 'Valuto Offerte', class: 'status-valuto-badge' };
      case 'NON_DISPONIBILE': return { text: 'Non Disponibile', class: 'status-unavailable-badge' };
      default: return { text: 'Sconosciuto', class: '' };
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '20px', paddingBottom: '8px' }}>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'search' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('search')}
        >
          🔍 Ricerca
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'favorites' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'favorites' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐️ Preferiti ({favorites.length})
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'profile' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('profile')}
        >
          🏢 Profilo
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          {/* Filters Accordion / Panel */}
          <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>🔧 Filtri di Ricerca Avanzata</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <select 
                  className="form-control" 
                  value={customProfActive ? 'Altra professione' : profession}
                  onChange={(e) => {
                    if (e.target.value === 'Altra professione') {
                      setCustomProfActive(true);
                      setProfession('');
                    } else {
                      setCustomProfActive(false);
                      setProfession(e.target.value);
                    }
                  }}
                >
                  <option value="">Qualsiasi professione</option>
                  {PROFESSIONS.map((prof) => (
                    <option key={prof} value={prof}>{prof}</option>
                  ))}
                  <option value="Altra professione">Altra professione</option>
                </select>

                {customProfActive && (
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ marginTop: '10px' }}
                    autoComplete="off" 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value)} 
                  />
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select 
                  className="form-control" 
                  value={province} 
                  onChange={(e) => setProvince(e.target.value)} 
                >
                  <option value="">Qualsiasi Provincia</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  autoComplete="off" 
                  value={city} 
                  onChange={(e) => {
                    const cap = e.target.value
                      .toLowerCase()
                      .split(' ')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    setCity(cap);
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <select className="form-control" value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                  <option value="">Qualsiasi disponibilità</option>
                  <option value="DISPONIBILE_PROPOSTE">Disponibile a ricevere proposte</option>
                  <option value="NON_DISPONIBILE">Non Disponibile</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select 
                  className="form-control" 
                  value={educationLevel} 
                  onChange={(e) => {
                    setEducationLevel(e.target.value);
                    setEducationField('');
                  }}
                >
                  <option value="">Qualsiasi titolo</option>
                  <option value="NESSUNO">Nessun titolo</option>
                  <option value="LICENZA_MEDIA">Licenza media</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="LAUREA">Laurea</option>
                </select>

                {educationLevel === 'DIPLOMA' && (
                  <select 
                    className="form-control" 
                    value={educationField} 
                    onChange={(e) => setEducationField(e.target.value)}
                  >
                    <option value="">Tutti i diplomi</option>
                    {DIPLOMAS.map((dip) => (
                      <option key={dip} value={dip}>{dip}</option>
                    ))}
                    <option value="Altro Diploma">Altro Diploma</option>
                  </select>
                )}

                {educationLevel === 'LAUREA' && (
                  <select 
                    className="form-control" 
                    value={educationField} 
                    onChange={(e) => setEducationField(e.target.value)}
                  >
                    <option value="">Tutte le lauree</option>
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                )}
              </div>

              <input 
                type="text" 
                className="form-control" 
                autoComplete="off" 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)} 
              />

              <div style={{ display: 'flex', gap: '16px', margin: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasLicense} onChange={(e) => setHasLicense(e.target.checked)} />
                  Patente
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} />
                  Automunito
                </label>
              </div>

              <button className="btn btn-primary" style={{ padding: '10px' }} onClick={handleSearch}>
                🔍 Applica Filtri ({candidates.length} Risultati)
              </button>
            </div>
          </div>

          {/* Candidate Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidates.map((cand) => {
              const status = getStatusLabel(cand.availabilityStatus);
              const isFav = favorites.some((f) => f.id === cand.id);

              return (
                <div key={cand.id} className="glass-card" style={{ padding: '16px', position: 'relative' }}>
                  {/* Status Badge */}
                  <span className={`candidate-badge-status ${status.class}`} style={{ top: '12px', right: '12px', fontSize: '0.65rem' }}>
                    {status.text}
                  </span>

                  {/* Header info */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <img 
                      src={cand.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                      alt="avatar" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{cand.firstName} {cand.lastName.charAt(0)}.</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {cand.city}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Professione:</strong> {cand.profession}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Studio:</strong> {
                      cand.educationLevel === 'NESSUNO' || !cand.educationLevel ? 'Nessun Titolo' :
                      cand.educationLevel === 'LICENZA_MEDIA' ? 'Licenza Media' :
                      `${cand.educationLevel === 'DIPLOMA' ? 'Diploma' : 'Laurea'} (${cand.educationField || ''})`
                    }
                  </div>
                  {cand.availabilityDetails && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginTop: '4px' }}>
                      <strong>Orari & Giorni:</strong> {cand.availabilityDetails}
                    </div>
                  )}

                  {/* Skill tags */}
                  <div className="tag-list" style={{ marginTop: '8px' }}>
                    {cand.skills.split(',').slice(0, 3).map((s: string, idx: number) => (
                      <span key={idx} className="tag">{s.trim()}</span>
                    ))}
                    {cand.skills.split(',').length > 3 && <span className="tag">+{cand.skills.split(',').length - 3}</span>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleViewCandidate(cand)}>
                      📄 Dettagli
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: isFav ? 'var(--accent-yellow)' : 'inherit' }}
                      onClick={() => handleToggleFavorite(cand.id)}
                    >
                      ★
                    </button>
                  </div>
                </div>
              );
            })}

            {candidates.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nessun candidato corrisponde ai filtri impostati.</p>
            )}
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {favorites.map((cand) => {
            const status = getStatusLabel(cand.availabilityStatus);
            return (
              <div key={cand.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>{cand.firstName} {cand.lastName}</strong>
                  <span className={`candidate-badge-status ${status.class}`} style={{ position: 'static', fontSize: '0.65rem' }}>
                    {status.text}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {cand.city} | {cand.profession}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleViewCandidate(cand)}>
                    Apri Profilo
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleToggleFavorite(cand.id)}>
                    Rimuovi
                  </button>
                </div>
              </div>
            );
          })}
          {favorites.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Nessun candidato salvato nei preferiti.</p>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
            {companyProfile.companyType === 'PERSONA_FISICA' ? 'Profilo Recruiter (Persona Fisica)' : 'Profilo Aziendale'}
          </h3>
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {companyProfile.companyType === 'PERSONA_FISICA' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Nome</label>
                    <input type="text" className="form-control" value={companyProfile.firstName || ''} onChange={(e) => setCompanyProfile({...companyProfile, firstName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cognome</label>
                    <input type="text" className="form-control" value={companyProfile.lastName || ''} onChange={(e) => setCompanyProfile({...companyProfile, lastName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Residenza (CAP e Città)</label>
                    <input type="text" className="form-control" value={companyProfile.residenzaCapCitta || ''} onChange={(e) => setCompanyProfile({...companyProfile, residenzaCapCitta: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Codice Fiscale</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={companyProfile.fiscalCode || ''} 
                      onChange={(e) => {
                        let clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        if (clean.length > 16) clean = clean.slice(0, 16);
                        setCompanyProfile({...companyProfile, fiscalCode: clean});
                      }} 
                      pattern="[A-Z0-9]{16}"
                      maxLength={16} 
                      minLength={16}
                      title="Codice Fiscale deve essere di esattamente 16 caratteri alfanumerici"
                      required 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Nome Azienda</label>
                    <input type="text" className="form-control" value={companyProfile.companyName || ''} onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Indirizzo</label>
                    <input type="text" className="form-control" value={companyProfile.address || ''} onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Partita IVA</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={companyProfile.vatNumber || ''} 
                      onChange={(e) => {
                        let digits = e.target.value.replace(/[^0-9]/g, '');
                        if (digits.length > 11) digits = digits.slice(0, 11);
                        setCompanyProfile({...companyProfile, vatNumber: 'IT' + digits});
                      }} 
                      pattern="IT[0-9]{11}"
                      maxLength={13}
                      minLength={13}
                      title="Partita IVA deve iniziare con 'IT' seguito da esattamente 11 cifre numeriche"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Settore</label>
                    <input type="text" className="form-control" value={companyProfile.industry || ''} onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Città Sede</label>
                    <input type="text" className="form-control" value={companyProfile.city || ''} onChange={(e) => setCompanyProfile({...companyProfile, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Referente</label>
                    <input type="text" className="form-control" value={companyProfile.contactPerson || ''} onChange={(e) => setCompanyProfile({...companyProfile, contactPerson: e.target.value})} required />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Telefono di Contatto</label>
                <input type="text" className="form-control" value={companyProfile.contactPhone || ''} onChange={(e) => setCompanyProfile({...companyProfile, contactPhone: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Salva</button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditingProfile(false)}>Annulla</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              {companyProfile.companyType === 'PERSONA_FISICA' ? (
                <>
                  <div><strong>Nome:</strong> {companyProfile.firstName}</div>
                  <div><strong>Cognome:</strong> {companyProfile.lastName}</div>
                  <div><strong>Residenza (CAP e Città):</strong> {companyProfile.residenzaCapCitta}</div>
                  <div><strong>Codice Fiscale:</strong> {companyProfile.fiscalCode}</div>
                </>
              ) : (
                <>
                  <div><strong>Ragione Sociale:</strong> {companyProfile.companyName}</div>
                  {companyProfile.address && <div><strong>Indirizzo:</strong> {companyProfile.address}</div>}
                  {companyProfile.vatNumber && <div><strong>Partita IVA:</strong> {companyProfile.vatNumber}</div>}
                  <div><strong>Settore:</strong> {companyProfile.industry}</div>
                  <div><strong>Sede Operativa:</strong> {companyProfile.city}</div>
                  <div><strong>Persona di Riferimento:</strong> {companyProfile.contactPerson}</div>
                </>
              )}
              {companyProfile.contactPhone && <div><strong>Telefono:</strong> {companyProfile.contactPhone}</div>}
              
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setIsEditingProfile(true)}>
                ✏️ Modifica Profilo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Candidate Profile Details Drawer / Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-close" onClick={() => setSelectedCandidate(null)}>&times;</div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <img 
                src={selectedCandidate.photoUrl ? (api.isOffline() ? selectedCandidate.photoUrl : `http://localhost:5000${selectedCandidate.photoUrl}`) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                alt="avatar" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {selectedCandidate.city} ({selectedCandidate.province}), {selectedCandidate.region}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div><strong>Ruolo:</strong> {selectedCandidate.profession}</div>
              <div>
                <strong>Titolo/i di Studio:</strong>
                {(() => {
                  let edus = [];
                  try {
                    edus = JSON.parse(selectedCandidate.educationTitles || '[]');
                  } catch (e) {}
                  if (edus.length === 0) {
                    // Fallback for legacy
                    if (!selectedCandidate.educationLevel || selectedCandidate.educationLevel === 'NESSUNO') {
                      return <span style={{ marginLeft: '6px' }}>Nessun Titolo</span>;
                    }
                    const label = selectedCandidate.educationLevel === 'LICENZA_MEDIA' ? 'Licenza Media' : 
                                  selectedCandidate.educationLevel === 'DIPLOMA' ? 'Diploma' : 'Laurea';
                    return <span style={{ marginLeft: '6px' }}>{label} {selectedCandidate.educationField ? `- ${selectedCandidate.educationField}` : ''}</span>;
                  }
                  return (
                    <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                      {edus.map((edu: any, i: number) => {
                        const label = edu.level === 'LICENZA_MEDIA' ? 'Licenza Media' : 
                                      edu.level === 'DIPLOMA' ? 'Diploma' : 
                                      edu.level === 'LAUREA' ? 'Laurea' : 
                                      edu.level === 'MASTER' ? 'Master' : edu.level;
                        
                        let details = '';
                        if (edu.level === 'DIPLOMA') {
                          const dateStr = edu.inData ? ` (Conseguito in data: ${edu.inData})` : '';
                          const gradeStr = edu.votazione ? `, Votazione: ${edu.votazione}` : '';
                          details = `${edu.field || ''}${dateStr}${gradeStr}`;
                        } else if (edu.level === 'LAUREA') {
                          const uniStr = edu.conseguitoPresso ? ` presso ${edu.conseguitoPresso}` : '';
                          const dateStr = edu.inData ? ` in data: ${edu.inData}` : '';
                          const gradeStr = edu.votazione ? `, Votazione: ${edu.votazione}` : '';
                          details = `${edu.field || ''}${uniStr}${dateStr}${gradeStr}`;
                        } else if (edu.level === 'MASTER') {
                          const uniStr = edu.conseguitoPresso ? ` presso ${edu.conseguitoPresso}` : '';
                          const dateStr = edu.inData ? ` in data: ${edu.inData}` : '';
                          details = `${edu.field || 'Master'}${uniStr}${dateStr}`;
                        } else {
                          details = edu.field || '';
                        }
                        
                        return (
                          <li key={i}>
                            <strong>{label}</strong>{details ? `: ${details}` : ''}
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </div>
              <div>
                <strong>Stato Disponibilità:</strong>{' '}
                <span style={{ 
                  color: selectedCandidate.availabilityStatus === 'DISPONIBILE_PROPOSTE' || selectedCandidate.availabilityStatus === 'DISPONIBILE_SUBITO' ? 'var(--accent-green)' : 
                         (selectedCandidate.availabilityStatus === 'VALUTO_OFFERTE' ? 'var(--accent-yellow)' : 'var(--accent-red)'), 
                  fontWeight: 700 
                }}>
                  {selectedCandidate.availabilityStatus === 'DISPONIBILE_PROPOSTE' ? 'Disponibile a ricevere proposte' : 
                   selectedCandidate.availabilityStatus === 'NON_DISPONIBILE' ? 'Non disponibile' : 
                   selectedCandidate.availabilityStatus.replace('_', ' ')}
                </span>
              </div>

              {selectedCandidate.availabilityStatus !== 'NON_DISPONIBILE' && (
                <>
                  <div>
                    <strong>Regioni e Province di Disponibilità:</strong>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {(() => {
                        let regions = [];
                        try {
                          regions = JSON.parse(selectedCandidate.availabilityRegionsProvinces || '[]');
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
                    <strong>Contratti graditi:</strong>{' '}
                    {(() => {
                      let contracts = [];
                      try {
                        contracts = JSON.parse(selectedCandidate.availabilityContracts || '[]');
                      } catch(e) {}
                      if (contracts.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Nessuna preferenza</span>;
                      return contracts.join(', ');
                    })()}
                  </div>
                </>
              )}

              {selectedCandidate.notes && (
                <div>
                  <strong>Note / Presentazione del Candidato:</strong>{' '}
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{selectedCandidate.notes}"</span>
                </div>
              )}

              {selectedCandidate.availabilityNotes && (
                <div>
                  <strong>Note Aggiuntive per le Aziende (Disponibilità):</strong>{' '}
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{selectedCandidate.availabilityNotes}"</span>
                </div>
              )}

              <div><strong>Automunito:</strong> {selectedCandidate.hasCar ? 'Sì' : 'No'} | <strong>Patente B:</strong> {selectedCandidate.hasLicense ? 'Sì' : 'No'}</div>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  let parsed: any = { computerSkills: {}, organizationalSkills: {} };
                  try {
                    parsed = JSON.parse(selectedCandidate.skills || '{}');
                  } catch (e) {
                    const skillsArr = (selectedCandidate.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
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

                  const sortSkillsByLevel = (keys: string[], skillsMap: Record<string, string>) => {
                    const levelOrder: Record<string, number> = {
                      'Avanzato': 1,
                      'Intermedio': 2,
                      'Base': 3
                    };
                    return [...keys].sort((a, b) => {
                      const lvlA = skillsMap[a] || '';
                      const lvlB = skillsMap[b] || '';
                      const oA = levelOrder[lvlA] || 99;
                      const oB = levelOrder[lvlB] || 99;
                      if (oA !== oB) return oA - oB;
                      return a.localeCompare(b);
                    });
                  };

                  const compSkills = (parsed.computerSkills || {}) as any;
                  const orgSkills = (parsed.organizationalSkills || {}) as any;
                  const langSkills = (parsed.languageSkills || {}) as any;
                  const commSkills = (parsed.communicativeSkills || {}) as any;

                  const compKeys = sortSkillsByLevel(Object.keys(compSkills), compSkills);
                  const orgKeys = sortSkillsByLevel(Object.keys(orgSkills), orgSkills);
                  const langKeys = sortSkillsByLevel(Object.keys(langSkills).filter(k => langSkills[k] && langSkills[k] !== 'Nessuna'), langSkills);
                  const commKeys = sortSkillsByLevel(Object.keys(commSkills).filter(k => commSkills[k] && commSkills[k] !== 'Nessuna'), commSkills);

                  return (
                    <>
                      {compKeys.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Competenze Informatiche:</strong>
                          <div className="tag-list" style={{ marginTop: '6px' }}>
                            {compKeys.map(skill => (
                              <span key={skill} className="tag" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--border-glass)', color: '#000000', fontWeight: 'bold', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px' }}>
                                {skill} <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>({compSkills[skill]})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {langKeys.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Competenze Linguistiche:</strong>
                          <div className="tag-list" style={{ marginTop: '6px', marginBottom: '6px' }}>
                            {langKeys.map(skill => (
                              <span key={skill} className="tag" style={{ background: 'rgba(0,0,0,0.03)', borderColor: 'var(--border-glass)', color: '#000000', fontWeight: 'bold', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '6px' }}>
                                {skill} <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>({langSkills[skill]})</span>
                              </span>
                            ))}
                          </div>
                          
                          {/* Legenda livelli nelle competenze linguistiche del CV */}
                          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            <strong style={{ color: '#fff', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Legenda Livelli Lingue:</strong>
                            <ul style={{ paddingLeft: '12px', margin: 0, listStyleType: 'disc' }}>
                              <li><strong>Nessuna:</strong> Non si possiedono conoscenze della lingua.</li>
                              <li><strong>Base:</strong> Si comprendono e si usano parole ed espressioni semplici; si riesce a comunicare in situazioni quotidiane essenziali.</li>
                              <li><strong>Intermedio:</strong> Si comprende il significato generale di conversazioni e testi; si comunica con una buona autonomia su argomenti comuni.</li>
                              <li><strong>Avanzato:</strong> Si utilizza la lingua con scioltezza e precisione, sia nel parlato che nello scritto, anche in contesti complessi o professionali.</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      {orgKeys.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Competenze Organizzative:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {orgKeys.map(skill => {
                              const desc = ORGANIZATIONAL_SKILLS_LIST.find(s => s.name === skill)?.description || '';
                              return (
                                <div key={skill} style={{ fontSize: '0.8rem', padding: '8px 10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#000000', fontWeight: 'bold', lineHeight: '1.4' }}>
                                  {skill} – {desc} <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>({orgSkills[skill]})</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {commKeys.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Competenze Comunicative e Relazionali:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {commKeys.map(skill => {
                              const desc = COMMUNICATIVE_SKILLS_LIST.find(s => s.name === skill)?.description || '';
                              return (
                                <div key={skill} style={{ fontSize: '0.8rem', padding: '8px 10px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#000000', fontWeight: 'bold', lineHeight: '1.4' }}>
                                  {skill} – {desc} <span style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}>({commSkills[skill]})</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {selectedCandidate.certifications && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Certificazioni:</strong>
                  <div className="tag-list">
                    {selectedCandidate.certifications.split(',').map((c: string, idx: number) => (
                      <span key={idx} className="tag" style={{ borderColor: 'rgba(139,92,246,0.3)', color: 'var(--accent-purple)' }}>{c.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sezione Esperienze Lavorative nel Dettaglio Candidato */}
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block', marginBottom: '8px' }}>
                  Esperienze lavorative:
                </strong>
                {selectedCandidate.workExperiences && selectedCandidate.workExperiences.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedCandidate.workExperiences.map((exp: any, idx: number) => {
                      const calculateDuration = (startStr: string, endStr: string) => {
                        if (!startStr) return '';
                        const start = new Date(startStr);
                        const end = (!endStr || endStr === 'Presente') ? new Date() : new Date(endStr);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
                        let years = end.getFullYear() - start.getFullYear();
                        let months = end.getMonth() - start.getMonth();
                        if (end.getDate() < start.getDate()) {
                          months -= 1;
                        }
                        if (months < 0) {
                          years -= 1;
                          months += 12;
                        }
                        if (years === 0 && months === 0) {
                          return '1 mese';
                        }
                        const parts = [];
                        if (years > 0) parts.push(years === 1 ? '1 anno' : `${years} anni`);
                        if (months > 0) parts.push(months === 1 ? '1 mese' : `${months} mesi`);
                        return parts.join(' e ');
                      };

                      const formatDateItalian = (dateStr: string) => {
                        if (!dateStr) return '';
                        if (dateStr === 'Presente') return 'Presente';
                        const parts = dateStr.split('-');
                        if (parts.length === 3) {
                          return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        }
                        return dateStr;
                      };

                      const duration = calculateDuration(exp.startDate, exp.endDate);

                      return (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>
                              {exp.roles && exp.roles.length > 0 ? exp.roles.join(', ') : exp.role}
                            </strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                              📅 Dal {formatDateItalian(exp.startDate)} al {formatDateItalian(exp.endDate || 'Presente')} {duration && `(${duration})`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: 'bold', marginTop: '2px' }}>
                            🏢 {exp.companyName || 'Azienda non specificata'} {exp.city ? `• ${exp.city}` : ''} {exp.province ? `(${exp.sigla ? exp.sigla : exp.province})` : ''}
                          </div>
                          {exp.description && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                              {exp.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nessuna esperienza inserita nel CV.</p>
                )}
              </div>
            </div>

            {/* Media Simulation */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ fontSize: '0.8rem' }}>📁 Allegati e Video</h5>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1 }} 
                  disabled={!selectedCandidate.cvPdfUrl}
                  onClick={() => {
                    if (selectedCandidate.cvPdfUrl) {
                      const backendUrl = api.isOffline() ? '' : 'http://localhost:5000';
                      window.open(backendUrl + selectedCandidate.cvPdfUrl, '_blank');
                    }
                  }}
                >
                  📄 {selectedCandidate.cvPdfUrl ? 'Apri CV PDF' : 'Nessun PDF allegato'}
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1 }} onClick={() => alert('Apertura player video presentatore.')}>
                  🎥 {selectedCandidate.videoPresentationUrl ? 'Guarda Video' : 'Nessun Video'}
                </button>
              </div>
            </div>

            {/* Request Interview CTA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowInterviewModal(true)}>
                ✉️ Invia Proposta
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedCandidate(null)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Proposal Sub-Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-close" onClick={() => setShowInterviewModal(false)}>&times;</div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Invia Proposta Iniziale</h3>

            {interviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <strong>Proposta Inviata!</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Il candidato riceverà una notifica sul suo smartphone per valutare l'offerta.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInterviewRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Messaggio di Presentazione / Dettagli Proposta</label>
                  <textarea 
                    className="form-control" 
                    value={interviewMessage}
                    onChange={(e) => setInterviewMessage(e.target.value)} 
                    autoComplete="off"
                    rows={4}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Invia Proposta
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
