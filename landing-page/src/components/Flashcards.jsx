import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  BookOpen, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

export default function Flashcards({ onBack }) {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica le flashcard dal database all'avvio
  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/flashcards')
      .then(res => {
        if (!res.ok) {
          throw new Error("Errore nel caricamento delle flashcard dal database.");
        }
        return res.json();
      })
      .then(data => {
        setDeck(data.data || []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("[ERROR] Errore caricamento flashcards:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleNext = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 150);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 150);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Caricamento materiale di studio dal database...</p>
      </div>
    );
  }

  if (error || deck.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '60px 0' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>Errore di Caricamento</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          {error || "Nessuna flashcard disponibile nel database."}
        </p>
        <button onClick={onBack} className="btn btn-secondary">Torna alla Dashboard</button>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', paddingBottom: '40px' }}>
      {/* BOTTONE INDIETRO */}
      <button 
        onClick={onBack} 
        className="btn btn-secondary" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px', padding: '8px 14px' }}
      >
        <ArrowLeft size={16} /> Torna alla Selezione
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>
          <BookOpen size={20} style={{ color: 'var(--accent)' }} /> Studio Flashcards
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Clicca sulla carta per ruotarla e leggere la definizione teorica caricata dal DB.
        </p>
      </div>

      {/* 3D FLASHCARD */}
      <div 
        className={`perspective-container ${isFlipped ? 'is-flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          {/* FRONTE */}
          <div className="flashcard-front">
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
              {currentCard.category}
            </span>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', padding: '0 20px', lineHeight: '1.3' }}>
              {currentCard.term}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-hover)', position: 'absolute', bottom: '20px' }}>
              <RotateCw size={14} /> Clicca per girare
            </div>
          </div>

          {/* RETRO */}
          <div className="flashcard-back">
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
            
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: '1.6', padding: '0 10px' }}>
              {currentCard.definition}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', position: 'absolute', bottom: '20px' }}>
              <RotateCw size={14} /> Clicca per tornare al fronte
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLLI NAVIGAZIONE */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
        <button 
          onClick={handlePrev} 
          className="btn btn-secondary" 
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={16} /> Precedente
        </button>
        
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Card {currentIndex + 1} di {deck.length}
        </span>

        <button 
          onClick={handleNext} 
          className="btn btn-secondary" 
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          Successiva <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
