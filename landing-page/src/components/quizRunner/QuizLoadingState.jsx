import { RefreshCw } from 'lucide-react';

export default function QuizLoadingState({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}