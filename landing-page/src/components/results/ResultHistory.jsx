import { Trophy, Calendar } from 'lucide-react';

export default function ResultHistory({ username, loadingHistory, history, quizNames }) {
  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={18} style={{ color: 'var(--accent-hover)' }} /> Storico Tentativi ({username})
      </h3>

      {loadingHistory ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
          Caricamento storico in corso...
        </p>
      ) : history.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
          Nessun tentativo salvato per questo modulo.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
          {history.map((attempt) => {
            const attemptPassed = attempt.score >= 70;
            const dateStr = new Date(attempt.completed_at).toLocaleString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <div key={attempt.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#161616',
                border: '1px solid var(--card-border)',
                borderRadius: '8px'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {quizNames[attempt.quiz_id] || `Modulo #${attempt.quiz_id}`}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Calendar size={12} /> {dateStr}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: attemptPassed ? 'var(--success)' : 'var(--danger)'
                }}>
                  {attempt.score}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}