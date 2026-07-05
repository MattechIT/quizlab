import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Terminal, 
  BookOpen, 
  HelpCircle,
  Shield,
  LayoutDashboard
} from 'lucide-react';
import DashboardHome from './components/DashboardHome';
import QuizSelection from './components/QuizSelection';
import QuizRunner from './components/QuizRunner';
import Results from './components/Results';
import Flashcards from './components/Flashcards';

export default function App() {
  const [currentPage, setCurrentPage] = useState('loading'); // loading, welcome, dashboard, selection, quiz, results, flashcards, flashcards-study
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState({ quizId: null, score: 0, userAnswers: [] });
  const [activeDeck, setActiveDeck] = useState(null);

  // Stati per modali di Alert e Confirm Custom
  const [alertState, setAlertState] = useState({ show: false, message: '', type: 'error' });
  const [confirmState, setConfirmState] = useState({ show: false, message: '', onConfirm: null });

  // Controlla se la sessione OIDC è attiva chiamando l'API dei quiz protetta
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/quiz');
      if (response.ok) {
        const data = await response.json();
        setUser(data.userInfo);
        setQuizzes(data.data || []);
        setCurrentPage('dashboard');
        // Imposta lo stato iniziale del browser al boot
        window.history.replaceState({ page: 'dashboard' }, '');
      } else {
        setUser(null);
        setCurrentPage('welcome');
        window.history.replaceState({ page: 'welcome' }, '');
      }
    } catch (error) {
      console.error("[ERROR] Errore di connessione alle API:", error);
      setUser(null);
      setCurrentPage('welcome');
      window.history.replaceState({ page: 'welcome' }, '');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Gestione del tasto indietro del browser (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        if (event.state.activeQuizId !== undefined) setActiveQuizId(event.state.activeQuizId);
        if (event.state.lastQuizResult !== undefined) setLastQuizResult(event.state.lastQuizResult);
        if (event.state.activeDeck !== undefined) setActiveDeck(event.state.activeDeck);
      } else {
        // Fallback se la cronologia è vuota
        if (user) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('welcome');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, activeQuizId, lastQuizResult, activeDeck]);

  // Espone globalmente le API per Alert e Confirm personalizzati
  useEffect(() => {
    window.customAlert = (message, type = 'error') => {
      setAlertState({ show: true, message, type });
    };
    window.customConfirm = (message, onConfirm) => {
      setConfirmState({ show: true, message, onConfirm });
    };
    return () => {
      delete window.customAlert;
      delete window.customConfirm;
    };
  }, []);

  // Navigatore personalizzato che spinge le viste nella cronologia del browser
  const navigateTo = (page, stateToPush = {}) => {
    setCurrentPage(page);
    
    let nextQuizId = activeQuizId;
    let nextResult = lastQuizResult;
    let nextDeck = activeDeck;

    if (stateToPush.activeQuizId !== undefined) {
      setActiveQuizId(stateToPush.activeQuizId);
      nextQuizId = stateToPush.activeQuizId;
    }
    if (stateToPush.lastQuizResult !== undefined) {
      setLastQuizResult(stateToPush.lastQuizResult);
      nextResult = stateToPush.lastQuizResult;
    }
    if (stateToPush.activeDeck !== undefined) {
      setActiveDeck(stateToPush.activeDeck);
      nextDeck = stateToPush.activeDeck;
    }

    window.history.pushState({ 
      page, 
      activeQuizId: nextQuizId,
      lastQuizResult: nextResult,
      activeDeck: nextDeck
    }, '');
  };

  const handleSelectQuiz = (quizId) => {
    navigateTo('quiz', { activeQuizId: quizId });
  };

  const handleQuizComplete = (score, userAnswers) => {
    navigateTo('results', { lastQuizResult: { quizId: activeQuizId, score, userAnswers } });
  };

  // Avvia la procedura OIDC tramite oauth2-proxy indicando di ritornare alla home dopo il login
  const handleLogin = () => {
    window.location.href = '/oauth2/start?rd=/';
  };

  // Esegue il logout distruggendo il cookie di sessione
  const handleLogout = () => {
    window.location.href = '/oauth2/sign_out?rd=/';
  };

  // Renderizzazione condizionale della pagina corrente
  const renderContent = () => {
    switch (currentPage) {
      case 'loading':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(124, 58, 237, 0.2)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Caricamento piattaforma...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );

      case 'welcome':
        return (
          <div className="container animate-fade-in" style={{ maxWidth: '640px', textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(124, 58, 237, 0.1)', marginBottom: '24px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <GraduationCap size={48} className="logo-icon" />
            </div>
            <h1 style={{ marginBottom: '16px' }}><span className="gradient-text">QuizLab Platform</span></h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
              Benvenuto nella piattaforma di test per i corsi di <strong>Virtualizzazione e Service Mesh</strong>. 
              Accedi con le tue credenziali d'ateneo per visualizzare i quiz, consultare lo storico dei punteggi e studiare con le flashcard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', width: '100%' }}>
                Accedi con Keycloak SSO
              </button>
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14} /> OpenID Connect</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Terminal size={14} /> Zero-Trust Gateways</span>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <DashboardHome 
            user={user} 
            quizzes={quizzes} 
            onNavigateTo={(page) => navigateTo(page)} 
          />
        );

      case 'selection':
        return (
          <QuizSelection 
            quizzes={quizzes} 
            onSelectQuiz={handleSelectQuiz} 
            onViewFlashcards={() => navigateTo('flashcards')} 
            onRefresh={checkAuth}
          />
        );

      case 'quiz':
        return (
          <QuizRunner 
            quizId={activeQuizId} 
            onComplete={handleQuizComplete} 
            onCancel={() => navigateTo('selection')} 
          />
        );

      case 'results':
        return (
          <Results 
            quizId={lastQuizResult.quizId} 
            score={lastQuizResult.score} 
            userAnswers={lastQuizResult.userAnswers}
            username={user?.username} 
            onRestart={() => navigateTo('dashboard')} 
          />
        );

      case 'flashcards':
        return (
          <Flashcards 
            initialView="decks"
            activeDeck={null}
            onStartStudy={(deck) => navigateTo('flashcards-study', { activeDeck: deck })}
            onBack={() => navigateTo('dashboard')}
          />
        );

      case 'flashcards-study':
        return (
          <Flashcards 
            initialView="study"
            activeDeck={activeDeck}
            onBackDecks={() => navigateTo('flashcards')}
            onBack={() => navigateTo('dashboard')}
          />
        );

      default:
        return <div>Pagina non trovata</div>;
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="container navbar-container">
          <a href="#" onClick={(e) => { e.preventDefault(); if (user) navigateTo('dashboard'); }} className="logo">
            <GraduationCap className="logo-icon" size={24} />
            <span>Quiz<span style={{ color: 'var(--accent-hover)' }}>Lab</span></span>
          </a>

          {user && (
            <div className="nav-links" style={{ alignItems: 'center' }}>
              <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--card-border)', margin: '0 8px' }}></div>
              
              <div className="user-badge">
                <User size={14} />
                <span>{user.username}</span>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Sconnetti sessione SSO"
              >
                <LogOut size={14} /> Esci
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '20px 0', fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: '#070707' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            &copy; 2026 QuizLab Platform. Architettura Didattica Multi-Tier.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Stato Mesh: <strong style={{ color: 'var(--success)' }}>mTLS Attivo</strong></span>
            <span>Gateway: <strong>Traefik + Cloudflare</strong></span>
          </div>
        </div>
      </footer>

      {/* ==========================================
         PORTALE PER CUSTOM ALERT
         ========================================== */}
      {alertState.show && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '24px', backgroundColor: '#121212', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              {alertState.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px' }}>
              {alertState.type === 'error' ? 'Attenzione' : 'Messaggio'}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
              {alertState.message}
            </p>
            <button onClick={() => setAlertState({ show: false, message: '', type: 'error' })} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              OK
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         PORTALE PER CUSTOM CONFIRM
         ========================================== */}
      {confirmState.show && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '24px', backgroundColor: '#121212', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              ⚠️
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px' }}>
              Conferma Richiesta
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setConfirmState({ show: false, message: '', onConfirm: null })} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                Annulla
              </button>
              <button 
                onClick={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  setConfirmState({ show: false, message: '', onConfirm: null });
                }} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
