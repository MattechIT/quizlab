import { createPortal } from 'react-dom';
import { X, Image as ImageIcon } from 'lucide-react';

export default function CreateQuestionModal({
  open,
  questionText,
  setQuestionText,
  optA,
  setOptA,
  optB,
  setOptB,
  optC,
  setOptC,
  optD,
  setOptD,
  correctOption,
  setCorrectOption,
  explanation,
  setExplanation,
  imageUrl,
  setImageUrl,
  submitting,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Aggiungi Domanda</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Testo della Domanda *</label>
            <textarea required value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Es. Qual è il comando per avviare i container in background?" rows={2} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Opzioni di Risposta *</label>
            <input type="text" required value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Opzione A" style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            <input type="text" required value={optB} onChange={(e) => setOptB(e.target.value)} placeholder="Opzione B" style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            <input type="text" required value={optC} onChange={(e) => setOptC(e.target.value)} placeholder="Opzione C" style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            <input type="text" required value={optD} onChange={(e) => setOptD(e.target.value)} placeholder="Opzione D" style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Risposta Corretta *</label>
            <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)' }}>
              <option value={0}>Opzione A</option>
              <option value={1}>Opzione B</option>
              <option value={2}>Opzione C</option>
              <option value={3}>Opzione D</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Spiegazione Teorica (Mostrata a fine quiz)</label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Es. Il flag -d permette l'esecuzione del container in modalità detached (sfondo)..." rows={2} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ImageIcon size={14} /> URL Immagine per la Domanda (Opzionale)
            </label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://esempio.it/diagramma.png" style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annulla</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Salvataggio...' : 'Aggiungi domanda'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}