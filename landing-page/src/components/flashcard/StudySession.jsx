import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

export default function StudySession({ deck, cards = [], onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header Studio */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Torna ai mazzi
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          Mazzo: <strong>{deck.title}</strong>
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nessuna carta presente in questo mazzo.</p>
        </div>
      ) : (
        <>
          {/* 3D FLASHCARD */}
          <div 
            className={`perspective-container ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ 
              height: cards[currentIndex]?.image_url ? '340px' : '280px', 
              transition: 'height 0.3s ease' 
            }}
          >
            <div className="flashcard-inner">
              {/* FRONTE: Categoria, Termine e Immagine */}
              <div className="flashcard-front" style={{ 
                paddingTop: '60px', 
                paddingBottom: '50px', 
                justifyContent: 'center' 
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-secondary)',
                  position: 'absolute',
                  top: '20px'
                }}>
                  {cards[currentIndex]?.category || deck.title}
                </span>
                
                <h3 style={{ 
                  fontSize: cards[currentIndex]?.image_url ? '1.25rem' : '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  textAlign: 'center', 
                  padding: '0 10px', 
                  lineHeight: '1.3',
                  margin: '0 0 16px 0'
                }}>
                  {cards[currentIndex]?.term}
                </h3>

                {cards[currentIndex]?.image_url && (
                  <img 
                    src={cards[currentIndex].image_url} 
                    alt={cards[currentIndex]?.term}
                    style={{
                      maxHeight: '110px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid var(--card-border)',
                      padding: '4px'
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-hover)', position: 'absolute', bottom: '20px' }}>
                  <RotateCw size={14} /> Clicca per girare
                </div>
              </div>

              {/* RETRO: Definizione */}
              <div className="flashcard-back" style={{ 
                paddingTop: '60px', 
                paddingBottom: '50px', 
                justifyContent: 'center' 
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  color: 'var(--accent-hover)',
                  position: 'absolute',
                  top: '20px'
                }}>
                  Definizione
                </span>
                
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: 'var(--text-primary)', 
                  textAlign: 'center', 
                  lineHeight: '1.5', 
                  padding: '0 10px',
                  margin: 0
                }}>
                  {cards[currentIndex]?.definition}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', position: 'absolute', bottom: '20px' }}>
                  <RotateCw size={14} /> Clicca per tornare al fronte
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLLI DI NAVIGAZIONE DELLE CARDS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <button 
              onClick={handlePrev} 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={16} /> Precedente
            </button>
            
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Card {currentIndex + 1} di {cards.length}
            </span>

            <button 
              onClick={handleNext} 
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Successiva <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
