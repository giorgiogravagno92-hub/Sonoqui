import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'users' | 'companies' | 'wp' | 'broadcast'>('stats');
  
  // WordPress editing states
  const [wpPages, setWpPages] = useState<any>({});
  const [wpPosts, setWpPosts] = useState<any[]>([]);
  const [wpFaqs, setWpFaqs] = useState<any[]>([]);
  const [selectedPageKey, setSelectedPageKey] = useState('home');
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageSeoTitle, setPageSeoTitle] = useState('');
  const [pageSeoDesc, setPageSeoDesc] = useState('');
  
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Broadcast states
  const [bcTitle, setBcTitle] = useState('Aggiornamento Termini di Servizio');
  const [bcMessage, setBcMessage] = useState('Abbiamo aggiornato la nostra Cookie Policy in conformità alle nuove linee guida.');
  const [bcTarget, setBcTarget] = useState('ALL');
  const [bcSuccess, setBcSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchWPData();
  }, []);

  const fetchStats = async () => {
    try {
      const s = await api.admin.getStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const u = await api.admin.getUsers();
      setUsers(u);
      const c = await api.admin.getCompanies();
      setCompanies(c);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWPData = async () => {
    try {
      const homePage = await api.wp.getPage('home');
      const aboutPage = await api.wp.getPage('about');
      const privacyPage = await api.wp.getPage('privacy');
      setWpPages({ home: homePage, about: aboutPage, privacy: privacyPage });
      
      // Init page fields
      setPageTitle(homePage.title);
      setPageContent(homePage.content);
      setPageSeoTitle(homePage.seoTitle);
      setPageSeoDesc(homePage.seoDescription);

      const posts = await api.wp.getPosts();
      setWpPosts(posts);

      const faqs = await api.wp.getFAQs();
      setWpFaqs(faqs);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageSelect = (key: string) => {
    setSelectedPageKey(key);
    const pg = wpPages[key];
    if (pg) {
      setPageTitle(pg.title);
      setPageContent(pg.content);
      setPageSeoTitle(pg.seoTitle || '');
      setPageSeoDesc(pg.seoDescription || '');
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.wp.updatePage(selectedPageKey, {
        title: pageTitle,
        content: pageContent,
        seoTitle: pageSeoTitle,
        seoDescription: pageSeoDesc
      });
      alert('Contenuto WordPress (simulato) salvato con successo!');
      fetchWPData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.wp.createPost({
        title: newPostTitle,
        content: newPostContent,
        imageUrl: newPostImage
      });
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage('');
      fetchWPData();
      alert('Nuovo post di blog creato su WordPress!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await api.wp.deletePost(id);
      fetchWPData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.wp.createFAQ({
        question: newFaqQ,
        answer: newFaqA,
        category: 'Generale'
      });
      setNewFaqQ('');
      setNewFaqA('');
      fetchWPData();
      alert('Nuova FAQ aggiunta su WordPress!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFAQ = async (id: number) => {
    try {
      await api.wp.deleteFAQ(id);
      fetchWPData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.sendNotification({
        title: bcTitle,
        message: bcMessage,
        targetRole: bcTarget
      });
      setBcSuccess(true);
      setTimeout(() => setBcSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo utente? Tutti i suoi dati di profilo saranno rimossi.')) {
      try {
        await api.admin.deleteUser(id);
        fetchUsers();
        fetchStats();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h2 style={{ marginBottom: '24px', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        ⚙️ Pannello Amministrazione
      </h2>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '30px', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeSubTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('stats')}
        >
          📊 Statistiche
        </button>
        <button 
          className={`btn ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('users')}
        >
          👨‍💼 Gestione Lavoratori
        </button>
        <button 
          className={`btn ${activeSubTab === 'companies' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('companies')}
        >
          🏢 Gestione Aziende
        </button>
        <button 
          className={`btn ${activeSubTab === 'wp' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('wp')}
        >
          📝 CMS WordPress
        </button>
        <button 
          className={`btn ${activeSubTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('broadcast')}
        >
          🔔 Invio Notifiche
        </button>
      </div>

      {/* Stats Tab */}
      {activeSubTab === 'stats' && stats && (
        <div>
          <div className="admin-stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-val">{stats.totals.workers}</div>
              <div className="stat-label">Candidati Totali</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-val">{stats.totals.companies}</div>
              <div className="stat-label">Aziende Totali</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-val">{stats.totals.interviews}</div>
              <div className="stat-label">Colloqui Richiesti</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-val">{stats.totals.favorites}</div>
              <div className="stat-label">Preferiti Salvati</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Distribuzione Disponibilità</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex-between">
                  <span>🟢 Disponibile Subito:</span>
                  <strong>{stats.availabilityDistribution.DISPONIBILE_SUBITO || 0}</strong>
                </div>
                <div className="flex-between">
                  <span>🟡 Valuto Offerte:</span>
                  <strong>{stats.availabilityDistribution.VALUTO_OFFERTE || 0}</strong>
                </div>
                <div className="flex-between">
                  <span>🔴 Non Disponibile:</span>
                  <strong>{stats.availabilityDistribution.NON_DISPONIBILE || 0}</strong>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Stato Colloqui</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex-between">
                  <span>🔵 In Attesa:</span>
                  <strong>{stats.interviewStatusDistribution.PENDING || 0}</strong>
                </div>
                <div className="flex-between">
                  <span>🟢 Accettati:</span>
                  <strong>{stats.interviewStatusDistribution.ACCEPTED || 0}</strong>
                </div>
                <div className="flex-between">
                  <span>🔴 Rifiutati:</span>
                  <strong>{stats.interviewStatusDistribution.DECLINED || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workers Management Tab */}
      {activeSubTab === 'users' && (
        <div className="glass-card">
          <h3>Candidati Registrati</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Professione</th>
                <th>Città</th>
                <th>Disponibilità</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((worker) => (
                <tr key={worker.id}>
                  <td>{worker.firstName} {worker.lastName}</td>
                  <td>{worker.profession}</td>
                  <td>{worker.city}</td>
                  <td>{worker.availabilityStatus.replace('_', ' ')}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(worker.userId)}>
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Companies Management Tab */}
      {activeSubTab === 'companies' && (
        <div className="glass-card">
          <h3>Aziende Registrate</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Azienda</th>
                <th>Settore</th>
                <th>Sede</th>
                <th>Referente</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.companyName}</td>
                  <td>{company.industry}</td>
                  <td>{company.city}</td>
                  <td>{company.contactPerson}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(company.userId)}>
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CMS WordPress Simulator Tab */}
      {activeSubTab === 'wp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Edit static pages */}
          <div className="glass-card">
            <h3>Pagine Statiche WordPress</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Modifica i contenuti che appaiono nelle sezioni informative, FAQ o Privacy del sito senza toccare il codice.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button className={`btn ${selectedPageKey === 'home' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePageSelect('home')}>Home Page Text</button>
              <button className={`btn ${selectedPageKey === 'about' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePageSelect('about')}>Chi Siamo</button>
              <button className={`btn ${selectedPageKey === 'privacy' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handlePageSelect('privacy')}>Privacy Policy</button>
            </div>

            <form onSubmit={handleUpdatePage} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Titolo Pagina</label>
                <input type="text" className="form-control" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contenuto HTML / Testo</label>
                <textarea className="form-control" value={pageContent} onChange={(e) => setPageContent(e.target.value)} rows={6} required />
              </div>
              <div className="form-control-row">
                <div className="form-group">
                  <label className="form-label">Meta Titolo SEO</label>
                  <input type="text" className="form-control" value={pageSeoTitle} onChange={(e) => setPageSeoTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Descrizione SEO</label>
                  <input type="text" className="form-control" value={pageSeoDesc} onChange={(e) => setPageSeoDesc(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                Salva Modifiche su WordPress
              </button>
            </form>
          </div>

          {/* Edit Blog posts */}
          <div className="glass-card">
            <h3>Gestione Blog (Articoli)</h3>
            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <h5>Scrivi un nuovo articolo:</h5>
              <div className="form-group">
                <label className="form-label">Titolo Articolo</label>
                <input type="text" className="form-control" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contenuto</label>
                <textarea className="form-control" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} rows={4} required />
              </div>
              <div className="form-group">
                <label className="form-label">URL Immagine di Copertina (opzionale)</label>
                <input type="text" className="form-control" value={newPostImage} onChange={(e) => setNewPostImage(e.target.value)} placeholder="https://..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Pubblica Articolo</button>
            </form>

            <h5>Articoli Pubblicati:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {wpPosts.map((post) => (
                <div key={post.id} className="flex-between" style={{ padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                  <span>{post.title}</span>
                  <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeletePost(post.id)}>Elimina</button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ edit */}
          <div className="glass-card">
            <h3>Gestione FAQ</h3>
            <form onSubmit={handleCreateFAQ} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <h5>Aggiungi una domanda frequente:</h5>
              <div className="form-group">
                <label className="form-label">Domanda</label>
                <input type="text" className="form-control" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Risposta</label>
                <textarea className="form-control" value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} rows={3} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Aggiungi FAQ</button>
            </form>

            <h5>FAQ Attive:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {wpFaqs.map((faq) => (
                <div key={faq.id} className="flex-between" style={{ padding: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                  <span><strong>Q:</strong> {faq.question}</span>
                  <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteFAQ(faq.id)}>Elimina</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast System Notification Tab */}
      {activeSubTab === 'broadcast' && (
        <div className="glass-card">
          <h3>Invia Messaggio / Notifica Push Globale</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Invia una notifica di sistema o email automatica a tutti gli utenti o solo a categorie specifiche.
          </p>

          {bcSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              ✔️ Notifica push broadcast inviata con successo nel database dei destinatari!
            </div>
          )}

          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Destinatari</label>
              <select className="form-control" value={bcTarget} onChange={(e) => setBcTarget(e.target.value)}>
                <option value="ALL">Tutti gli Utenti Registrati</option>
                <option value="WORKER">Solo Lavoratori (Candidati)</option>
                <option value="COMPANY">Solo Aziende</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Titolo Notifica</label>
              <input type="text" className="form-control" value={bcTitle} onChange={(e) => setBcTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Contenuto Messaggio</label>
              <textarea className="form-control" value={bcMessage} onChange={(e) => setBcMessage(e.target.value)} rows={4} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: '10px' }}>
              📡 Invia Notifica Push
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
