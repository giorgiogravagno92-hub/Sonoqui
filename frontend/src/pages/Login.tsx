import React, { useState } from 'react';
import { api } from '../utils/api';

interface LoginProps {
  initialRole: string; // 'WORKER' or 'COMPANY'
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ initialRole, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyType, setCompanyType] = useState<'AZIENDA' | 'PERSONA_FISICA'>('AZIENDA');
  const [address, setAddress] = useState('');
  const [vatNumber, setVatNumber] = useState('IT');
  const [residenzaCapCitta, setResidenzaCapCitta] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVatChange = (val: string) => {
    let digits = val.replace(/[^0-9]/g, '');
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }
    setVatNumber('IT' + digits);
  };

  const handleFiscalCodeChange = (val: string) => {
    let clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length > 16) {
      clean = clean.slice(0, 16);
    }
    setFiscalCode(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Traditional login
        const res = await api.auth.login({ email, password });
        onLoginSuccess(res.user, res.token);
      } else {
        // Registration
        let profileData: any = {};
        if (role === 'COMPANY') {
          profileData.companyType = companyType;
          if (companyType === 'AZIENDA') {
            profileData.companyName = companyName;
            profileData.address = address;
            profileData.vatNumber = vatNumber;
          } else {
            profileData.firstName = firstName;
            profileData.lastName = lastName;
            profileData.residenzaCapCitta = residenzaCapCitta;
            profileData.fiscalCode = fiscalCode;
          }
        } else {
          profileData.firstName = firstName;
          profileData.lastName = lastName;
        }
        
        const res = await api.auth.register({ email, password, role, profileData });
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'autenticazione');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      const simulatedEmail = `${provider}.demo-${Math.floor(Math.random() * 1000)}@sonoqui.it`;
      const name = role === 'COMPANY' ? 'Azienda Social S.r.l.' : 'Giacomo Social';
      
      const res = await api.auth.socialLogin({
        email: simulatedEmail,
        name,
        provider,
        role
      });
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Errore social login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
          {isLogin ? 'Accedi a Sono Qui' : 'Registrati come ' + (role === 'COMPANY' ? 'Recruiter' : 'Lavoratore')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Inserisci le tue credenziali o effettua l'accesso social rapido.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && role === 'WORKER' && (
            <div className="form-control-row" style={{ marginBottom: '20px' }}>
              <div>
                <label className="form-label">Nome</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Cognome</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          {!isLogin && role === 'COMPANY' && (
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Tipo di Profilo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: companyType === 'AZIENDA' ? 'var(--accent-blue)' : 'transparent',
                    color: companyType === 'AZIENDA' ? '#fff' : 'var(--text-muted)',
                    border: '1px solid ' + (companyType === 'AZIENDA' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'),
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCompanyType('AZIENDA')}
                >
                  🏢 Azienda
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: companyType === 'PERSONA_FISICA' ? 'var(--accent-blue)' : 'transparent',
                    color: companyType === 'PERSONA_FISICA' ? '#fff' : 'var(--text-muted)',
                    border: '1px solid ' + (companyType === 'PERSONA_FISICA' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'),
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCompanyType('PERSONA_FISICA')}
                >
                  👤 Persona Fisica
                </button>
              </div>

              {/* Conditional Fields */}
              {companyType === 'AZIENDA' ? (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nome Azienda</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Indirizzo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="es. Via Roma 12"
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Partita IVA</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={vatNumber} 
                      onChange={(e) => handleVatChange(e.target.value)} 
                      placeholder="IT + 11 numeri"
                      pattern="IT[0-9]{11}"
                      maxLength={13}
                      minLength={13}
                      title="Partita IVA deve iniziare con 'IT' seguito da esattamente 11 cifre numeriche"
                      required 
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nome</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Cognome</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Residenza (CAP e Città)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={residenzaCapCitta} 
                      onChange={(e) => setResidenzaCapCitta(e.target.value)} 
                      placeholder="es. 00100 Roma"
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Codice Fiscale</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={fiscalCode} 
                      onChange={(e) => handleFiscalCodeChange(e.target.value)} 
                      placeholder="16 caratteri alfanumerici"
                      pattern="[A-Z0-9]{16}"
                      maxLength={16}
                      minLength={16}
                      title="Codice Fiscale deve essere di esattamente 16 caratteri alfanumerici"
                      required 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Indirizzo Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="es. nome@email.it"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Elaborazione in corso...' : (isLogin ? 'Accedi' : 'Completa Registrazione')}
          </button>
        </form>

        {/* Social Authentication */}
        <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
          <hr style={{ border: '0', borderTop: '1px solid var(--border-glass)' }} />
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-secondary)', padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            OPPURE ACCEDI CON
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '10px' }}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            🌐 Google
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '10px' }}
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
          >
            🍎 Apple ID
          </button>
        </div>

        {/* Toggle Account Type / Auth Mode */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <div style={{ marginBottom: '8px' }}>
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'} {' '}
            <span 
              style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Registrati ora' : 'Accedi'}
            </span>
          </div>
          <div>
            Ruolo desiderato: {' '}
            <span 
              style={{ color: 'var(--accent-purple)', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => setRole(role === 'WORKER' ? 'COMPANY' : 'WORKER')}
            >
              {role === 'WORKER' ? 'Cambia in Chi Cerca Personale' : 'Cambia in Lavoratore'}
            </span>
          </div>
        </div>

        {/* Demo Accounts Notice */}
        <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          💡 <strong>Account di test rapidi:</strong><br />
          • Candidato: <code>mario.rossi@email.it</code> / <code>password123</code><br />
          • Azienda: <code>azienda@innovate.it</code> / <code>password123</code><br />
          • Admin: <code>admin@sonoqui.it</code> / <code>password123</code>
        </div>
      </div>
    </div>
  );
};
