import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const WordPressPages: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'blog' | 'faq' | 'contacts'>('home');
  const [pageData, setPageData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  // Accordion faq index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    loadPageContent();
  }, [currentPage]);

  const loadPageContent = async () => {
    setPageData(null);
    setSelectedPost(null);
    try {
      if (['home', 'about'].includes(currentPage)) {
        const page = await api.wp.getPage(currentPage);
        setPageData(page);
      } else if (currentPage === 'blog') {
        const p = await api.wp.getPosts();
        setPosts(p);
      } else if (currentPage === 'faq') {
        const f = await api.wp.getFAQs();
        setFaqs(f);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setContactSuccess(false);
    }, 2500);
  };

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#fff', paddingBottom: '60px' }}>
      {/* WordPress Simulated Header Navigation */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid var(--border-glass)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>🌐</span>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>WordPress CMS</strong>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sito Web Collegato via API REST</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              style={{ background: 'none', border: 'none', color: currentPage === 'home' ? 'var(--accent-blue)' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: currentPage === 'about' ? 'var(--accent-blue)' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setCurrentPage('about')}
            >
              Chi Siamo
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: currentPage === 'blog' ? 'var(--accent-blue)' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setCurrentPage('blog')}
            >
              Blog & News
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: currentPage === 'faq' ? 'var(--accent-blue)' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setCurrentPage('faq')}
            >
              FAQ
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: currentPage === 'contacts' ? 'var(--accent-blue)' : '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setCurrentPage('contacts')}
            >
              Contatti
            </button>
          </div>
        </div>
      </div>

      {/* WordPress Content Body */}
      <div className="container" style={{ marginTop: '40px' }}>
        {/* Render Static Page */}
        {['home', 'about'].includes(currentPage) && pageData && (
          <div className="glass-card" style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '20px', fontSize: '2.2rem' }}>{pageData.title}</h1>
            <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {pageData.content}
            </div>
            {currentPage === 'home' && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
                <h3>Inizia subito ad usare il portale!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Clicca sul pulsante in alto a destra per registrare il tuo profilo o cercare candidati.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Render Blog */}
        {currentPage === 'blog' && !selectedPost && (
          <div>
            <h1 style={{ marginBottom: '30px' }}>Blog & News di Settore</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {posts.map((post) => (
                <div key={post.id} className="glass-card wp-post-card">
                  <img src={post.imageUrl} alt={post.title} className="wp-post-img" />
                  <div className="wp-post-body">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      📅 {new Date(post.date).toLocaleDateString()} • Scritto da <strong>{post.author}</strong>
                    </div>
                    <h3 style={{ marginBottom: '10px' }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>{post.excerpt}</p>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setSelectedPost(post)}>
                      Leggi Tutto
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nessun articolo pubblicato.</p>}
            </div>
          </div>
        )}

        {/* Read Blog Post */}
        {currentPage === 'blog' && selectedPost && (
          <div className="glass-card" style={{ padding: '40px' }}>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '20px' }} onClick={() => setSelectedPost(null)}>
              ← Torna al Blog
            </button>
            <img 
              src={selectedPost.imageUrl} 
              alt={selectedPost.title} 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '24px' }}
            />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Pubblicato il {new Date(selectedPost.date).toLocaleDateString()} da {selectedPost.author}
            </div>
            <h1 style={{ marginBottom: '20px' }}>{selectedPost.title}</h1>
            <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {selectedPost.content}
            </div>
          </div>
        )}

        {/* Render FAQ */}
        {currentPage === 'faq' && (
          <div>
            <h1 style={{ marginBottom: '24px' }}>Domande Frequenti (FAQ)</h1>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="faq-item" style={{ background: 'var(--bg-card)' }}>
                  <div 
                    className="faq-question" 
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    style={{ fontSize: '1.05rem', color: openFaqIndex === index ? 'var(--accent-blue)' : '#fff' }}
                  >
                    <span>{faq.question}</span>
                    <span>{openFaqIndex === index ? '▲' : '▼'}</span>
                  </div>
                  {openFaqIndex === index && (
                    <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render Contact */}
        {currentPage === 'contacts' && (
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
            <h2 style={{ marginBottom: '16px' }}>Invia un Messaggio</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Contattaci per informazioni commerciali o di supporto. Ti risponderemo entro 24 ore.
            </p>

            {contactSuccess ? (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                ✔️ Messaggio inviato con successo!
              </div>
            ) : (
              <form onSubmit={handleSendContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nome e Cognome</label>
                  <input type="text" className="form-control" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email di Contatto</label>
                  <input type="email" className="form-control" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Messaggio</label>
                  <textarea className="form-control" value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} rows={5} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                  Invia Messaggio
                </button>
              </form>
            )}
          </div>
        )}

        {/* SEO Panel - Demonstrates SEO requirements */}
        <div className="glass-card" style={{ marginTop: '50px', background: 'rgba(9, 13, 22, 0.9)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h4 style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔍 Pannello SEO WordPress (API-driven)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Meta Title:</div>
              <code style={{ color: '#d8b4fe' }}>{pageData?.seoTitle || `Blog & FAQ | Sono Qui`}</code>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Meta Description:</div>
              <code style={{ color: '#93c5fd' }}>{pageData?.seoDescription || `Leggi le guide e risposte sul portale di lavoro Sono Qui.`}</code>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Generato da:</div>
              <span style={{ color: '#10b981' }}>⚡️ Headless CMS REST API client</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
