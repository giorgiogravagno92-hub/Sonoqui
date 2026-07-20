import React, { useState } from 'react';
import { api } from '../utils/api';
import { CITIES, PROVINCE_SIGLE, COMPANY_SECTORS } from '../utils/constants';

interface LoginProps {
  initialRole: string; // 'WORKER' or 'COMPANY'
  onLoginSuccess: (user: any, token: string) => void;
}

const formatCapitalizedWords = (str: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
};

export const Login: React.FC<LoginProps> = ({ initialRole, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [sigla, setSigla] = useState('');
  const [sector, setSector] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



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
          profileData.companyName = companyName;
          profileData.address = address;
          profileData.city = city;
          profileData.province = province;
          profileData.sigla = sigla;
          profileData.sector = sector;
          profileData.industry = sector;
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
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome azienda</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Indirizzo sede operativa</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={address} 
                  onChange={(e) => setAddress(formatCapitalizedWords(e.target.value))} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Città</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={city} 
                    onChange={(e) => setCity(formatCapitalizedWords(e.target.value))} 
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Provincia</label>
                  <select 
                    className="form-control" 
                    value={province} 
                    onChange={(e) => {
                      const p = e.target.value;
                      setProvince(p);
                      setSigla(PROVINCE_SIGLE[p] || '');
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
                    value={sigla} 
                    readOnly 
                    disabled
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Settore operativo</label>
                <select 
                  className="form-control" 
                  value={sector} 
                  onChange={(e) => setSector(e.target.value)}
                  required
                >
                  <option value="">-- Seleziona Settore Operativo --</option>
                  {COMPANY_SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
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
