import React, { useState, useEffect } from 'react';

interface MobileSimulatorProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
  notification?: { title: string; message: string } | null;
  onCloseNotification?: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  children,
  activeTab,
  onTabChange,
  userRole,
  notification,
  onCloseNotification
}) => {
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [currentTime, setCurrentTime] = useState('15:50');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="simulator-layout">
      {/* Informative Side Panel */}
      <div className="simulator-info">
        <h1 style={{ marginBottom: '16px', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📱 Area Demo Mobile
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px' }}>
          Questo simulatore interattivo mostra l'applicazione <strong>"Sono Qui"</strong> così come appare sui dispositivi mobili (iOS/Android). 
          Puoi testare i flussi dei candidati e delle aziende come se stessi usando un'app nativa.
        </p>

        <div className="glass-card" style={{ maxWidth: '500px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>🛠️ Controlli Simulatore</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button 
              className={`btn ${deviceType === 'ios' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDeviceType('ios')}
            >
              🍎 Apple iOS (iPhone)
            </button>
            <button 
              className={`btn ${deviceType === 'android' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDeviceType('android')}
            >
              🤖 Google Android
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Nota: I filtri avanzati, le notifiche push simulate e il toggle di disponibilità cambiano istantaneamente lo stato visivo dell'app.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '500px' }}>
          <h4 style={{ marginBottom: '8px' }}>Notifiche Push in tempo reale:</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Quando un'azienda visualizza un profilo o invia una richiesta di colloquio, vedrai apparire un banner di notifica push push-down in cima allo schermo dello smartphone.
          </p>
        </div>
      </div>

      {/* Interactive Mobile Phone Wrapper */}
      <div className="simulator-phone">
        <div 
          className="iphone-frame" 
          style={{ 
            borderRadius: deviceType === 'ios' ? '50px' : '36px',
            borderWidth: deviceType === 'ios' ? '12px' : '10px',
            borderColor: '#222'
          }}
        >
          {/* Notch or Camera punch hole */}
          {deviceType === 'ios' ? (
            <div className="iphone-notch">
              <div className="iphone-camera"></div>
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              height: '12px',
              background: '#000',
              borderRadius: '50%',
              zIndex: 1000
            }}></div>
          )}

          {/* Screen */}
          <div className="iphone-screen">
            {/* Status Bar */}
            <div className="iphone-status-bar" style={{ padding: deviceType === 'ios' ? '0 28px' : '0 20px', paddingTop: deviceType === 'ios' ? '10px' : '6px' }}>
              <span>{currentTime}</span>
              <div className="iphone-status-right">
                <span>📶</span>
                <span>🛜</span>
                <span>🔋 85%</span>
              </div>
            </div>

            {/* Simulated Push Notification Banner */}
            {notification && (
              <div className="mobile-push-banner">
                <div className="push-badge">📍</div>
                <div className="push-body">
                  <div className="push-title">{notification.title}</div>
                  <div className="push-desc">{notification.message}</div>
                </div>
                <div className="push-close" onClick={onCloseNotification}>&times;</div>
              </div>
            )}

            {/* Content area */}
            <div className="iphone-content">
              {children}
            </div>

            {/* Simulated Mobile Navigation Bar (Bottom Tab Bar) */}
            {userRole && (
              <div style={{
                height: '60px',
                borderTop: '1px solid var(--border-glass)',
                background: 'rgba(15, 23, 42, 0.95)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingBottom: '4px',
                zIndex: 999
              }}>
                {userRole === 'WORKER' ? (
                  <>
                    <div 
                      onClick={() => onTabChange('profile')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'profile' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>👤</div>
                      <span>Profilo</span>
                    </div>
                    <div 
                      onClick={() => onTabChange('interviews')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'interviews' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>✉️</div>
                      <span>Colloqui</span>
                    </div>
                    <div 
                      onClick={() => onTabChange('notifications')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'notifications' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>🔔</div>
                      <span>Notifiche</span>
                    </div>
                  </>
                ) : userRole === 'COMPANY' ? (
                  <>
                    <div 
                      onClick={() => onTabChange('search')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'search' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>🔍</div>
                      <span>Cerca</span>
                    </div>
                    <div 
                      onClick={() => onTabChange('favorites')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'favorites' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>⭐️</div>
                      <span>Preferiti</span>
                    </div>
                    <div 
                      onClick={() => onTabChange('profile')}
                      style={{ textAlign: 'center', cursor: 'pointer', color: activeTab === 'profile' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: '0.8rem' }}
                    >
                      <div style={{ fontSize: '1.2rem' }}>🏢</div>
                      <span>Azienda</span>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* iPhone swipe bottom bar */}
            {deviceType === 'ios' && <div className="iphone-home-indicator"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};
