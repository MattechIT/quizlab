import React, { useState, useEffect } from 'react';
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
import QuizSelection from './components/QuizSelection';
import QuizRunner from './components/QuizRunner';
import Results from './components/Results';
import Flashcards from './components/Flashcards';

export default function App() {
  const [currentPage, setCurrentPage] = useState('loading'); // loading, welcome, selection, quiz, results, flashcards
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState({ quizId: null, score: 0 });

  // Controlla se la sessione OIDC è attiva chiamando l'API dei quiz protetta
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/v1/quiz');
      if (response.ok) {
        const data = await response.json();
        setUser(data.userInfo);
        setQuizzes(data.data || []);
        setCurrentPage('selection');
      } else {
        // Non autorizzato o cookie scaduto
        setUser(null);
        setCurrentPage('welcome');
      }
    } catch (error) {
      console.error("[ERROR] Errore di connessione alle API:", error);
      setUser(null);
      setCurrentPage('welcome');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSelectQuiz = (quizId) => {
    setActiveQuizId(quizId);
    setCurrentPage('quiz');
  };

  const handleQuizComplete = (score) => {
    setLastQuizResult({ quizId: activeQuizId, score });
    setCurrentPage('results');
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

      case 'selection':
        return (
          <QuizSelection 
            quizzes={quizzes} 
            onSelectQuiz={handleSelectQuiz} 
            onViewFlashcards={() => setCurrentPage('flashcards')} 
          />
        );

      case 'quiz':
        return (
          <QuizRunner 
            quizId={activeQuizId} 
            onComplete={handleQuizComplete} 
            onCancel={() => setCurrentPage('selection')} 
          />
        );

      case 'results':
        return (
          <Results 
            quizId={lastQuizResult.quizId} 
            score={lastQuizResult.score} 
            username={user?.username} 
            onRestart={() => setCurrentPage('selection')} 
          />
        );

      case 'flashcards':
        return (
          <Flashcards 
            onBack={() => setCurrentPage('selection')}
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
          <a href="#" onClick={(e) => { e.preventDefault(); if (user) setCurrentPage('selection'); }} className="logo">
            <GraduationCap className="logo-icon" size={24} />
            <span>Quiz<span style={{ color: 'var(--accent-hover)' }}>Lab</span></span>
          </a>

          {user && (
            <div className="nav-links" style={{ alignItems: 'center' }}>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentPage('selection'); }} 
                className={`nav-link ${['selection', 'quiz', 'results'].includes(currentPage) ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setCurrentPage('flashcards'); }} 
                className={`nav-link ${currentPage === 'flashcards' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={16} /> Flashcards
              </a>
              
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
        <div className="container" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            &copy; 2026 QuizLab Platform. Architettura Didattica Multi-Tier.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Stato Mesh: <strong style={{ color: 'var(--success)' }}>mTLS Attivo</strong></span>
            <span>Gateway: <strong>Traefik + Cloudflare</strong></span>
          </div>
        </div>
      </footer>
    </>
  );
}
