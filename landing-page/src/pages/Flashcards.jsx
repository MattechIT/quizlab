import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Importazione dei Sotto-Componenti Modulari scompattati
import DeckGrid from './flashcard/DeckGrid';
import StudySession from './flashcard/StudySession';
import DeckFormModal from './flashcard/DeckFormModal';
import ManageCardsModal from './flashcard/ManageCardsModal';
import CardFormModal from './flashcard/CardFormModal';

export default function Flashcards({ 
  initialView = 'decks', 
  activeDeck = null, 
  onStartStudy, 
  onBackDecks, 
  onBack 
}) {
  const [currentView, setCurrentView] = useState(initialView);
  const [decks, setDecks] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(activeDeck);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati del form Mazzo (Creazione/Modifica)
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [submittingDeck, setSubmittingDeck] = useState(false);
  const [updatingDeck, setUpdatingDeck] = useState(false);

  // Stati per il pannello "Gestisci Carte"
  const [showManageCardsModal, setShowManageCardsModal] = useState(false);
  const [manageDeck, setManageDeck] = useState(null);
  const [manageCards, setManageCards] = useState([]);
  const [loadingManageCards, setLoadingManageCards] = useState(false);

  // Stati del form Carta (Creazione/Modifica)
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [submittingCard, setSubmittingCard] = useState(false);
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

  // Sincronizza lo stato di visualizzazione in caso di popstate (navigazione browser)
  useEffect(() => {
    setCurrentView(initialView);
    if (initialView === 'study' && activeDeck) {
      setSelectedDeck(activeDeck);
      const loadCardsForStudy = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/v1/flashcards/decks/${activeDeck.id}/cards`);
          if (res.ok) {
            const data = await res.json();
            setDeckCards(data.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadCardsForStudy();
    } else {
      setSelectedDeck(null);
      setDeckCards([]);
    }
  }, [initialView, activeDeck]);

  // Creazione Nuovo Mazzo (POST)
  const handleCreateDeck = async (title, description) => {
    try {
      setSubmittingDeck(true);
      const response = await fetch('/api/v1/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (response.ok) {
        setShowDeckModal(false);
        await loadDecks();
      } else {
        if (window.customAlert) window.customAlert("Errore durante la creazione del mazzo.");
        else alert("Errore durante la creazione del mazzo.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setSubmittingDeck(false);
    }
  };

  // Modifica Mazzo (PUT)
  const handleUpdateDeck = async (title, description) => {
    if (!editingDeck) return;

    try {
      setUpdatingDeck(true);
      const response = await fetch(`/api/v1/flashcards/decks/${editingDeck.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (response.ok) {
        setShowEditDeckModal(false);
        setEditingDeck(null);
        await loadDecks();
      } else {
        if (window.customAlert) window.customAlert("Errore durante la modifica del mazzo.");
        else alert("Errore durante la modifica del mazzo.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setUpdatingDeck(false);
    }
  };

  // Eliminazione Mazzo (DELETE)
  const handleDeleteDeck = async (deckId) => {
    const deleteAction = async () => {
      try {
        const response = await fetch(`/api/v1/flashcards/decks/${deckId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadDecks();
        } else {
          if (window.customAlert) window.customAlert("Errore durante l'eliminazione del mazzo.");
          else alert("Errore durante l'eliminazione del mazzo.");
        }
      } catch (err) {
        console.error(err);
        if (window.customAlert) window.customAlert("Errore di rete.");
        else alert("Errore di rete.");
      }
    };

    if (window.customConfirm) {
      window.customConfirm("Sei sicuro di voler eliminare questo mazzo e tutte le sue flashcard in esso contenute?", deleteAction);
    } else {
      if (window.confirm("Sei sicuro di voler eliminare questo mazzo e tutte le sue flashcard in esso contenute?")) {
        deleteAction();
      }
    }
  };

  // Avvio dello studio di un mazzo specifico
  const handleStartStudy = async (deck) => {
    if (onStartStudy) {
      onStartStudy(deck);
    } else {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/flashcards/decks/${deck.id}/cards`);
        if (res.ok) {
          const data = await res.json();
          setDeckCards(data.data || []);
          setSelectedDeck(deck);
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
    const deleteAction = async () => {
      try {
        const response = await fetch(`/api/v1/flashcards/cards/${cardId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadManageCards(manageDeck.id);
          await loadDecks(); // Aggiorna i contatori mazzi sulla dashboard
        } else {
          if (window.customAlert) window.customAlert("Errore nell'eliminazione della flashcard.");
          else alert("Errore nell'eliminazione della flashcard.");
        }
      } catch (err) {
        console.error(err);
        if (window.customAlert) window.customAlert("Errore di rete.");
        else alert("Errore di rete.");
      }
    };

    if (window.customConfirm) {
      window.customConfirm("Sei sicuro di voler eliminare questa flashcard?", deleteAction);
    } else {
      if (window.confirm("Sei sicuro di voler eliminare questa flashcard?")) {
        deleteAction();
      }
    }
  };

  // Aggiornamento Carta (PUT)
  const handleUpdateCard = async (term, definition, category, imageUrl) => {
    if (!editingCard) return;

    try {
      setUpdatingCard(true);
      const response = await fetch(`/api/v1/flashcards/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ term, definition, category, imageUrl })
      });

      if (response.ok) {
        setShowEditCardModal(false);
        setEditingCard(null);
        await loadManageCards(manageDeck.id);
      } else {
        if (window.customAlert) window.customAlert("Errore durante la modifica della carta.");
        else alert("Errore durante la modifica della carta.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setUpdatingCard(false);
    }
  };

  // Creazione Nuova Carta (POST)
  const handleCreateCard = async (term, definition, category, imageUrl) => {
    if (!manageDeck) return;

    try {
      setSubmittingCard(true);
      const response = await fetch(`/api/v1/flashcards/decks/${manageDeck.id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ term, definition, category, imageUrl })
      });

      if (response.ok) {
        setShowCardModal(false);
        await loadManageCards(manageDeck.id);
        await loadDecks();
      } else {
        if (window.customAlert) window.customAlert("Errore durante l'aggiunta della flashcard.");
        else alert("Errore durante l'aggiunta della flashcard.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleBackNavigation = () => {
    if (currentView === 'study') {
      if (onBackDecks) {
        onBackDecks();
      } else {
        setCurrentView('decks');
        setSelectedDeck(null);
        setDeckCards([]);
      }
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
      
      {/* VISTA 1: GRID DEI MAZZI */}
      {currentView === 'decks' && (
        <DeckGrid 
          decks={decks}
          onCreateDeckClick={() => setShowDeckModal(true)}
          onEditDeckClick={(deck) => {
            setEditingDeck(deck);
            setShowEditDeckModal(true);
          }}
          onDeleteDeckClick={handleDeleteDeck}
          onManageDeckClick={handleOpenManageCards}
          onStartStudyClick={handleStartStudy}
          onBack={handleBackNavigation}
        />
      )}

      {/* VISTA 2: WORKSPACE DI STUDIO (SLIDESHOW) */}
      {currentView === 'study' && selectedDeck && (
        <StudySession 
          deck={selectedDeck}
          cards={deckCards}
          onBack={handleBackNavigation}
        />
      )}

      {/* MODALE: CREAZIONE MAZZO */}
      <DeckFormModal 
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        onSubmit={handleCreateDeck}
        submitting={submittingDeck}
      />

      {/* MODALE: MODIFICA MAZZO */}
      <DeckFormModal 
        isOpen={showEditDeckModal}
        onClose={() => {
          setShowEditDeckModal(false);
          setEditingDeck(null);
        }}
        onSubmit={handleUpdateDeck}
        deck={editingDeck}
        submitting={updatingDeck}
      />

      {/* MODALE: GESTORE DELLE CARTE DEL MAZZO */}
      <ManageCardsModal 
        isOpen={showManageCardsModal}
        onClose={() => {
          setShowManageCardsModal(false);
          setManageDeck(null);
        }}
        deck={manageDeck}
        cards={manageCards}
        loading={loadingManageCards}
        onAddCard={() => setShowCardModal(true)}
        onEditCard={(card) => {
          setEditingCard(card);
          setShowEditCardModal(true);
        }}
        onDeleteCard={handleDeleteCard}
      />

      {/* MODALE: CREAZIONE DI UNA SINGOLA CARTA */}
      <CardFormModal 
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onSubmit={handleCreateCard}
        deckName={manageDeck ? manageDeck.title : ''}
        submitting={submittingCard}
      />

      {/* MODALE: MODIFICA DI UNA SINGOLA CARTA */}
      <CardFormModal 
        isOpen={showEditCardModal}
        onClose={() => {
          setShowEditCardModal(false);
          setEditingCard(null);
        }}
        onSubmit={handleUpdateCard}
        card={editingCard}
        deckName={manageDeck ? manageDeck.title : ''}
        submitting={updatingCard}
      />

    </div>
  );
}
