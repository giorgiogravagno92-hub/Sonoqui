import React from 'react';

interface HomeProps {
  onNavigate: (page: string, role?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
      {/* Hero Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 60px auto' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
          📍 Il Lavoro che Cerca Te, <br />
          <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            All'Istante.
          </span>
        </div>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          "Sono Qui" rivoluziona il recruiting. Non cercare più tra mille annunci di lavoro. 
          Crea il tuo profilo, imposta la tua disponibilità e lascia che siano le aziende a trovarti.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-primary" 
              style={{ padding: '16px 36px', fontSize: '1.1rem' }}
              onClick={() => onNavigate('login', 'WORKER')}
            >
              👨‍💼 Cerco Lavoro (Candidati)
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accedi o Registrati</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '16px 36px', fontSize: '1.1rem' }}
              onClick={() => onNavigate('login', 'COMPANY')}
            >
              🏢 Cerco Personale (Aziende)
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accedi o Registrati</span>
          </div>
        </div>
      </div>

      {/* WordPress Content Teaser */}
      <div className="glass-card" style={{ marginTop: '80px', padding: '40px', background: 'var(--grad-dark)' }}>
        <h2 style={{ marginBottom: '16px' }}>Hai bisogno di consigli per il tuo CV?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Leggi le ultime guide scritte dai nostri esperti direttamente sul nostro blog integrato gestito con WordPress.
        </p>
        <button 
          className="btn btn-secondary"
          onClick={() => onNavigate('wordpress')}
        >
          📖 Leggi il Blog & FAQ
        </button>
      </div>
    </div>
  );
};
