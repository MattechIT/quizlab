const express = require('express');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Body parser
app.use(express.json());

// Logger delle richieste mTLS / Ingress
app.use((req, res, next) => {
  console.log(`[REQUEST] Ricevuta chiamata ${req.method} ${req.url} da IP: ${req.ip} - User Agent: ${req.headers['user-agent']}`);
  next();
});

// Importazione dei moduli di rotta
const quizRouter = require('./routes/quiz');
const statsRouter = require('./routes/stats');
const flashcardsRouter = require('./routes/flashcards');

// Montaggio dei moduli sulle rispettive API URL basi
app.use('/api/v1/quiz', quizRouter);
app.use('/api/v1/quiz', statsRouter); // Gestisce i percorsi /submit e /history
app.use('/api/v1/flashcards', flashcardsRouter);

// Avvio del server
app.listen(port, () => {
  console.log(`[INFO] Microservizio api-content avviato sulla porta ${port}`);
  
  // Test preliminare di connessione al database (non bloccante)
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("[ERROR] Connessione al database postgres-app fallita:", err.message);
    } else {
      console.log("[INFO] Connessione al database postgres-app stabilita con successo alle:", res.rows[0].now);
    }
  });
});
