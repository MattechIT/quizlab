import React from 'react';
import { ArrowLeft, Plus, BookOpen, UserCheck, Edit3, Trash2, Settings, ArrowRight } from 'lucide-react';

export default function DeckGrid({ 
  decks = [], 
  onCreateDeckClick, 
  onEditDeckClick, 
  onDeleteDeckClick, 
  onManageDeckClick, 
  onStartStudyClick, 
  onBack 
}) {
  return (
    <>
      {/* HEADER DELLA GRIGLIA MAZZI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Torna
        </button>

        <button 
          onClick={onCreateDeckClick} 
          className="btn btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <Plus size={16} /> Crea Mazzo
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>
          <BookOpen size={20} style={{ color: 'var(--accent)' }} /> Mazzi di Studio Flashcards
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Seleziona un mazzo per iniziare lo studio o creane uno personalizzato.
        </p>
      </div>

      {decks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0' }}>
          <BookOpen size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Nessun mazzo configurato. Creane uno per iniziare!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {decks.map((deck) => {
            const isGlobal = deck.created_by === 'global';
            
            return (
              <div key={deck.id} className="card card-hover" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%'
              }}>
                {/* Badge e Controlli del Mazzo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
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

                  {!isGlobal && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => onEditDeckClick(deck)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        title="Modifica metadati mazzo"
                      >
                        <Edit3 size={15} style={{ transition: 'color 0.15s ease' }} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                      </button>
                      <button 
                        onClick={() => onDeleteDeckClick(deck.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        title="Elimina mazzo in modo permanente"
                      >
                        <Trash2 size={15} style={{ transition: 'opacity 0.15s ease' }} onMouseEnter={(e)=>e.currentTarget.style.opacity='0.8'} onMouseLeave={(e)=>e.currentTarget.style.opacity='1'} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {deck.title}
                </h3>
                
                <p style={{ fontSize: '0.85rem', marginBottom: '24px', flex: 1, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {deck.description || "Nessuna descrizione configurata per questo mazzo."}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {deck.cards_count} Flashcards
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isGlobal && (
                      <button 
                        onClick={() => onManageDeckClick(deck)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Gestisci le carte di questo mazzo"
                      >
                        <Settings size={14} /> Gestisci
                      </button>
                    )}
                    <button 
                      onClick={() => onStartStudyClick(deck)} 
                      disabled={deck.cards_count === 0}
                      className="btn btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      title={deck.cards_count === 0 ? "Aggiungi almeno una flashcard per avviare lo studio" : ""}
                    >
                      Studio <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
