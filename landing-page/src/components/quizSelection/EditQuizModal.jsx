import { createPortal } from 'react-dom';
import { X, Image as ImageIcon } from 'lucide-react';

export default function EditQuizModal({
  open,
  editingQuiz,
  title,
  setTitle,
  difficulty,
  setDifficulty,
  description,
  setDescription,
  imageUrl,
  setImageUrl,
  updating,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Modifica Quiz</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Quiz *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Difficoltà *</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)' }}>
              <option value="Facile">Facile</option>
              <option value="Medio">Medio</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Descrizione</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ImageIcon size={14} /> URL Immagine Copertina (Opzionale)
            </label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annulla</button>
            <button type="submit" disabled={updating} className="btn btn-primary">
              {updating ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}