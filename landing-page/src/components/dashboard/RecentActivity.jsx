import { Calendar, RefreshCw } from 'lucide-react';

export default function RecentActivity({ history, loading, getQuizTitle, formatDate }) {
  return (
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
  );
}