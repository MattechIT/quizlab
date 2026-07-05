import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  BookOpen, 
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Image as ImageIcon,
  Settings,
  Edit3,
  Trash2,
  UserCheck,
  BookOpenCheck
} from 'lucide-react';

export default function Flashcards({ onBack }) {
  const [currentView, setCurrentView] = useState('decks'); // 'decks', 'study'
  const [decks, setDecks] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  
  // Mazzo attualmente in fase di studio
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati del form Creazione Mazzo
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [submittingDeck, setSubmittingDeck] = useState(false);

  // Stati del form Modifica Mazzo
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [editDeckDescription, setEditDeckDescription] = useState('');
  const [updatingDeck, setUpdatingDeck] = useState(false);

  // Stati per il pannello "Gestisci Carte"
  const [showManageCardsModal, setShowManageCardsModal] = useState(false);
  const [manageDeck, setManageDeck] = useState(null);
  const [manageCards, setManageCards] = useState([]);
  const [loadingManageCards, setLoadingManageCards] = useState(false);

  // Stati del form Creazione Carta
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardTerm, setCardTerm] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardCategory, setCardCategory] = useState('');
  const [cardImageUrl, setCardImageUrl] = useState('');
  const [submittingCard, setSubmittingCard] = useState(false);

  // Stati del form Modifica Carta
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editCardTerm, setEditCardTerm] = useState('');
  const [editCardDefinition, setEditCardDefinition] = useState('');
  const [editCardCategory, setEditCardCategory] = useState('');
  const [editCardImageUrl, setEditCardImageUrl] = useState('');
  const [updatingCard, setUpdatingCard] = useState(false);

  // Carica i mazzi dal database
  const loadDecks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/flashcards/decks');
      if (!res.ok) {
        throw new Error("Errore nel caricamento dei mazzi di flashcard.");
      }
      const data = await res.json();
      setDecks(data.data || []);
      setError(null);
    } catch (err) {
      console.error("[ERROR] Errore caricamento mazzi:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  // Creazione Nuovo Mazzo (POST)
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!deckTitle) return;

    try {
      setSubmittingDeck(true);
      const response = await fetch('/api/v1/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: deckTitle,
          description: deckDescription
        })
      });

      if (response.ok) {
        setShowDeckModal(false);
        setDeckTitle('');
        setDeckDescription('');
        await loadDecks();
      } else {
        alert("Errore durante la creazione del mazzo.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setSubmittingDeck(false);
    }
  };

  // Modifica Mazzo (PUT)
  const handleUpdateDeck = async (e) => {
    e.preventDefault();
    if (!editDeckTitle || !editingDeck) return;

    try {
      setUpdatingDeck(true);
      const response = await fetch(`/api/v1/flashcards/decks/${editingDeck.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editDeckTitle,
          description: editDeckDescription
        })
      });

      if (response.ok) {
        setShowEditDeckModal(false);
        setEditingDeck(null);
        await loadDecks();
      } else {
        alert("Errore durante la modifica del mazzo.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setUpdatingDeck(false);
    }
  };

  // Eliminazione Mazzo (DELETE)
  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo mazzo e tutte le sue flashcard in esso contenute?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/flashcards/decks/${deckId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadDecks();
      } else {
        alert("Errore durante l'eliminazione del mazzo.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    }
  };

  // Avvio dello studio di un mazzo specifico
  const handleStartStudy = async (deck) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/flashcards/decks/${deck.id}/cards`);
      if (res.ok) {
        const data = await res.json();
        setDeckCards(data.data || []);
        setSelectedDeck(deck);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCurrentView('study');
      } else {
        alert("Impossibile caricare le flashcard di questo mazzo.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setLoading(false);
    }
  };

  // Caricamento carte nel manager
  const loadManageCards = async (deckId) => {
    try {
      setLoadingManageCards(true);
      const res = await fetch(`/api/v1/flashcards/decks/${deckId}/cards`);
      if (res.ok) {
        const data = await res.json();
        setManageCards(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingManageCards(false);
    }
  };

  // Apertura manager delle carte
  const handleOpenManageCards = (deck) => {
    setManageDeck(deck);
    loadManageCards(deck.id);
    setShowManageCardsModal(true);
  };

  // Eliminazione Carta (DELETE)
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa flashcard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/flashcards/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadManageCards(manageDeck.id);
        await loadDecks(); // Rinfresca il conteggio carte sulla dashboard
      } else {
        alert("Errore nell'eliminazione della flashcard.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    }
  };

  // Apertura form modifica carta
  const handleEditCardClick = (card) => {
    setEditingCard(card);
    setEditCardTerm(card.term);
    setEditCardDefinition(card.definition);
    setEditCardCategory(card.category || '');
    setEditCardImageUrl(card.image_url || '');
    setShowEditCardModal(true);
  };

  // Aggiornamento Carta (PUT)
  const handleUpdateCard = async (e) => {
    e.preventDefault();
    if (!editCardTerm || !editCardDefinition || !editingCard) return;

    try {
      setUpdatingCard(true);
      const response = await fetch(`/api/v1/flashcards/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          term: editCardTerm,
          definition: editCardDefinition,
          category: editCardCategory,
          imageUrl: editCardImageUrl
        })
      });

      if (response.ok) {
        setShowEditCardModal(false);
        setEditingCard(null);
        await loadManageCards(manageDeck.id);
      } else {
        alert("Errore durante la modifica della carta.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setUpdatingCard(false);
    }
  };

  // Creazione Nuova Carta (POST)
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!cardTerm || !cardDefinition || !manageDeck) return;

    try {
      setSubmittingCard(true);
      const response = await fetch(`/api/v1/flashcards/decks/${manageDeck.id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          term: cardTerm,
          definition: cardDefinition,
          category: cardCategory,
          imageUrl: cardImageUrl
        })
      });

      if (response.ok) {
        setShowCardModal(false);
        setCardTerm('');
        setCardDefinition('');
        setCardCategory('');
        setCardImageUrl('');
        // Ricarica la lista sia sul manager che sulla dashboard per aggiornare i conteggi
        await loadManageCards(manageDeck.id);
        await loadDecks();
      } else {
        alert("Errore durante l'aggiunta della flashcard.");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di rete.");
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deckCards.length);
    }, 150);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deckCards.length) % deckCards.length);
    }, 150);
  };

  // RITORNO A DASHBOARD GENERALE (SE SIAMO IN GRIGLIA) O A GRIGLIA MAZZI (SE SIAMO IN STUDY)
  const handleBackNavigation = () => {
    if (currentView === 'study') {
      setCurrentView('decks');
      setSelectedDeck(null);
      setDeckCards([]);
    } else {
      onBack();
    }
  };

  if (loading && decks.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Caricamento mazzi dal database...</p>
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

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* VISTA 1: ELENCO DEI MAZZI */}
      {currentView === 'decks' && (
        <>
          {/* HEADER DELLA GRIGLIA MAZZI */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <button 
              onClick={handleBackNavigation} 
              className="btn btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <ArrowLeft size={16} /> Torna
            </button>

            <button 
              onClick={() => setShowDeckModal(true)} 
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
                            onClick={() => {
                              setEditingDeck(deck);
                              setEditDeckTitle(deck.title);
                              setEditDeckDescription(deck.description || '');
                              setShowEditDeckModal(true);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                            title="Modifica metadati mazzo"
                          >
                            <Edit3 size={15} style={{ transition: 'color 0.15s ease' }} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDeck(deck.id)}
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
                            onClick={() => handleOpenManageCards(deck)}
                            className="btn btn-secondary" 
                            style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Gestisci le carte di questo mazzo"
                          >
                            <Settings size={14} /> Gestisci
                          </button>
                        )}
                        <button 
                          onClick={() => handleStartStudy(deck)} 
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
      )}

      {/* VISTA 2: WORKSPACE DI STUDIO CARD (SLIDESHOW 3D) */}
      {currentView === 'study' && selectedDeck && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header Studio */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <button 
              onClick={handleBackNavigation} 
              className="btn btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            >
              <ArrowLeft size={16} /> Torna ai mazzi
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Mazzo: <strong>{selectedDeck.title}</strong>
            </span>
          </div>

          {deckCards.length === 0 ? (
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
                  height: deckCards[currentIndex]?.image_url ? '340px' : '280px', 
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
                      {deckCards[currentIndex]?.category || selectedDeck.title}
                    </span>
                    
                    <h3 style={{ 
                      fontSize: deckCards[currentIndex]?.image_url ? '1.25rem' : '1.5rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)', 
                      textAlign: 'center', 
                      padding: '0 10px', 
                      lineHeight: '1.3',
                      margin: '0 0 16px 0'
                    }}>
                      {deckCards[currentIndex]?.term}
                    </h3>

                    {deckCards[currentIndex]?.image_url && (
                      <img 
                        src={deckCards[currentIndex].image_url} 
                        alt={deckCards[currentIndex]?.term}
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
                      {deckCards[currentIndex]?.definition}
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
                  Card {currentIndex + 1} di {deckCards.length}
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
      )}

      {/* ==========================================
         MODALE CREAZIONE MAZZO (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showDeckModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Crea Mazzo Flashcard</h3>
              <button onClick={() => setShowDeckModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Mazzo *</label>
                <input 
                  type="text" required value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)}
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
                  value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)}
                  placeholder="Definizioni e concetti rapidi per studiare..." rows={3}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowDeckModal(false)} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={submittingDeck} className="btn btn-primary">
                  {submittingDeck ? 'Creazione...' : 'Crea mazzo'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         MODALE MODIFICA MAZZO (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showEditDeckModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Modifica Mazzo</h3>
              <button onClick={() => { setShowEditDeckModal(false); setEditingDeck(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Mazzo *</label>
                <input 
                  type="text" required value={editDeckTitle} onChange={(e) => setEditDeckTitle(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Descrizione</label>
                <textarea 
                  value={editDeckDescription} onChange={(e) => setEditDeckDescription(e.target.value)}
                  rows={3}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowEditDeckModal(false); setEditingDeck(null); }} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={updatingDeck} className="btn btn-primary">
                  {updatingDeck ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         PANNELLO GESTIONE CARTE (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showManageCardsModal && manageDeck && createPortal(
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2px' }}>Carte nel mazzo: {manageDeck.title}</h3>
              </div>
              <button onClick={() => { setShowManageCardsModal(false); setManageDeck(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Aggiunta nuova carta */}
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setShowCardModal(true)}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Aggiungi Nuova Card
              </button>
            </div>

            {/* Lista scrollabile delle carte */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
              {loadingManageCards ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Caricamento carte...</p>
                </div>
              ) : manageCards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                  <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Questo mazzo non contiene ancora flashcard.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Clicca sul pulsante sopra per crearne una.</p>
                </div>
              ) : (
                manageCards.map((card, idx) => (
                  <div key={card.id || idx} style={{
                    padding: '16px', backgroundColor: '#18181b', border: '1px solid var(--card-border)', borderRadius: '8px',
                    position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {card.category || manageDeck.title}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditCardClick(card)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                          title="Modifica card"
                        >
                          <Edit3 size={14} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCard(card.id)}
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
      )}

      {/* ==========================================
         MODALE CREAZIONE CARTA (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showCardModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Nuova Flashcard</h3>
              <button onClick={() => setShowCardModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Termine / Concetto *</label>
                <input 
                  type="text" required value={cardTerm} onChange={(e) => setCardTerm(e.target.value)}
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
                  type="text" value={cardCategory} onChange={(e) => setCardCategory(e.target.value)}
                  placeholder="Es. Hypervisor (Default: Nome del mazzo)"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Definizione *</label>
                <textarea 
                  required value={cardDefinition} onChange={(e) => setCardDefinition(e.target.value)}
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
                  type="url" value={cardImageUrl} onChange={(e) => setCardImageUrl(e.target.value)}
                  placeholder="https://esempio.it/immagine.png"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCardModal(false)} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={submittingCard} className="btn btn-primary">
                  {submittingCard ? 'Salvataggio...' : 'Salva Card'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         MODALE MODIFICA CARTA (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showEditCardModal && editingCard && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Modifica Flashcard</h3>
              <button onClick={() => { setShowEditCardModal(false); setEditingCard(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Termine / Concetto *</label>
                <input 
                  type="text" required value={editCardTerm} onChange={(e) => setEditCardTerm(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Categoria</label>
                <input 
                  type="text" value={editCardCategory} onChange={(e) => setEditCardCategory(e.target.value)}
                  placeholder="Default: Nome del mazzo"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Definizione *</label>
                <textarea 
                  required value={editCardDefinition} onChange={(e) => setEditCardDefinition(e.target.value)}
                  rows={3}
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
                  type="url" value={editCardImageUrl} onChange={(e) => setEditCardImageUrl(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowEditCardModal(false); setEditingCard(null); }} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={updatingCard} className="btn btn-primary">
                  {updatingCard ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
