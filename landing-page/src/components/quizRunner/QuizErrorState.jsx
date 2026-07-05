import { AlertTriangle } from 'lucide-react';

export default function QuizErrorState({ error, onCancel }) {
  return (
    <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '60px 0' }}>
      <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
      <h3>Errore di Connessione</h3>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
        {error || 'Nessuna domanda trovata per questo modulo nel database.'}
      </p>
      <button onClick={onCancel} className="btn btn-secondary">Torna alla Dashboard</button>
    </div>
  );
}