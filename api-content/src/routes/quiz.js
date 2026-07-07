const express = require('express');
const router = express.Router();
const pool = require('../db');
const { validateIdentity } = require('../middleware/auth');

// Endpoint Quiz (Protetto)
router.get('/', validateIdentity, async (req, res) => {
  try {
    // Interroga il database applicativo estraendo i quiz globali e quelli dello studente
    const result = await pool.query(
      'SELECT * FROM quizzes WHERE created_by = \'global\' OR created_by = $1 ORDER BY id ASC',
      [req.user.username]
    );
    res.json({
      message: `Benvenuto ${req.user.username}! Ecco i quiz disponibili.`,
      userInfo: req.user,
      data: result.rows
    });
  } catch (err) {
    // Fallback didattico se le tabelle del DB non sono ancora state create/migrate
    console.warn("[WARNING] Tabella quizzes non trovata nel DB applicativo. Restituisco dati mock.");
    
    const mockQuizzes = [
      { id: 1, title: "Fondamenti di Virtualizzazione", questions: 5, difficulty: "Facile" },
      { id: 2, title: "Docker e Containerization", questions: 8, difficulty: "Medio" },
      { id: 3, title: "Service Mesh ed Envoy", questions: 10, difficulty: "Difficile" }
    ];

    res.json({
      message: `Benvenuto ${req.user.username}! (Dati mock - database offline o non migrato)`,
      userInfo: req.user,
      data: mockQuizzes
    });
  }
});

// Endpoint Domande del Quiz (Protetto)
router.get('/:id/questions', validateIdentity, async (req, res) => {
  const quizId = parseInt(req.params.id);
  if (isNaN(quizId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID quiz non valido" });
  }

  try {
    const result = await pool.query(
      'SELECT id, question_text, options, correct_option, explanation, image_url FROM questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quizId]
    );

    res.json({
      quizId,
      questions: result.rows.map(row => ({
        id: row.id,
        q: row.question_text,
        options: row.options, // pg serializza automaticamente il tipo JSONB in array JS
        correct: row.correct_option,
        explanation: row.explanation,
        image_url: row.image_url
      }))
    });
  } catch (err) {
    console.error("[ERROR] Errore nel caricamento delle domande dal DB:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Impossibile recuperare le domande dal database per questo quiz."
    });
  }
});

// Endpoint per creare un nuovo modulo Quiz (Protetto)
router.post('/', validateIdentity, async (req, res) => {
  const { title, difficulty, description, imageUrl } = req.body;
  const username = req.user.username;

  if (!title || !difficulty) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: title, difficulty" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO quizzes (title, questions, difficulty, created_by, description, image_url) VALUES ($1, 0, $2, $3, $4, $5) RETURNING *',
      [title, difficulty, username, description || null, imageUrl || null]
    );

    res.status(201).json({
      message: "Quiz creato con successo!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("[ERROR] Errore nella creazione del quiz:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile salvare il quiz nel database." });
  }
});

// Endpoint per aggiungere una domanda a un quiz esistente (Protetto)
router.post('/:id/questions', validateIdentity, async (req, res) => {
  const quizId = parseInt(req.params.id);
  const { questionText, options, correctOption, explanation, imageUrl } = req.body;
  const username = req.user.username;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID quiz non valido" });
  }

  if (!questionText || !options || correctOption === undefined) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: questionText, options, correctOption" });
  }

  try {
    // Controllo di proprietà: l'utente può aggiungere domande solo ai propri quiz personali
    const quizCheck = await pool.query('SELECT created_by FROM quizzes WHERE id = $1', [quizId]);
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Quiz non trovato." });
    }

    if (quizCheck.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato ad aggiungere domande a questo quiz." });
    }

    // Inserisce la domanda
    const result = await pool.query(
      'INSERT INTO questions (quiz_id, question_text, options, correct_option, explanation, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [quizId, questionText, JSON.stringify(options), correctOption, explanation || null, imageUrl || null]
    );

    // Incrementa il conteggio delle domande nella tabella dei quiz
    await pool.query('UPDATE quizzes SET questions = questions + 1 WHERE id = $1', [quizId]);

    res.status(201).json({
      message: "Domanda aggiunta con successo!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("[ERROR] Errore nell'aggiunta della domanda:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile salvare la domanda nel database." });
  }
});

// Endpoint per eliminare un quiz personale (Protetto)
router.delete('/:id', validateIdentity, async (req, res) => {
  const quizId = parseInt(req.params.id);
  const username = req.user.username;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID quiz non valido" });
  }

  try {
    // Controllo di proprietà
    const quizCheck = await pool.query('SELECT created_by FROM quizzes WHERE id = $1', [quizId]);
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Quiz non trovato." });
    }

    if (quizCheck.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a eliminare questo quiz." });
    }

    // Eliminazione (il CASCADE eliminerà in automatico le domande nel DB)
    await pool.query('DELETE FROM quizzes WHERE id = $1', [quizId]);

    res.json({ message: "Quiz eliminato con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nell'eliminazione del quiz:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile eliminare il quiz dal database." });
  }
});

// Endpoint per modificare un quiz personale (Protetto)
router.put('/:id', validateIdentity, async (req, res) => {
  const quizId = parseInt(req.params.id);
  const { title, difficulty, description, imageUrl } = req.body;
  const username = req.user.username;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID quiz non valido" });
  }

  if (!title || !difficulty) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: title, difficulty" });
  }

  try {
    // Controllo di proprietà
    const quizCheck = await pool.query('SELECT created_by FROM quizzes WHERE id = $1', [quizId]);
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Quiz non trovato." });
    }

    if (quizCheck.rows[0].created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a modificare questo quiz." });
    }

    // Aggiornamento
    await pool.query(
      'UPDATE quizzes SET title = $1, difficulty = $2, description = $3, image_url = $4 WHERE id = $5',
      [title, difficulty, description || null, imageUrl || null, quizId]
    );

    res.json({ message: "Quiz aggiornato con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nella modifica del quiz:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile aggiornare il quiz nel database." });
  }
});

module.exports = router;
