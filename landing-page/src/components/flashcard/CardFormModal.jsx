import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon } from 'lucide-react';

export default function CardFormModal({ isOpen, onClose, onSubmit, card = null, deckName = '', submitting = false }) {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (card) {
      setTerm(card.term || '');
      setDefinition(card.definition || '');
      setCategory(card.category || '');
      setImageUrl(card.image_url || '');
    } else {
      setTerm('');
      setDefinition('');
      setCategory('');
      setImageUrl('');
    }
  }, [card, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term || !definition) return;
    onSubmit(term, definition, category, imageUrl);
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            {card ? 'Modifica Flashcard' : 'Nuova Flashcard'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Termine / Concetto *</label>
            <input 
              type="text" required value={term} onChange={(e) => setTerm(e.target.value)}
              placeholder="Es. KVM"
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Categoria (Opzionale)</label>
            <input 
              type="text" value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder={`Es. Hypervisor (Default: ${deckName})`}
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Definizione *</label>
            <textarea 
              required value={definition} onChange={(e) => setDefinition(e.target.value)}
              placeholder="Descrizione concettuale..." rows={3}
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ImageIcon size={14} /> URL Immagine (Opzionale)
            </label>
            <input 
              type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://esempio.it/immagine.png"
              style={{
                backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annulla</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Salvataggio...' : 'Salva Card'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
