import { AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export default function ResultSummary({ quizTitle, score, isPassed, submitting, submitError }) {
  return (
    <div className="card" style={{
      textAlign: 'center',
      background: 'linear-gradient(180deg, #121212 0%, #161616 100%)',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '200px',
        background: isPassed ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: isPassed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px' }}>
        {isPassed ? <CheckCircle2 size={32} style={{ color: 'var(--success)' }} /> : <XCircle size={32} style={{ color: 'var(--danger)' }} />}
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
        {isPassed ? 'Modulo Superato!' : 'Punteggio Insufficiente'}
      </h2>
      
      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Hai completato il test su <strong>{quizTitle}</strong>
      </p>

      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '4px solid',
        borderColor: isPassed ? 'var(--success)' : 'var(--danger)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
        boxShadow: isPassed ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)'
      }}>
        <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{score}%</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Score</span>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {submitting && (
          <>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Salvataggio risultati in corso...</span>
          </>
        )}
        {!submitting && !submitError && (
          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Risultati persistiti nel database PostgreSQL
          </span>
        )}
        {submitError && (
          <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} /> Errore di connessione: {submitError}
          </span>
        )}
      </div>
    </div>
  );
}