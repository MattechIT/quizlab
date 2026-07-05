import { ArrowRight, UserCheck, Edit3, Trash2, Settings } from 'lucide-react';

export default function QuizSelectionCard({
  quiz,
  meta,
  diffStyle,
  isGlobal,
  onStart,
  onManage,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundImage: quiz.image_url ? `linear-gradient(to bottom, rgba(18, 18, 18, 0.8), #121212), url(${quiz.image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#18181b', border: '1px solid #27272a' }}>
          {meta.icon}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: isGlobal ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 58, 237, 0.1)',
            color: isGlobal ? 'var(--text-secondary)' : 'var(--accent-hover)',
            border: isGlobal ? '1px solid var(--card-border)' : '1px solid rgba(124, 58, 237, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {!isGlobal && <UserCheck size={10} />}
            {isGlobal ? 'Globale' : 'Personale'}
          </span>

          <span style={{
            fontSize: '0.65rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: diffStyle.bg,
            color: diffStyle.text,
            border: `1px solid ${diffStyle.border}`
          }}>
            {quiz.difficulty}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1, lineHeight: '1.3' }}>
          {quiz.title}
        </h3>
        {!isGlobal && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
            <button
              onClick={onEdit}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Modifica metadati quiz"
            >
              <Edit3 size={15} style={{ transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} />
            </button>
            <button
              onClick={onDelete}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Elimina quiz in modo permanente"
            >
              <Trash2 size={15} style={{ transition: 'opacity 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'} />
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.9rem', marginBottom: '24px', flex: 1, color: 'var(--text-secondary)' }}>
        {quiz.description || meta.desc}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1f1f1f' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {quiz.questions} Domande
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          {!isGlobal && (
            <button
              onClick={onManage}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Gestisci le domande inserite in questo quiz"
            >
              <Settings size={14} /> Gestisci
            </button>
          )}
          <button
            onClick={onStart}
            disabled={quiz.questions === 0}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            title={quiz.questions === 0 ? 'Aggiungi almeno una domanda per avviare il quiz' : ''}
          >
            Avvia <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}