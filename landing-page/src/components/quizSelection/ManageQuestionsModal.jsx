import { createPortal } from 'react-dom';
import { X, Plus, RefreshCw, HelpCircle, Edit3, Trash2, Image as ImageIcon, BookOpenCheck } from 'lucide-react';

export default function ManageQuestionsModal({
  open,
  manageQuiz,
  loading,
  questions,
  onClose,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  if (!open || !manageQuiz) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, padding: '16px' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '720px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-hover)', fontWeight: '600', textTransform: 'uppercase' }}>Pannello Gestione</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2px' }}>Domande per: {manageQuiz.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={onAddQuestion} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Aggiungi Nuova Domanda
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Caricamento domande...</p>
            </div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
              <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Questo quiz non contiene ancora domande.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Clicca sul pulsante sopra per iniziare ad aggiungerne.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id || idx} style={{ padding: '16px', backgroundColor: '#18181b', border: '1px solid var(--card-border)', borderRadius: '8px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-hover)', textTransform: 'uppercase' }}>
                    Quesito #{idx + 1}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onEditQuestion(q)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Modifica domanda">
                      <Edit3 size={14} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} />
                    </button>
                    <button onClick={() => onDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Elimina domanda">
                      <Trash2 size={14} style={{ opacity: 0.9 }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.9} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>
                  {q.q}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ padding: '6px 10px', borderRadius: '4px', backgroundColor: oIdx === q.correct ? 'rgba(16, 185, 129, 0.08)' : '#0d0d0d', border: '1px solid', borderColor: oIdx === q.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)', color: oIdx === q.correct ? 'var(--success)' : 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{String.fromCharCode(65 + oIdx)})</strong> {opt}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {q.image_url && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><ImageIcon size={12} /> Immagine Allegata</span>}
                  {q.explanation && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><BookOpenCheck size={12} /> Spiegazione Presente</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}