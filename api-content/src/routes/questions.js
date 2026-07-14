const express = require('express');
const router = express.Router();
const pool = require('../db');
const { validateIdentity } = require('../middleware/auth');

// Endpoint per eliminare una domanda da un quiz personale (Protetto)
router.delete('/:id', validateIdentity, async (req, res) => {
  const questionId = parseInt(req.params.id);
  const username = req.user.username;

  if (isNaN(questionId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID domanda non valido" });
  }

  try {
    // Recupera la domanda e controlla la proprietà del quiz associato
    const qCheck = await pool.query(
      'SELECT q.quiz_id, qz.created_by FROM questions q JOIN quizzes qz ON q.quiz_id = qz.id WHERE q.id = $1',
      [questionId]
    );

    if (qCheck.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Domanda non trovata." });
    }

    const { quiz_id, created_by } = qCheck.rows[0];

    if (created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a eliminare questa domanda." });
    }

    // Elimina la domanda
    await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);

    // Decrementa il contatore delle domande nel quiz
    await pool.query('UPDATE quizzes SET questions = GREATEST(0, questions - 1) WHERE id = $1', [quiz_id]);

    res.json({ message: "Domanda eliminata con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nell'eliminazione della domanda:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile eliminare la domanda dal database." });
  }
});

// Endpoint per modificare una domanda di un quiz personale (Protetto)
router.put('/:id', validateIdentity, async (req, res) => {
  const questionId = parseInt(req.params.id);
  const { questionText, options, correctOption, explanation, imageUrl } = req.body;
  const username = req.user.username;

  if (isNaN(questionId)) {
    return res.status(400).json({ error: "Bad Request", message: "ID domanda non valido" });
  }

  if (!questionText || !options || correctOption === undefined) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: questionText, options, correctOption" });
  }

  try {
    // Recupera la domanda e controlla la proprietà del quiz associato
    const qCheck = await pool.query(
      'SELECT q.quiz_id, qz.created_by FROM questions q JOIN quizzes qz ON q.quiz_id = qz.id WHERE q.id = $1',
      [questionId]
    );

    if (qCheck.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Domanda non trovata." });
    }

    const { created_by } = qCheck.rows[0];

    if (created_by !== username) {
      return res.status(403).json({ error: "Forbidden", message: "Non sei autorizzato a modificare questa domanda." });
    }

    // Aggiorna la domanda
    await pool.query(
      'UPDATE questions SET question_text = $1, options = $2, correct_option = $3, explanation = $4, image_url = $5 WHERE id = $6',
      [questionText, JSON.stringify(options), parseInt(correctOption), explanation || null, imageUrl || null, questionId]
    );

    res.json({ message: "Domanda aggiornata con successo!" });
  } catch (err) {
    console.error("[ERROR] Errore nella modifica della domanda:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile aggiornare la domanda nel database." });
  }
});

module.exports = router;
