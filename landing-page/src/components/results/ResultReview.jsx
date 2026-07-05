import { HelpCircle, RefreshCw } from 'lucide-react';

export default function ResultReview({ loadingReview, questions, userAnswers }) {
  return loadingReview ? (
    <div className="card" style={{ marginBottom: '32px', textAlign: 'center', padding: '24px 0' }}>
      <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Elaborazione riepilogo didattico...</p>
    </div>
  ) : questions.length > 0 ? (
    <div className="card" style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HelpCircle size={18} style={{ color: 'var(--accent-hover)' }} /> Revisione Risposte & Spiegazioni
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {questions.map((q, qIdx) => {
          const userAnswerIdx = userAnswers[qIdx];
          const isCorrect = userAnswerIdx === q.correct;
          
          return (
            <div key={qIdx} style={{
              padding: '16px',
              backgroundColor: '#141414',
              border: '1px solid',
              borderColor: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Domanda {qIdx + 1}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: isCorrect ? 'var(--success)' : 'var(--danger)'
                }}>
                  {isCorrect ? 'Corretta' : 'Errata'}
                </span>
              </div>

              {q.image_url && (
                <div style={{
                  width: '100%',
                  height: '140px',
                  backgroundImage: `url(${q.image_url})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid var(--card-border)',
                  marginBottom: '12px'
                }}></div>
              )}

              <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.4' }}>
                {q.q}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: q.explanation ? '16px' : '0' }}>
                {q.options.map((opt, optIdx) => {
                  const isUserSelected = userAnswerIdx === optIdx;
                  const isCorrectOpt = q.correct === optIdx;
                  
                  let optBg = '#0d0d0d';
                  let optBorder = 'var(--card-border)';
                  let optColor = 'var(--text-secondary)';

                  if (isCorrectOpt) {
                    optBg = 'rgba(16, 185, 129, 0.05)';
                    optBorder = 'var(--success)';
                    optColor = 'var(--success)';
                  } else if (isUserSelected && !isCorrectOpt) {
                    optBg = 'rgba(239, 68, 68, 0.05)';
                    optBorder = 'var(--danger)';
                    optColor = 'var(--danger)';
                  }

                  return (
                    <div key={optIdx} style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: optBorder,
                      backgroundColor: optBg,
                      color: optColor,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontWeight: '700' }}>{String.fromCharCode(65 + optIdx)})</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#0d0d0d',
                  borderLeft: '3px solid var(--accent-hover)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4'
                }}>
                  <strong style={{ color: 'var(--accent-hover)' }}>Spiegazione didattica:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
}