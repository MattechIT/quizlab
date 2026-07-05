import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Award,
  CheckCircle2,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import RecentActivity from '../components/dashboard/RecentActivity';

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
    <div className="container animate-fade-in" style={{ paddingBottom: '40px', paddingTop: '16px' }}>
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
        <StatCard
          icon={CheckCircle2}
          label="Quiz Completati"
          value={totalCompleted}
          iconBackground="rgba(16, 185, 129, 0.1)"
          iconColor="var(--success)"
        />
        <StatCard
          icon={TrendingUp}
          label="Punteggio Medio"
          value={`${averageScore}%`}
          iconBackground="rgba(124, 58, 237, 0.1)"
          iconColor="var(--accent-hover)"
        />
        <StatCard
          icon={Award}
          label="Voto Massimo"
          value={`${maxScore}%`}
          iconBackground="rgba(245, 158, 11, 0.1)"
          iconColor="#f59e0b"
        />
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
            <QuickActionCard
              icon={HelpCircle}
              title="Mettiti alla prova"
              description="Esegui test a scelta multipla sui moduli di Virtualizzazione, Docker, Kubernetes e Service Mesh."
              onClick={() => onNavigateTo('selection')}
            />
            <QuickActionCard
              icon={BookOpen}
              title="Studia con le Flashcards"
              description="Memorizza concetti e termini chiave in modo visivo e tridimensionale utilizzando i mazzi di studio."
              onClick={() => onNavigateTo('flashcards')}
            />
          </div>
        </div>

        {/* BLOCCO 2: ATTIVITÀ RECENTI */}
        <RecentActivity
          history={history}
          loading={loading}
          getQuizTitle={getQuizTitle}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
