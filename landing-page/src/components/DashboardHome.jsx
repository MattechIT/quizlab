import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function DashboardHome({ user, quizzes, onNavigateTo }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/v1/quiz/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Impossibile caricare lo storico punteggi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Calcolo statistiche
  const totalCompleted = history.length;
  const averageScore = totalCompleted > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalCompleted) 
    : 0;
  const maxScore = totalCompleted > 0 
    ? Math.max(...history.map(h => h.score)) 
    : 0;

  // Trova il titolo del quiz a partire dall'ID
  const getQuizTitle = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : `Quiz #${quizId}`;
  };

  // Formatta la data
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* SEZIONE GREETING */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #121212 0%, #1c0f30 100%)',
        border: '1px solid var(--card-border)',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px' }}>
          Bentornato, <span className="gradient-text">{user.username}</span>! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Pronto per una nuova sessione di studio? Ecco lo stato delle tue attività sulla piattaforma.
        </p>
      </div>

      {/* GRIGLIA STATISTICHE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '36px'
      }}>
        {/* STAT 1: COMPLETATI */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Quiz Completati</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{totalCompleted}</h3>
          </div>
        </div>

        {/* STAT 2: MEDIA PUNTEGGIO */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-hover)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Punteggio Medio</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{averageScore}%</h3>
          </div>
        </div>

        {/* STAT 3: MAX PUNTEGGIO */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Voto Massimo</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{maxScore}%</h3>
          </div>
        </div>
      </div>

      {/* SEZIONE CENTRALE: AVVIO RAPIDO E ATTIVITA RECENTI */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* BLOCCO 1: AZIONI RAPIDE */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Avvio Rapido</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* CARD QUIZ */}
            <div 
              onClick={() => onNavigateTo('selection')}
              className="card card-hover" 
              style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-hover)' }}>
                  <HelpCircle size={22} />
                </span>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Mettiti alla prova</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>
                Esegui test a scelta multipla sui moduli di Virtualizzazione, Docker, Kubernetes e Service Mesh.
              </p>
            </div>

            {/* CARD FLASHCARDS */}
            <div 
              onClick={() => onNavigateTo('flashcards')}
              className="card card-hover" 
              style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-hover)' }}>
                  <BookOpen size={22} />
                </span>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Studia con le Flashcards</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>
                Memorizza concetti e termini chiave in modo visivo e tridimensionale utilizzando i mazzi di studio.
              </p>
            </div>

          </div>
        </div>

        {/* BLOCCO 2: ATTIVITÀ RECENTI */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Attività Recenti</h3>
          
          {loading ? (
            <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
            </div>
          ) : history.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nessuna attività registrata. Inizia subito un quiz per tracciare i tuoi punteggi!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.slice(0, 3).map((item) => (
                <div key={item.id} className="card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: '#111113'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                      {getQuizTitle(item.quiz_id)}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Calendar size={12} /> {formatDate(item.completed_at)}
                    </span>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: item.score >= 60 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {item.score}%
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.score >= 60 ? 'Superato' : 'Non Superato'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
