import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PROFESSIONS, CITIES, PROVINCE_SIGLE } from '../utils/constants';

interface CompanyDashboardProps {
  onNotifyMobile?: (title: string, message: string) => void;
}

const capitalizeCity = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatCapitalizedWords = (str: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');
};

const formatNumberThousands = (val: string) => {
  if (!val) return '';
  const cleanDigits = val.replace(/\D/g, '');
  if (!cleanDigits) return '';
  return Number(cleanDigits).toLocaleString('it-IT');
};

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ onNotifyMobile }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'create_proposal' | 'list_proposals'>('create_proposal');

  // Company Profile states
  const [companyProfile, setCompanyProfile] = useState<any>({
    companyName: 'Innovate Tech S.p.A.',
    companyType: 'AZIENDA',
    vatNumber: 'IT12345678901',
    address: 'Via Roma 100',
    city: 'Milano',
    residenzaCapCitta: '20100 Milano (MI)',
    fiscalCode: '12345678901',
    industry: 'Tecnologia & Software',
    contactPerson: 'Ing. Alessandro Bianchi',
    contactPhone: '+39 02 1234567',
    logoUrl: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<any>({});

  // Proposal Creation / Edit states
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  
  // Location 1
  const [loc1Address, setLoc1Address] = useState('');
  const [loc1City, setLoc1City] = useState('');
  const [loc1Province, setLoc1Province] = useState('');
  const [loc1Sigla, setLoc1Sigla] = useState('');

  // Location 2 (optional)
  const [hasLoc2, setHasLoc2] = useState(false);
  const [loc2Address, setLoc2Address] = useState('');
  const [loc2City, setLoc2City] = useState('');
  const [loc2Province, setLoc2Province] = useState('');
  const [loc2Sigla, setLoc2Sigla] = useState('');

  // Education title
  const [educationTitle, setEducationTitle] = useState('Nessuna preferenza');

  // License & Car
  const [hasLicense, setHasLicense] = useState(false);
  const [hasCar, setHasCar] = useState(false);

  // Salary Range (formatted with thousands)
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // Saved Proposals
  const [proposals, setProposals] = useState<any[]>([]);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  // Selected Proposal Accepted Candidates Drawer / Modal
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
    fetchProposals();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const prof = await api.company.getProfile();
      if (prof) {
        setCompanyProfile(prof);
        setProfileFormData(prof);
        if (!editingProposalId) {
          setLoc1Address(prof.address || '');
          setLoc1City(prof.city || '');
          setLoc1Province(prof.province || '');
          setLoc1Sigla(prof.sigla || (prof.province ? (PROVINCE_SIGLE[prof.province] || '') : ''));
        }
      }
    } catch (err) {
      console.log('Error fetching company profile, using default mock');
      setProfileFormData(companyProfile);
      setLoc1Address(companyProfile.address || '');
      setLoc1City(companyProfile.city || '');
      setLoc1Province(companyProfile.province || '');
      setLoc1Sigla(companyProfile.sigla || '');
    }
  };

  const fetchProposals = async () => {
    try {
      const list = await api.company.getProposals();
      if (Array.isArray(list)) {
        setProposals(list);
      }
    } catch (err) {
      console.log('Error fetching proposals');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.company.updateProfile(profileFormData);
      setCompanyProfile(updated || profileFormData);
      setIsEditingProfile(false);
      alert('Profilo aziendale aggiornato con successo!');
    } catch (err) {
      console.error(err);
      setCompanyProfile(profileFormData);
      setIsEditingProfile(false);
    }
  };

  const handleAddProfession = (prof: string) => {
    if (prof && !selectedProfessions.includes(prof)) {
      setSelectedProfessions([...selectedProfessions, prof]);
    }
  };

  const handleRemoveProfession = (prof: string) => {
    setSelectedProfessions(selectedProfessions.filter(p => p !== prof));
  };

  const resetProposalForm = (prof = companyProfile) => {
    setEditingProposalId(null);
    setSelectedProfessions([]);
    setLoc1Address(prof?.address || '');
    setLoc1City(prof?.city || '');
    setLoc1Province(prof?.province || '');
    setLoc1Sigla(prof?.sigla || (prof?.province ? (PROVINCE_SIGLE[prof.province] || '') : ''));
    setHasLoc2(false);
    setLoc2Address('');
    setLoc2City('');
    setLoc2Province('');
    setLoc2Sigla('');
    setEducationTitle('Nessuna preferenza');
    setHasLicense(false);
    setHasCar(false);
    setMinSalary('');
    setMaxSalary('');
    setNotes('');
  };

  const handleEditProposal = (prop: any) => {
    setEditingProposalId(prop.id);

    let parsedProfs: string[] = [];
    try { parsedProfs = JSON.parse(prop.professions || '[]'); } catch (e) {}
    setSelectedProfessions(parsedProfs);

    let parsedLocs: any[] = [];
    try { parsedLocs = JSON.parse(prop.locations || '[]'); } catch (e) {}
    if (parsedLocs.length > 0) {
      setLoc1Address(parsedLocs[0].address || '');
      setLoc1City(parsedLocs[0].city || '');
      setLoc1Province(parsedLocs[0].province || '');
      setLoc1Sigla(parsedLocs[0].sigla || '');
    }
    if (parsedLocs.length > 1) {
      setHasLoc2(true);
      setLoc2Address(parsedLocs[1].address || '');
      setLoc2City(parsedLocs[1].city || '');
      setLoc2Province(parsedLocs[1].province || '');
      setLoc2Sigla(parsedLocs[1].sigla || '');
    } else {
      setHasLoc2(false);
      setLoc2Address('');
      setLoc2City('');
      setLoc2Province('');
      setLoc2Sigla('');
    }

    setEducationTitle(prop.educationTitle || 'Nessuna preferenza');
    setHasLicense(Boolean(prop.hasLicense));
    setHasCar(Boolean(prop.hasCar));
    setMinSalary(prop.minSalary || '');
    setMaxSalary(prop.maxSalary || '');
    setNotes(prop.notes || '');

    setActiveTab('create_proposal');
  };

  const handleDeleteProposal = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa proposta di lavoro?')) {
      try {
        await api.company.deleteProposal(id);
        setProposals(proposals.filter(p => p.id !== id));
        if (selectedProposal && selectedProposal.id === id) {
          setSelectedProposal(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent, targetStatus: 'DRAFT' | 'ACTIVE') => {
    e.preventDefault();

    if (selectedProfessions.length === 0) {
      alert('Seleziona almeno una professione ricercata.');
      return;
    }

    if (!loc1Province) {
      alert('Seleziona la provincia della sede principale.');
      return;
    }

    const locationsArr = [
      { address: loc1Address, city: loc1City, province: loc1Province, sigla: loc1Sigla }
    ];

    if (hasLoc2 && loc2Province) {
      locationsArr.push({ address: loc2Address, city: loc2City, province: loc2Province, sigla: loc2Sigla });
    }

    const payload = {
      professions: JSON.stringify(selectedProfessions),
      locations: JSON.stringify(locationsArr),
      educationTitle,
      hasLicense,
      hasCar,
      minSalary,
      maxSalary,
      notes,
      status: targetStatus
    };

    try {
      let savedProp: any = null;
      if (editingProposalId) {
        savedProp = await api.company.updateProposal(editingProposalId, payload);
        setProposals(proposals.map(p => p.id === editingProposalId ? savedProp : p));
      } else {
        savedProp = await api.company.createProposal(payload);
        if (savedProp) {
          setProposals([savedProp, ...proposals]);
        }
      }

      if (targetStatus === 'ACTIVE') {
        setSubmissionSuccessMsg('La sua richiesta è stata elaborata con successo. Riceverà le informazioni dei candidati che accetteranno la richiesta di ulteriori informazioni.');
        if (onNotifyMobile) {
          onNotifyMobile('Proposta Inviata 📩', 'Richiesta elaborata con successo. Inviata ai candidati attivi.');
        }
      } else {
        setSubmissionSuccessMsg('Proposta salvata in bozza con successo.');
      }

      resetProposalForm();
      setActiveTab('list_proposals');
      setTimeout(() => setSubmissionSuccessMsg(null), 10000);
    } catch (err) {
      console.error(err);
      alert('Si è verificato un errore nel salvataggio della proposta.');
    }
  };

  const handlePublishDraft = async (prop: any) => {
    try {
      const updated = await api.company.updateProposal(prop.id, { status: 'ACTIVE' });
      setProposals(proposals.map(p => p.id === prop.id ? updated : p));
      setSubmissionSuccessMsg('La sua richiesta è stata elaborata con successo. Riceverà le informazioni dei candidati che accetteranno la richiesta di ulteriori informazioni.');
      setTimeout(() => setSubmissionSuccessMsg(null), 10000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', minHeight: '80vh' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            🏢
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            {companyProfile.companyName || 'Area Azienda'}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
            {companyProfile.industry || 'Profilo Verificato'}
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* 1. Profilo Azienda */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'profile' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'profile' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <span>👤</span> Profilo Azienda
          </button>

          {/* 2. Section Header: Proposta di lavoro */}
          <div style={{ marginTop: '16px', marginBottom: '4px', paddingLeft: '8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            💼 Proposta di Lavoro
          </div>

          {/* Sub-item: Inserisci */}
          <button
            onClick={() => {
              resetProposalForm();
              setActiveTab('create_proposal');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px 10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'create_proposal' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'create_proposal' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'create_proposal' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <span>➕</span> Inserisci
          </button>

          {/* Sub-item: Elenco proposte */}
          <button
            onClick={() => {
              fetchProposals();
              setActiveTab('list_proposals');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px 10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'list_proposals' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'list_proposals' ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'list_proposals' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📋</span> Elenco Proposte
            </div>
            {proposals.length > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                {proposals.length}
              </span>
            )}
          </button>

        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main>
        {submissionSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
          }}>
            <span style={{ fontSize: '1.3rem' }}>📩</span>
            <div>{submissionSuccessMsg}</div>
          </div>
        )}

        {/* TAB 1: PROFILO AZIENDA */}
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                🏢 Dati Attività Aziendale
              </h3>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  ✏️ Modifica Dati
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Tipologia Soggetto</label>
                    <select
                      className="form-control"
                      value={profileFormData.companyType || 'AZIENDA'}
                      onChange={(e) => setProfileFormData({ ...profileFormData, companyType: e.target.value })}
                    >
                      <option value="AZIENDA">Azienda / Società</option>
                      <option value="PERSONA_FISICA">Persona Fisica / Ditta Individuale</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nome Azienda / Ragione Sociale</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.companyName || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Partita IVA</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.vatNumber || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, vatNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Codice Fiscale</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.fiscalCode || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, fiscalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Indirizzo Sede Legale</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.address || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Città Sede</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.city || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, city: capitalizeCity(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CAP / Provincia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.residenzaCapCitta || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, residenzaCapCitta: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Settore Operativo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.industry || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, industry: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Referente Aziendale</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.contactPerson || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefono di Contatto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileFormData.contactPhone || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-success" style={{ flex: 1, padding: '10px' }}>
                    💾 Salva Modifiche Profilo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileFormData(companyProfile);
                      setIsEditingProfile(false);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '10px 20px' }}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ragione Sociale / Ditta</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{companyProfile.companyName || 'Non specificata'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Partita IVA / Codice Fiscale</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {companyProfile.vatNumber || companyProfile.fiscalCode || 'Non inserito'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Sede Legale</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    🏢 {companyProfile.address ? `${companyProfile.address}, ` : ''}{companyProfile.city || ''} {companyProfile.residenzaCapCitta ? `(${companyProfile.residenzaCapCitta})` : ''}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Settore Operativo</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{companyProfile.industry || 'Settore Generico'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Persona Referente</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>👤 {companyProfile.contactPerson || 'Referente non indicato'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Telefono di Contatto</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📞 {companyProfile.contactPhone || 'Telefono non indicato'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSERISCI PROPOSTA DI LAVORO */}
        {activeTab === 'create_proposal' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--accent-blue)' }}>
              {editingProposalId ? '✏️ Modifica Proposta di Lavoro' : '➕ Inserisci Nuova Proposta di Lavoro'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Compila i requisiti del personale ricercato. Puoi salvarla in bozza o inviarla direttamente ai candidati attivi.
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Professione Ricercata (Multi-select) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem' }}>
                  Professione Ricercata *
                </label>
                <div style={{ marginBottom: '8px' }}>
                  <select
                    className="form-control"
                    value=""
                    onChange={(e) => handleAddProfession(e.target.value)}
                  >
                    <option value="">-- Seleziona una professione da aggiungere --</option>
                    {PROFESSIONS.map((prof) => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>

                {selectedProfessions.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '10px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {selectedProfessions.map((prof) => (
                      <span
                        key={prof}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--accent-blue)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {prof}
                        <button
                          type="button"
                          onClick={() => handleRemoveProfession(prof)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Seleziona almeno una professione dal menu a tendina.</p>
                )}
              </div>

              {/* 2. Sede di Lavoro (Indirizzo, Città, Provincia, Sigla + Opzione Seconda Sede) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem' }}>
                  Sede di Lavoro Principale *
                </label>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Indirizzo sede operativa (compilabile manualmente)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={loc1Address}
                    onChange={(e) => setLoc1Address(formatCapitalizedWords(e.target.value))}
                    placeholder="es. Via Roma 12"
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Città</label>
                    <input
                      type="text"
                      className="form-control"
                      value={loc1City}
                      onChange={(e) => setLoc1City(formatCapitalizedWords(e.target.value))}
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Provincia</label>
                    <select
                      className="form-control"
                      value={loc1Province}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setLoc1Province(selected);
                        if (selected === 'Tutto il territorio nazionale') {
                          setLoc1Sigla('IT');
                        } else {
                          setLoc1Sigla(PROVINCE_SIGLE[selected] || '');
                        }
                      }}
                      required
                    >
                      <option value="">-- Seleziona Provincia --</option>
                      <option value="Tutto il territorio nazionale">🇮🇹 Tutto il territorio nazionale</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Sigla</label>
                    <input
                      type="text"
                      className="form-control"
                      value={loc1Sigla}
                      onChange={(e) => setLoc1Sigla(e.target.value.toUpperCase())}
                      maxLength={2}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Seconda Sede Toggle */}
                {!hasLoc2 ? (
                  <button
                    type="button"
                    onClick={() => setHasLoc2(true)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', marginTop: '4px' }}
                  >
                    + Aggiungi Seconda Sede
                  </button>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-blue)', margin: 0 }}>
                        Seconda Sede di Lavoro
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setHasLoc2(false);
                          setLoc2Address('');
                          setLoc2City('');
                          setLoc2Province('');
                          setLoc2Sigla('');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Rimuovi seconda sede
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Indirizzo sede operativa</label>
                      <input
                        type="text"
                        className="form-control"
                        value={loc2Address}
                        onChange={(e) => setLoc2Address(formatCapitalizedWords(e.target.value))}
                        placeholder="es. Corso Italia 45"
                        autoComplete="off"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Città</label>
                        <input
                          type="text"
                          className="form-control"
                          value={loc2City}
                          onChange={(e) => setLoc2City(formatCapitalizedWords(e.target.value))}
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Provincia</label>
                        <select
                          className="form-control"
                          value={loc2Province}
                          onChange={(e) => {
                            const selected = e.target.value;
                            setLoc2Province(selected);
                            if (selected === 'Tutto il territorio nazionale') {
                              setLoc2Sigla('IT');
                            } else {
                              setLoc2Sigla(PROVINCE_SIGLE[selected] || '');
                            }
                          }}
                        >
                          <option value="">-- Seleziona Provincia --</option>
                          <option value="Tutto il territorio nazionale">🇮🇹 Tutto il territorio nazionale</option>
                          {CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Sigla</label>
                        <input
                          type="text"
                          className="form-control"
                          value={loc2Sigla}
                          onChange={(e) => setLoc2Sigla(e.target.value.toUpperCase())}
                          maxLength={2}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Titolo di Studio */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem' }}>
                  Titolo di Studio Richiesto
                </label>
                <select
                  className="form-control"
                  value={educationTitle}
                  onChange={(e) => setEducationTitle(e.target.value)}
                >
                  <option value="Nessuna preferenza">Nessuna preferenza (Tutti i titoli)</option>
                  <option value="Licenza Media">Licenza Media</option>
                  <option value="Diploma">Diploma di Scuola Superiore</option>
                  <option value="Laurea">Laurea (Triennale / Magistrale)</option>
                </select>
              </div>

              {/* 4. Flags Patente & Automunito */}
              <div style={{ display: 'flex', gap: '20px', background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={hasLicense}
                    onChange={(e) => setHasLicense(e.target.checked)}
                  />
                  🚗 Patente di Guida
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={hasCar}
                    onChange={(e) => setHasCar(e.target.checked)}
                  />
                  🚘 Automunito
                </label>
              </div>

              {/* 5. Reddito (Min e Max espresso con separatore di migliaia) */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem' }}>
                  Reddito Mensile Netto Offerto (€)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Minimo (€)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={minSalary}
                      onChange={(e) => setMinSalary(formatNumberThousands(e.target.value))}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Massimo (€)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(formatNumberThousands(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 6. Campo Note */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '0.9rem' }}>
                  Campo Note / Dettagli Posizione
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons: Salva in bozza & Salva e invia */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={(e) => handleSubmitProposal(e, 'DRAFT')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  💾 Salva in Bozza
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmitProposal(e, 'ACTIVE')}
                  className="btn btn-success"
                  style={{ flex: 1.5, padding: '14px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  🚀 Salva e Invia Proposta
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: ELENCO PROPOSTE DI LAVORO */}
        {activeTab === 'list_proposals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  📋 Elenco Proposte di Lavoro
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Visualizza le proposte salvate in bozza o inviate, e consulta i candidati che accettano il contatto diretto.
                </p>
              </div>
              <button
                onClick={() => {
                  resetProposalForm();
                  setActiveTab('create_proposal');
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>➕</span> Inserisci Nuova Proposta
              </button>
            </div>

            {proposals.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📄</div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Nessuna proposta inserita</h4>
                <p style={{ fontSize: '0.85rem' }}>Clicca su "Inserisci Nuova Proposta" per creare o inviare la tua prima proposta di lavoro.</p>
              </div>
            ) : (
              proposals.map((prop) => {
                let profsList: string[] = [];
                try { profsList = JSON.parse(prop.professions || '[]'); } catch (e) {}

                let locsList: any[] = [];
                try { locsList = JSON.parse(prop.locations || '[]'); } catch (e) {}

                const acceptedResponses = (prop.responses || []).filter((r: any) => r.status === 'ACCEPTED');

                return (
                  <div key={prop.id} className="glass-card" style={{ padding: '20px', borderLeft: prop.status === 'ACTIVE' ? '4px solid var(--accent-green)' : '4px solid #eab308', position: 'relative' }}>
                    
                    {/* Header bar of proposal card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          {profsList.map((p) => (
                            <span key={p} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {p}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          📅 Inserita il: {new Date(prop.createdAt).toLocaleDateString('it-IT')} alle {new Date(prop.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {prop.status === 'DRAFT' ? (
                          <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                            🟡 Bozza (Non inviata)
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                            🟢 Attiva - Inviata ai Candidati
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proposal Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Sede di Lavoro</span>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          {locsList.map(l => `${l.address ? `${l.address}, ` : ''}${l.city || ''} (${l.sigla || l.province})`).join(' | ')}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Titolo di Studio</span>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{prop.educationTitle || 'Nessuna preferenza'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Requisiti</span>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          {[prop.hasLicense && '🚗 Patente', prop.hasCar && '🚘 Automunito'].filter(Boolean).join(' • ') || 'Nessun vincolo'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Reddito Offerto</span>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          {prop.minSalary || prop.maxSalary ? `€ ${prop.minSalary || '0'} - € ${prop.maxSalary || 'Max'}` : 'Non specificato'}
                        </strong>
                      </div>
                    </div>

                    {prop.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '8px', borderRadius: '6px' }}>
                        📝 Note: {prop.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px', flexWrap: 'wrap' }}>
                      {prop.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handlePublishDraft(prop)}
                          className="btn btn-success"
                          style={{ fontSize: '0.75rem', padding: '6px 12px', fontWeight: 700 }}
                        >
                          🚀 Invia ai Candidati
                        </button>
                      )}

                      {prop.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setSelectedProposal(prop)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                        >
                          👥 Candidati che hanno accettato ({acceptedResponses.length})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditProposal(prop)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        ✏️ Modifica
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProposal(prop.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--accent-red)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        🗑️ Elimina
                      </button>
                    </div>

                  </div>
                );
              })
            )}

          </div>
        )}
      </main>

      {/* ACCEPTED CANDIDATES MODAL */}
      {selectedProposal && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '850px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div className="modal-close" onClick={() => setSelectedProposal(null)}>&times;</div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--accent-blue)' }}>
              👥 Candidati che Hanno Accettato il Contatto Diretto
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Di seguito sono riportate le schede ed i curriculum completi dei candidati che hanno accettato la proposta di lavoro.
            </p>

            {(() => {
              const acceptedResponses = (selectedProposal.responses || []).filter((r: any) => r.status === 'ACCEPTED');

              if (acceptedResponses.length === 0) {
                return (
                  <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>In attesa di riscontro dai candidati</div>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>
                      Non appena un candidato idoneo accetta la richiesta di ulteriori informazioni, la sua scheda ed il CV completo compariranno automaticamente in questa sezione.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {acceptedResponses.map((res: any) => {
                    const worker = res.worker;
                    if (!worker) return null;

                    return (
                      <div key={res.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                              ✅ Contatto Diretto Accettato
                            </span>
                            <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                              {worker.firstName} {worker.lastName}
                            </h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                              💼 {worker.profession}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              📍 Residence: {worker.city} ({worker.sigla || worker.province})
                            </div>
                          </div>

                          {/* Contact Info & CV PDF Link */}
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              📧 Email: {worker.user?.email || 'N/D'}
                            </div>
                            {worker.cvPdfUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  const backendUrl = api.isOffline() ? '' : 'http://localhost:5000';
                                  window.open(backendUrl + worker.cvPdfUrl, '_blank');
                                }}
                                className="btn btn-primary"
                                style={{ marginTop: '8px', fontSize: '0.75rem', padding: '6px 12px' }}
                              >
                                📎 Scarica / Visualizza CV PDF
                              </button>
                            )}
                          </div>
                        </div>

                        {worker.notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: '#f1f5f9', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
                            💬 Note Candidato: "{worker.notes}"
                          </div>
                        )}

                        {/* Full Experiences List */}
                        {(worker.workExperiences || []).length > 0 && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                              🏢 Esperienze Lavorative Precedenti:
                            </strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {(worker.workExperiences || []).map((exp: any, i: number) => (
                                <div key={i} style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                  <strong>{exp.role}</strong> presso <em>{exp.companyName || 'Azienda non specificata'}</em> ({exp.city ? `${exp.city}, ` : ''}{exp.sigla || exp.province})
                                  <span style={{ color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                    📅 {exp.startDate} - {exp.endDate || 'Presente'}
                                  </span>
                                  {exp.description && (
                                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>
                                      {exp.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
