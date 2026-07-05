export default function QuizRunnerHeader({ currentQuestionIndex, totalQuestions, onCancel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-hover)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Esecuzione Quiz
        </span>
        <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>Domanda {currentQuestionIndex + 1} di {totalQuestions}</h2>
      </div>
      <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
        Annulla
      </button>
    </div>
  );
}