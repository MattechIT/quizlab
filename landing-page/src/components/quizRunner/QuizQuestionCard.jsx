import { Clock } from 'lucide-react';

export default function QuizQuestionCard({
  currentQuestion,
  selectedOption,
  onOptionSelect,
  timeLeft,
  progressPercent,
  timeProgressPercent
}) {
  return (
    <>
      <div style={{ width: '100%', height: '4px', backgroundColor: '#18181b', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden', border: '1px solid #27272a' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Seleziona la risposta corretta:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{timeLeft}s</span>
          </div>
        </div>

        <div style={{ width: '100%', height: '2px', backgroundColor: '#1f1f1f', marginBottom: '24px' }}>
          <div style={{
            width: `${timeProgressPercent}%`,
            height: '100%',
            backgroundColor: timeLeft <= 10 ? 'var(--danger)' : 'var(--accent-hover)',
            transition: 'width 1s linear'
          }}></div>
        </div>

        {currentQuestion.image_url && (
          <div style={{
            width: '100%',
            height: '240px',
            backgroundImage: `url(${currentQuestion.image_url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            borderRadius: '8px',
            backgroundColor: '#0a0a0a',
            border: '1px solid var(--card-border)',
            marginBottom: '24px'
          }}></div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.4', marginBottom: '32px', color: 'var(--text-primary)' }}>
          {currentQuestion.q}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionSelect(idx)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedOption === idx ? 'var(--accent)' : 'var(--card-border)',
                backgroundColor: selectedOption === idx ? 'rgba(124, 58, 237, 0.05)' : '#161616',
                color: selectedOption === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: selectedOption === idx ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: selectedOption === idx ? 'var(--accent)' : 'var(--text-muted)'
                }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span style={{ flex: 1 }}>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}