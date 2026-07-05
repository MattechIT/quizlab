import React from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, BookOpen, RefreshCw, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ManageCardsModal({ 
  isOpen, 
  onClose, 
  deck, 
  cards = [], 
  loading = false, 
  onAddCard, 
  onEditCard, 
  onDeleteCard 
}) {
  if (!isOpen || !deck) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, padding: '16px'
    }}>
      <div className="card animate-fade-in" style={{ 
        maxWidth: '720px', width: '100%', padding: '28px', backgroundColor: '#121212', 
        border: '1px solid var(--card-border)', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header del manager */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-hover)', fontWeight: '600', textTransform: 'uppercase' }}>Pannello Gestione</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2px' }}>Carte nel mazzo: {deck.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Aggiunta nuova carta */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={onAddCard}
            className="btn btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Aggiungi Nuova Card
          </button>
        </div>

        {/* Lista scrollabile delle carte */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Caricamento carte...</p>
            </div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
              <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Questo mazzo non contiene ancora flashcard.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Clicca sul pulsante sopra per crearne una.</p>
            </div>
          ) : (
            cards.map((card, idx) => (
              <div key={card.id || idx} style={{
                padding: '16px', backgroundColor: '#18181b', border: '1px solid var(--card-border)', borderRadius: '8px',
                position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {card.category || deck.title}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onEditCard(card)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                      title="Modifica card"
                    >
                      <Edit3 size={14} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                    </button>
                    <button 
                      onClick={() => onDeleteCard(card.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                      title="Elimina card"
                    >
                      <Trash2 size={14} style={{ opacity: 0.9 }} onMouseEnter={(e)=>e.currentTarget.style.opacity=1} onMouseLeave={(e)=>e.currentTarget.style.opacity=0.9} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  {card.term}
                </h4>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {card.definition}
                </p>

                {card.image_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <ImageIcon size={12} /> URL immagine: <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>{card.image_url}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
