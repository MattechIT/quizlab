import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function DeckFormModal({ isOpen, onClose, onSubmit, deck = null, submitting = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (deck) {
      setTitle(deck.title || '');
      setDescription(deck.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [deck, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onSubmit(title, description);
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            {deck ? 'Modifica Mazzo' : 'Crea Mazzo Flashcard'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Mazzo *</label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Comandi base Docker"
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Descrizione</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Definizioni e concetti rapidi per studiare..." rows={3}
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annulla</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Salvataggio...' : deck ? 'Salva Modifiche' : 'Crea mazzo'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
