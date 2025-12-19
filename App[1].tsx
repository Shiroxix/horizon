import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { fetchClubStats, fetchPlayerDetail } from './services/api';
import { ClubData, PlayerDetail } from './types';

// AOS Declaration (Animation Library)
declare global {
  interface Window {
    AOS: any;
  }
}

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [authTab, setAuthTab] = useState<'login' | 'reg'>('login');
  
  // Input fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regKey, setRegKey] = useState('');
  
  // Data
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  // UI Feedback
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Initialize Animations
    if (window.AOS) window.AOS.init();
    
    // Check for saved session
    const savedUser = localStorage.getItem('hz_session');
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
      loadClub();
    }
  }, []);

  // --- FUNCTIONS ---
  const pushToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRegister = () => {
    if (regKey !== "LOGONTOP") return pushToast("KEY INVÁLIDA!");
    if (!regUser || !regPass) return pushToast("PREENCHA TUDO!");

    let users = JSON.parse(localStorage.getItem('hz_users') || '[]');
    if (users.find((x: any) => x.u === regUser)) return pushToast("LOGIN JÁ EXISTE!");

    users.push({ u: regUser, p: regPass });
    localStorage.setItem('hz_users', JSON.stringify(users));
    pushToast("CONTA CRIADA COM SUCESSO!");
    setAuthTab('login');
  };

  const handleLogin = () => {
    // Master Access
    if (loginUser === 'shiro' && loginPass === '18172220') {
      loginOk(loginUser);
      return;
    }

    let users = JSON.parse(localStorage.getItem('hz_users') || '[]');
    const found = users.find((x: any) => x.u === loginUser && x.p === loginPass);
    
    if (found) {
      loginOk(loginUser);
    } else {
      pushToast("ACESSO NEGADO!");
    }
  };

  const loginOk = (username: string) => {
    localStorage.setItem('hz_session', username);
    setUser(username);
    setIsAuthenticated(true);
    loadClub();
  };

  const logout = () => {
    localStorage.removeItem('hz_session');
    setIsAuthenticated(false);
    setClubData(null);
  };

  const loadClub = async () => {
    try {
      const data = await fetchClubStats();
      setClubData(data.club);
    } catch (e) {
      pushToast("ERRO AO CARREGAR CLUBE");
    }
  };

  const openProfile = async (tag: string) => {
    setLoadingPlayer(true);
    try {
      const data = await fetchPlayerDetail(tag);
      setSelectedPlayer(data);
    } catch (e) {
      pushToast("ERRO AO CARREGAR PERFIL");
    } finally {
      setLoadingPlayer(false);
    }
  };

  // --- RENDER (VIEW) ---
  
  // 1. Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" data-aos="zoom-in">
          <h1>HORIZON</h1>
          <p style={{ color: 'var(--primary)', fontSize: '0.7rem', letterSpacing: '3px', marginTop: '5px' }}>
            SISTEMA DE ACESSO
          </p>

          <div className="auth-tabs">
            <button 
              className={`tab-btn ${authTab === 'login' ? 'active' : ''}`} 
              onClick={() => setAuthTab('login')}
            >
              LOGIN
            </button>
            <button 
              className={`tab-btn ${authTab === 'reg' ? 'active' : ''}`} 
              onClick={() => setAuthTab('reg')}
            >
              CRIAR CONTA
            </button>
          </div>

          {authTab === 'login' ? (
            <div id="box-login">
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input type="text" placeholder="Seu Login" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input type="password" placeholder="Sua Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
              </div>
              <button className="btn-action" onClick={handleLogin}>Entrar no Sistema</button>
            </div>
          ) : (
            <div id="box-reg">
              <div className="input-group">
                <i className="fas fa-user-plus"></i>
                <input type="text" placeholder="Definir Login" value={regUser} onChange={e => setRegUser(e.target.value)} />
              </div>
              <div className="input-group">
                <i className="fas fa-key"></i>
                <input type="password" placeholder="Definir Senha" value={regPass} onChange={e => setRegPass(e.target.value)} />
              </div>
              <div className="input-group">
                <i className="fas fa-shield-virus"></i>
                <input type="text" placeholder="Chave de Acesso" value={regKey} onChange={e => setRegKey(e.target.value)} />
              </div>
              <button className="btn-action" style={{ background: 'var(--secondary)' }} onClick={handleRegister}>Criar Membro</button>
            </div>
          )}
        </div>
        <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    );
  }

  // 2. Main Dashboard
  return (
    <div id="app">
      <nav>
        <div style={{ fontFamily: 'var(--font-title)', color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>
          HORIZON <span style={{ color: '#fff' }}>ULTRA</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, border: '1px solid var(--primary)', padding: '4px 10px', borderRadius: '5px' }}>
            {user.toUpperCase()}
          </span>
          <i className="fas fa-power-off" onClick={logout} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '1.2rem' }}></i>
        </div>
      </nav>

      <div className="main-container">
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', marginBottom: '25px', color: 'var(--primary)', letterSpacing: '2px' }}>
          MEMBROS DO CLUBE
        </h2>
        
        <div className="stats-grid">
          {clubData ? clubData.members.map((m) => (
            <div key={m.tag} className="p-card glass" data-aos="fade-up" onClick={() => openProfile(m.tag)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={`https://cdn.brawlify.com/profile-icons/regular/${m.icon.id}.png`} style={{ width:'100%', height:'100%' }} alt=""/>
                    </div>
                    <div>
                        <b style={{ fontSize: '1rem', display: 'block' }}>{m.name}</b>
                        <p style={{ fontSize: '0.6rem', opacity: 0.5, fontFamily: 'monospace' }}>{m.tag}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b style={{ color: 'var(--primary)' }}>🏆 {m.trophies.toLocaleString()}</b>
                  <div style={{ fontSize: '0.5rem', opacity: 0.8, marginTop: '5px', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 5px', borderRadius: '4px', display: 'inline-block' }}>
                    {m.role.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '50px' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            </div>
          )}
        </div>
      </div>

      {/* 3. Player Modal */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setSelectedPlayer(null)}>&times;</span>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '20px', border: '2px solid var(--primary)', overflow: 'hidden', boxShadow: '0 0 20px var(--primary)' }}>
                    <img src={`https://cdn.brawlify.com/profile-icons/regular/${selectedPlayer.icon.id}.png`} style={{ width:'100%' }} alt="" />
                </div>
                <h1 style={{ fontFamily: 'var(--font-title)', color: 'var(--primary)', fontSize: '2.5rem', textShadow: '0 0 10px rgba(0, 242, 255, 0.5)' }}>
                    {selectedPlayer.name}
                </h1>
                <p style={{ opacity: 0.5, letterSpacing: '2px' }}>{selectedPlayer.tag} • {selectedPlayer.club?.name || 'SEM CLUBE'}</p>
            </div>

            <div className="stat-banner">
                <div className="stat-item"><b>{selectedPlayer.trophies.toLocaleString()}</b><small>TROFÉUS</small></div>
                <div className="stat-item"><b>{selectedPlayer.highestTrophies.toLocaleString()}</b><small>MÁXIMO</small></div>
                <div className="stat-item"><b>{Math.floor((selectedPlayer['3vs3Victories'] * 6.5) / 60)}h</b><small>TEMPO EST.</small></div>
                <div className="stat-item"><b>{selectedPlayer.expLevel}</b><small>NÍVEL EXP</small></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="stat-item" style={{ textAlign: 'left' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '15px', fontFamily: 'var(--font-title)' }}>ESTATÍSTICAS DE VITÓRIAS</h4>
                    <p style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px' }}>
                        <span>3 VS 3</span> <b style={{ color: '#00f2ff' }}>{selectedPlayer['3vs3Victories']}</b>
                    </p>
                    <p style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '5px' }}>
                        <span>SOLO</span> <b style={{ color: '#7000ff' }}>{selectedPlayer.soloVictories}</b>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>DUO</span> <b style={{ color: '#ff007a' }}>{selectedPlayer.duoVictories}</b>
                    </p>
                </div>
                <div className="stat-item" style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                                { name: '3v3', value: selectedPlayer['3vs3Victories'], color: '#00f2ff' },
                                { name: 'Solo', value: selectedPlayer.soloVictories, color: '#7000ff' },
                                { name: 'Duo', value: selectedPlayer.duoVictories, color: '#ff007a' },
                            ]}
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell key="cell-0" fill="#00f2ff" />
                            <Cell key="cell-1" fill="#7000ff" />
                            <Cell key="cell-2" fill="#ff007a" />
                          </Pie>
                          <Legend iconType="circle" />
                        </PieChart>
                     </ResponsiveContainer>
                </div>
            </div>

            <h3 style={{ marginBottom: '20px', color: 'var(--primary)', fontFamily: 'var(--font-title)', fontSize: '0.9rem' }}>
                BRAWLERS ({selectedPlayer.brawlers.length})
            </h3>
            <div className="b-grid">
                {selectedPlayer.brawlers.sort((a,b) => b.trophies - a.trophies).map((b) => (
                    <div key={b.id} className="b-card">
                        <img src={`https://cdn.brawlify.com/brawlers/${b.id}.png`} style={{ width: '40px', marginBottom: '5px' }} alt="" />
                        <div style={{ fontSize: '0.5rem', color: 'var(--primary)' }}>LVL {b.power}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.7rem', margin: '5px 0' }}>{b.name}</div>
                        <div style={{ fontSize: '0.6rem', color: '#ffd700' }}>🏆 {b.trophies}</div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
};

export default App;