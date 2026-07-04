import React from 'react';
import { 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Trophy, 
  Cpu, 
  Layers, 
  Network 
} from 'lucide-react';

export default function QuizSelection({ quizzes, onSelectQuiz, onViewFlashcards }) {
  // Associa un'icona e una descrizione ad ogni quiz per arricchire il design visivo
  const getQuizMetadata = (id) => {
    switch (id) {
      case 1:
        return {
          icon: <Cpu size={24} style={{ color: '#60a5fa' }} />,
          desc: "Architetture hypervisor Type-1 e Type-2, macchine virtuali, ottimizzazione hardware e isolamento delle risorse."
        };
      case 2:
        return {
          icon: <Layers size={24} style={{ color: '#34d399' }} />,
          desc: "Teoria dei container, namespaces e cgroups, ottimizzazione di Dockerfile multi-stage ed eco-policy di storage."
        };
      case 3:
        return {
          icon: <Network size={24} style={{ color: '#a78bfa' }} />,
          desc: "Data plane L7 con Envoy, handshake mutuo TLS (mTLS), sniffing dei pacchetti crittografati e architetture Zero-Trust."
        };
      default:
        return {
          icon: <HelpCircle size={24} style={{ color: '#a1a1aa' }} />,
          desc: "Metti alla prova le tue conoscenze tecniche su argomenti di cloud e virtualizzazione."
        };
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'facile':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'medio':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
      case 'difficile':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      default:
        return { bg: 'rgba(124, 58, 237, 0.1)', text: '#7c3aed', border: 'rgba(124, 58, 237, 0.2)' };
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* BANNER DI PRESENTAZIONE */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #121212 0%, #1a0f30 100%)',
        borderColor: 'rgba(124, 58, 237, 0.15)',
        padding: '32px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}><span className="gradient-text">Pronto per il Test?</span></h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Seleziona uno dei moduli didattici qui sotto. Ogni quiz contiene domande a risposta multipla strutturate per preparare l'esame finale di laboratorio.
          </p>
        </div>
        <button onClick={onViewFlashcards} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
          <BookOpen size={18} style={{ color: 'var(--accent-hover)' }} />
          <span>Studia con le Flashcards</span>
        </button>
      </div>

      {/* GRIGLIA QUIZ */}
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={20} style={{ color: 'var(--accent)' }} /> Moduli di Esame
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {quizzes.map((quiz) => {
          const meta = getQuizMetadata(quiz.id);
          const diffStyle = getDifficultyColor(quiz.difficulty);
          
          return (
            <div key={quiz.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                  {meta.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: diffStyle.bg,
                  color: diffStyle.text,
                  border: `1px solid ${diffStyle.border}`
                }}>
                  {quiz.difficulty}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {quiz.title}
              </h3>
              
              <p style={{ fontSize: '0.9rem', marginBottom: '24px', flex: 1 }}>
                {meta.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {quiz.questions} Domande
                </span>
                <button 
                  onClick={() => onSelectQuiz(quiz.id)} 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Inizia Quiz <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
