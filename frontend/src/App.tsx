import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WordPressPages } from './pages/WordPressPages';
import { MobileSimulator } from './components/MobileSimulator';
import { api } from './utils/api';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'web' | 'app'>('web');
  const [loginRole, setLoginRole] = useState<string>('WORKER');

  // Mobile simulator states
  const [mobileTab, setMobileTab] = useState<string>('profile');
  const [mobileNotification, setMobileNotification] = useState<{ title: string; message: string } | null>(null);

  // Poll for background simulated notifications if logged in as Worker
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'WORKER') return;

    const interval = setInterval(async () => {
      try {
        const notifs = await api.worker.getNotifications();
        const unread = notifs.filter((n: any) => !n.read);
        if (unread.length > 0) {
          // Trigger push banner
          setMobileNotification({
            title: unread[0].title,
            message: unread[0].message
          });
          // Mark read so it doesn't notify again
          await api.worker.markNotificationRead(unread[0].id);
        }
      } catch (err) {
        // Suppress logs
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    // Check local token on mount
    const savedToken = localStorage.getItem('sono_qui_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe();
    }
  }, []);

  const fetchMe = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      if (user.role === 'ADMIN') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('dashboard');
        setMobileTab(user.role === 'WORKER' ? 'profile' : 'search');
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLoginSuccess = (user: any, userToken: string) => {
    localStorage.setItem('sono_qui_token', userToken);
    setToken(userToken);
    setCurrentUser(user);
    
    if (user.role === 'ADMIN') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
      setMobileTab(user.role === 'WORKER' ? 'profile' : 'search');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sono_qui_token');
    setToken(null);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const triggerMobileNotification = (title: string, message: string) => {
    setMobileNotification({ title, message });
  };

  const handleNavigate = (page: string, role?: string) => {
    setCurrentPage(page);
    if (role) {
      setLoginRole(role);
    }
  };

  // Decide what dashboard content to show inside the layout
  const renderDashboardContent = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'WORKER') {
      // In mobile mode, we override tabs by state. In web mode, we show everything together
      return <WorkerDashboard onNotifyMobile={triggerMobileNotification} />;
    }
    if (currentUser.role === 'COMPANY') {
      return <CompanyDashboard onNotifyMobile={triggerMobileNotification} />;
    }
    return null;
  };

  return (
    <div className="app-container">
      {/* Global Header Navbar */}
      <header className="header">
        <div className="container header-wrap">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('home')}>
            📍 Sono Qui
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Mode Switcher */}
            {currentPage === 'dashboard' && (
              <div className="flex-gap-12" style={{ marginRight: '12px' }}>
                <button 
                  className={`btn ${layoutMode === 'web' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setLayoutMode('web')}
                >
                  🖥️ Portale Web
                </button>
                <button 
                  className={`btn ${layoutMode === 'app' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setLayoutMode('app')}
                >
                  📱 App Preview
                </button>
              </div>
            )}

            <ul className="nav-menu">
              <li className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => handleNavigate('home')}>Home</li>
              <li className={`nav-link ${currentPage === 'wordpress' ? 'active' : ''}`} onClick={() => handleNavigate('wordpress')}>Sito WordPress</li>
              {currentUser && currentUser.role === 'ADMIN' && (
                <li className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} onClick={() => handleNavigate('admin')}>Admin</li>
              )}
              {currentUser && currentUser.role !== 'ADMIN' && (
                <li className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavigate('dashboard')}>Dashboard</li>
              )}
            </ul>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentUser.email}</span>
                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleLogout}>Esci</button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleNavigate('login', 'WORKER')}>Accedi</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Render Area */}
      <main className="main-content">
        {/* Render Home */}
        {currentPage === 'home' && <Home onNavigate={handleNavigate} />}

        {/* Render Login */}
        {currentPage === 'login' && <Login initialRole={loginRole} onLoginSuccess={handleLoginSuccess} />}

        {/* Render WordPress simulated website */}
        {currentPage === 'wordpress' && <WordPressPages />}

        {/* Render Admin dashboard */}
        {currentPage === 'admin' && currentUser?.role === 'ADMIN' && <AdminDashboard />}

        {/* Render Candidate / Company dashboards */}
        {currentPage === 'dashboard' && currentUser && (
          layoutMode === 'app' ? (
            <MobileSimulator 
              activeTab={mobileTab} 
              onTabChange={setMobileTab} 
              userRole={currentUser.role}
              notification={mobileNotification}
              onCloseNotification={() => setMobileNotification(null)}
            >
              {renderDashboardContent()}
            </MobileSimulator>
          ) : (
            <div className="container" style={{ padding: '40px 24px' }}>
              <div className="flex-between mb-24">
                <div>
                  <h2 style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {currentUser.role === 'WORKER' ? 'Area Candidato' : 'Area Ricerca Personale'}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestisci e visualizza i tuoi dati in modalità portale web responsive.</p>
                </div>
              </div>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {renderDashboardContent()}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;
