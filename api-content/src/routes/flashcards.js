const express = require('express');
const router = express.Router();
const pool = require('../db');
const { validateIdentity } = require('../middleware/auth');

// 1. Recupero Mazzi (Protetto)
router.get('/decks', validateIdentity, async (req, res) => {
  const username = req.user.username;
  try {
    const result = await pool.query(
      `SELECT fd.id, fd.title, fd.description, fd.created_by, COUNT(f.id)::int AS cards_count 
       FROM flashcard_decks fd 
       LEFT JOIN flashcards f ON fd.id = f.deck_id 
       WHERE fd.created_by = 'global' OR fd.created_by = $1 
       GROUP BY fd.id 
       ORDER BY fd.id ASC`,
      [username]
    );
    res.json({
      message: `Ecco i tuoi mazzi di flashcard, ${username}.`,
      data: result.rows
    });
  } catch (err) {
    console.error("[ERROR] Errore nel recupero dei mazzi di flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile recuperare i mazzi dal database." });
  }
});

// 2. Creazione Nuovo Mazzo (Protetto)
router.post('/decks', validateIdentity, async (req, res) => {
  const { title, description } = req.body;
  const username = req.user.username;

  if (!title) {
    return res.status(400).json({ error: "Bad Request", message: "Il titolo del mazzo è obbligatorio." });
  }

  try {
    const result = await pool.query(
      'INSERT INTO flashcard_decks (title, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, description || null, username]
    );
    res.status(201).json({
      message: "Mazzo di flashcard creato con successo!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("[ERROR] Errore nella creazione del mazzo:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile salvare il mazzo nel database." });
  }
});

// 3. Modifica Mazzo Esistente (Protetto)
router.put('/decks/:id', validateIdentity, async (req, res) => {
  const deckId = parseInt(req.params.id);
  const { title, description } = req.body;
  const username = req.user.username;

  if (isNaN(deckId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID mazzo non valido." });
  }

  if (!title) {
    return res.status(400).json({ error: "Bad Request", message: "Il titolo del mazzo è obbligatorio." });
  }

  try {
    // Controllo proprietà
    const check = await pool.query('SELECT created_by FROM flashcard_decks WHERE id = $1', [deckId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Mazzo non trovato." });
    }
    if (check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a modificare questo mazzo." });
    }

    await pool.query(
      'UPDATE flashcard_decks SET title = $1, description = $2 WHERE id = $3',
      [title, description || null, deckId]
    );

    res.json({ message: "Mazzo aggiornato con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nella modifica del mazzo:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile aggiornare il mazzo." });
  }
});

// 4. Eliminazione Mazzo (Protetto)
router.delete('/decks/:id', validateIdentity, async (req, res) => {
  const deckId = parseInt(req.params.id);
  const username = req.user.username;

  if (isNaN(deckId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID mazzo non valido." });
  }

  try {
    // Controllo proprietà
    const check = await pool.query('SELECT created_by FROM flashcard_decks WHERE id = $1', [deckId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Mazzo non trovato." });
    }
    if (check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a eliminare questo mazzo." });
    }

    await pool.query('DELETE FROM flashcard_decks WHERE id = $1', [deckId]);
    res.json({ message: "Mazzo eliminato con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nell'eliminazione del mazzo:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile eliminare il mazzo dal database." });
  }
});

// 5. Recupero Flashcard di un Mazzo (Protetto)
router.get('/decks/:id/cards', validateIdentity, async (req, res) => {
  const deckId = parseInt(req.params.id);
  const username = req.user.username;

  if (isNaN(deckId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID mazzo non valido." });
  }

  try {
    // Controllo visibilità mazzo
    const check = await pool.query('SELECT created_by FROM flashcard_decks WHERE id = $1', [deckId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Mazzo non trovato." });
    }
    if (check.rows[0].created_by !== 'global' && check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato ad accedere a questo mazzo." });
    }

    const result = await pool.query(
      'SELECT id, category, term, definition, created_by, image_url FROM flashcards WHERE deck_id = $1 ORDER BY id ASC',
      [deckId]
    );

    res.json({
      deckId,
      data: result.rows
    });
  } catch (err) {
    console.error("[ERROR] Errore nel recupero delle flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile recuperare le flashcard dal database." });
  }
});

// 6. Aggiunta Flashcard a un Mazzo (Protetto)
router.post('/decks/:id/cards', validateIdentity, async (req, res) => {
  const deckId = parseInt(req.params.id);
  const { category, term, definition, imageUrl } = req.body;
  const username = req.user.username;

  if (isNaN(deckId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID mazzo non valido." });
  }

  if (!term || !definition) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: term, definition" });
  }

  try {
    // Controllo proprietà mazzo
    const check = await pool.query('SELECT created_by, title FROM flashcard_decks WHERE id = $1', [deckId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Mazzo non trovato." });
    }
    if (check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a inserire flashcard in questo mazzo." });
    }

    // Default categoria al nome del mazzo se omessa
    const finalCategory = category || check.rows[0].title;

    const result = await pool.query(
      'INSERT INTO flashcards (deck_id, category, term, definition, created_by, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [deckId, finalCategory, term, definition, username, imageUrl || null]
    );

    res.status(201).json({
      message: "Flashcard inserita con successo!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("[ERROR] Errore nell'aggiunta della flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile salvare la flashcard nel database." });
  }
});

// 7. Modifica Flashcard (Protetto)
router.put('/cards/:id', validateIdentity, async (req, res) => {
  const cardId = parseInt(req.params.id);
  const { category, term, definition, imageUrl } = req.body;
  const username = req.user.username;

  if (isNaN(cardId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID flashcard non valido." });
  }

  if (!term || !definition) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: term, definition" });
  }

  try {
    // Controllo proprietà card
    const check = await pool.query(
      'SELECT c.created_by, fd.title FROM flashcards c JOIN flashcard_decks fd ON c.deck_id = fd.id WHERE c.id = $1',
      [cardId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Flashcard non trovata." });
    }

    if (check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a modificare questa flashcard." });
    }

    const finalCategory = category || check.rows[0].title;

    await pool.query(
      'UPDATE flashcards SET category = $1, term = $2, definition = $3, image_url = $4 WHERE id = $5',
      [finalCategory, term, definition, imageUrl || null, cardId]
    );

    res.json({ message: "Flashcard aggiornata con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nella modifica della flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile aggiornare la flashcard." });
  }
});

// 8. Eliminazione Flashcard (Protetto)
router.delete('/cards/:id', validateIdentity, async (req, res) => {
  const cardId = parseInt(req.params.id);
  const username = req.user.username;

  if (isNaN(cardId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID flashcard non valido." });
  }

  try {
    // Controllo proprietà card
    const check = await pool.query('SELECT created_by FROM flashcards WHERE id = $1', [cardId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Flashcard non trovata." });
    }

    if (check.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a eliminare questa flashcard." });
    }

    await pool.query('DELETE FROM flashcards WHERE id = $1', [cardId]);
    res.json({ message: "Flashcard eliminata con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nell'eliminazione della flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile eliminare la flashcard dal database." });
  }
});

module.exports = router;
