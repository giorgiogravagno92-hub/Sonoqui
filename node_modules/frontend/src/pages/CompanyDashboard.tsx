import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DIPLOMAS, DEGREES, PROFESSIONS, CITIES } from '../utils/constants';

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
        date: interviewDate
      });
      setInterviewSuccess(true);
      if (onNotifyMobile) {
        onNotifyMobile('Richiesta Inviata', `Richiesta di colloquio inviata con successo a ${selectedCandidate.firstName}.`);
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
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'search' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'search' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('search')}
        >
          🔍 Ricerca
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'favorites' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'favorites' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐️ Preferiti ({favorites.length})
        </button>
        <button 
          style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--accent-blue)' : 'none', color: activeTab === 'profile' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
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
                    placeholder="Specifica professione personalizzata" 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value)} 
                  />
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select 
                  className="form-control" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                >
                  <option value="">Qualsiasi Città</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Provincia (es. RM)" 
                  value={province} 
                  onChange={(e) => setProvince(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select className="form-control" value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)}>
                  <option value="">Qualsiasi disponibilità</option>
                  <option value="DISPONIBILE_SUBITO">Disponibile Subito</option>
                  <option value="VALUTO_OFFERTE">Valuto Offerte</option>
                  <option value="NON_DISPONIBILE">Non Disponibile</option>
                </select>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Anni Esp. Minimi" 
                  value={experienceYearsMin} 
                  onChange={(e) => setExperienceYearsMin(e.target.value)} 
                />
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
                placeholder="Competenze (es. React, Domotica)" 
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {cand.city} • Esp: {cand.experienceYears} anni</div>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Profilo Aziendale</h3>
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Nome Azienda</label>
                <input type="text" className="form-control" value={companyProfile.companyName} onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Settore</label>
                <input type="text" className="form-control" value={companyProfile.industry} onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Città Sede</label>
                <input type="text" className="form-control" value={companyProfile.city} onChange={(e) => setCompanyProfile({...companyProfile, city: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Referente</label>
                <input type="text" className="form-control" value={companyProfile.contactPerson} onChange={(e) => setCompanyProfile({...companyProfile, contactPerson: e.target.value})} required />
              </div>
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
              <div><strong>Ragione Sociale:</strong> {companyProfile.companyName}</div>
              <div><strong>Settore:</strong> {companyProfile.industry}</div>
              <div><strong>Sede Operativa:</strong> {companyProfile.city}</div>
              <div><strong>Persona di Riferimento:</strong> {companyProfile.contactPerson}</div>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div className="modal-close" onClick={() => setSelectedCandidate(null)}>&times;</div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <img 
                src={selectedCandidate.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'} 
                alt="avatar" 
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {selectedCandidate.city} ({selectedCandidate.province}), {selectedCandidate.region}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div><strong>Ruolo:</strong> {selectedCandidate.profession} {selectedCandidate.specialization ? `(${selectedCandidate.specialization})` : ''}</div>
              <div><strong>Esperienza:</strong> {selectedCandidate.experienceYears} anni</div>
              <div>
                <strong>Titolo di Studio:</strong> {
                  selectedCandidate.educationLevel === 'NESSUNO' || !selectedCandidate.educationLevel ? 'Nessun Titolo' :
                  selectedCandidate.educationLevel === 'LICENZA_MEDIA' ? 'Licenza Media' :
                  `${selectedCandidate.educationLevel === 'DIPLOMA' ? 'Diploma' : 'Laurea'} - ${selectedCandidate.educationField || ''}`
                }
              </div>
              <div><strong>Stato Disponibilità:</strong> <span style={{ color: selectedCandidate.availabilityStatus === 'DISPONIBILE_SUBITO' ? 'var(--accent-green)' : (selectedCandidate.availabilityStatus === 'VALUTO_OFFERTE' ? 'var(--accent-yellow)' : 'var(--accent-red)'), fontWeight: 700 }}>{selectedCandidate.availabilityStatus.replace('_', ' ')}</span></div>
              {selectedCandidate.availabilityDetails && (
                <div><strong>Orari & Giorni Disponibili:</strong> <span style={{ color: 'var(--accent-green)' }}>{selectedCandidate.availabilityDetails}</span></div>
              )}
              <div><strong>Raggio d'azione max:</strong> {selectedCandidate.maxDistanceKm} Km</div>
              <div><strong>Automunito:</strong> {selectedCandidate.hasCar ? 'Sì' : 'No'} | <strong>Patente B:</strong> {selectedCandidate.hasLicense ? 'Sì' : 'No'}</div>
              <div><strong>Contratto richiesto:</strong> {selectedCandidate.desiredContract.replace('_', ' ')}</div>
              {selectedCandidate.desiredSalary && <div><strong>Retribuzione desiderata:</strong> {selectedCandidate.desiredSalary}</div>}

              <div style={{ marginTop: '8px' }}>
                <strong>Competenze:</strong>
                <div className="tag-list">
                  {selectedCandidate.skills.split(',').map((s: string, idx: number) => (
                    <span key={idx} className="tag">{s.trim()}</span>
                  ))}
                </div>
              </div>

              {selectedCandidate.certifications && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Certificazioni:</strong>
                  <div className="tag-list">
                    {selectedCandidate.certifications.split(',').map((c: string, idx: number) => (
                      <span key={idx} className="tag" style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#d8b4fe' }}>{c.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media Simulation */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ fontSize: '0.8rem' }}>📁 Allegati e Video</h5>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1 }} onClick={() => alert('Download simulato del file PDF strutturato.')}>
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
                📅 Richiedi Colloquio
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedCandidate(null)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Sub-Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-close" onClick={() => setShowInterviewModal(false)}>&times;</div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Pianifica Colloquio</h3>

            {interviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <strong>Richiesta Inviata!</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Il candidato è stato notificato sul suo smartphone.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInterviewRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data e Ora Proposte</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Messaggio di Presentazione</label>
                  <textarea 
                    className="form-control" 
                    value={interviewMessage}
                    onChange={(e) => setInterviewMessage(e.target.value)} 
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
