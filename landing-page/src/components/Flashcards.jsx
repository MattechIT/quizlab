import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  BookOpen, 
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function Flashcards({ onBack }) {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati del form Creazione Flashcard
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Carica le flashcard dal database
  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/flashcards');
      if (!res.ok) {
        throw new Error("Errore nel caricamento delle flashcard dal database.");
      }
      const data = await res.json();
      setDeck(data.data || []);
      setError(null);
    } catch (err) {
      console.error("[ERROR] Errore caricamento flashcards:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards();
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

  // Creazione Nuova Flashcard (POST)
  const handleCreateFlashcard = async (e) => {
    e.preventDefault();
    if (!category || !term || !definition) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/v1/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          term,
          definition,
          imageUrl: imageUrl || null
        })
      });

      if (response.ok) {
        setShowModal(false);
        // Resetta form
        setCategory('');
        setTerm('');
        setDefinition('');
        setImageUrl('');
        // Ricarica la lista dal database
        await loadFlashcards();
        // Sposta l'indice sull'ultima carta appena aggiunta
        setCurrentIndex(deck.length); 
      } else {
        alert("Errore durante la creazione della flashcard.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && deck.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Caricamento materiale di studio dal database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '60px 0' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>Errore di Caricamento</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          {error}
        </p>
        <button onClick={onBack} className="btn btn-secondary">Torna alla Dashboard</button>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', paddingBottom: '40px' }}>
      {/* HEADER DELLA PAGINA CON BOTTONI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Torna
        </button>

        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <Plus size={16} /> Crea Flashcard
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>
          <BookOpen size={20} style={{ color: 'var(--accent)' }} /> Studio Flashcards
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Clicca sulla carta per ruotarla e leggere la definizione teorica caricata dal DB.
        </p>
      </div>

      {deck.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0' }}>
          <BookOpen size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Nessuna flashcard presente. Creane una con il pulsante in alto!</p>
        </div>
      ) : (
        <>
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
                  {currentCard?.category}
                </span>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', padding: '0 20px', lineHeight: '1.3' }}>
                  {currentCard?.term}
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
                
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'center', lineHeight: '1.6', padding: '0 10px', marginBottom: currentCard?.image_url ? '40px' : '0' }}>
                  {currentCard?.definition}
                </p>

                {currentCard?.image_url && (
                  <div style={{
                    width: '100%', maxWrap: '200px', height: '80px',
                    backgroundImage: `url(${currentCard.image_url})`,
                    backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                    marginBottom: '20px'
                  }}></div>
                )}

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
        </>
      )}

      {/* ==========================================
         MODALE CREAZIONE FLASHCARD
         ========================================== */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '460px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Crea Nuova Flashcard</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFlashcard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Termine / Concetto *</label>
                <input 
                  type="text" required value={term} onChange={(e) => setTerm(e.target.value)}
                  placeholder="Es. SR-IOV"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Categoria *</label>
                <input 
                  type="text" required value={category} onChange={(e) => setCategory(e.target.value)}
                  placeholder="Es. Service Mesh o Hypervisor"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Definizione Teorica *</label>
                <textarea 
                  required value={definition} onChange={(e) => setDefinition(e.target.value)}
                  placeholder="La spiegazione del termine..." rows={3}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} /> URL Immagine Esplicativa (Opzionale)
                </label>
                <input 
                  type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://esempio.it/diagramma.png"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creazione...' : 'Salva Flashcard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
