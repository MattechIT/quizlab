const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configurazione Pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-app',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quizlab',
  user: process.env.DB_USER || 'quizlab_user',
  password: process.env.DB_PASSWORD || 'AppDatabaseSecretPass123!',
});

// Middleware per la validazione Zero-Trust degli Header Identità di Traefik/OAuth2-Proxy
const validateIdentity = (req, res, next) => {
  const username = req.headers['x-auth-request-preferred-username'];
  const email = req.headers['x-auth-request-email'];

  // Se mancano gli header di identità perimetrale, rifiutiamo la connessione (Zero-Trust)
  if (!username || !email) {
    console.warn(`[UNAUTHORIZED ACCESS] Tentativo di accesso diretto senza Ingress Gateway da IP: ${req.ip}`);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Accesso diretto vietato. Questa risorsa è protetta e accessibile esclusivamente tramite l'API Ingress Gateway con sessione OIDC attiva."
    });
  }

  // Registriamo nei log l'accesso dell'utente per audit didattico
  req.user = {
    username,
    email,
    groups: req.headers['x-auth-request-groups'] || 'nessuno',
  };
  
  console.log(`[AUDIT] Utente autenticato: ${req.user.username} (${req.user.email}) - Gruppi: ${req.user.groups}`);
  next();
};

app.use(express.json());

// Endpoint Quiz (Protetto)
app.get('/api/v1/quiz', validateIdentity, async (req, res) => {
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
app.get('/api/v1/quiz/:id/questions', validateIdentity, async (req, res) => {
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
app.post('/api/v1/quiz', validateIdentity, async (req, res) => {
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
app.post('/api/v1/quiz/:id/questions', validateIdentity, async (req, res) => {
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
app.delete('/api/v1/quiz/:id', validateIdentity, async (req, res) => {
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
app.put('/api/v1/quiz/:id', validateIdentity, async (req, res) => {
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

// Endpoint per eliminare una domanda da un quiz personale (Protetto)
app.delete('/api/v1/questions/:id', validateIdentity, async (req, res) => {
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
app.put('/api/v1/questions/:id', validateIdentity, async (req, res) => {
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

// Endpoint Flashcards (Protetto)
app.get('/api/v1/flashcards', validateIdentity, async (req, res) => {
  try {
    // Estrae le flashcard globali e quelle personali dello studente
    const result = await pool.query(
      'SELECT * FROM flashcards WHERE created_by = \'global\' OR created_by = $1 ORDER BY id ASC',
      [req.user.username]
    );
    res.json({
      message: `Ecco le tue flashcard di studio, ${req.user.username}.`,
      data: result.rows
    });
  } catch (err) {
    console.warn("[WARNING] Tabella flashcards non trovata nel DB applicativo. Restituisco dati mock.");
    
    const mockFlashcards = [
      { id: 1, term: "LXC", definition: "LinuX Containers, virtualizzazione a livello di sistema operativo." },
      { id: 2, term: "mTLS", definition: "Mutual TLS, autenticazione crittografica bidirezionale tra servizi." },
      { id: 3, term: "Sidecar", definition: "Proxy accoppiato a un servizio per gestirne il traffico di rete." }
    ];

    res.json({
      message: `Ecco le tue flashcard di studio, ${req.user.username}. (Dati mock - database offline o non migrato)`,
      data: mockFlashcards
    });
  }
});

// Endpoint per creare una nuova Flashcard (Protetto)
app.post('/api/v1/flashcards', validateIdentity, async (req, res) => {
  const { category, term, definition, imageUrl } = req.body;
  const username = req.user.username;

  if (!category || !term || !definition) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: category, term, definition" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO flashcards (category, term, definition, created_by, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category, term, definition, username, imageUrl || null]
    );

    res.status(201).json({
      message: "Flashcard creata con successo!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("[ERROR] Errore nella creazione della flashcard:", err.message);
    res.status(500).json({ error: "Internal Server Error", message: "Impossibile salvare la flashcard nel database." });
  }
});

// Endpoint per sottomettere un quiz e salvare il punteggio (comunicazione inter-servizio su mesh-net)
app.post('/api/v1/quiz/submit', validateIdentity, async (req, res) => {
  const { quizId, score } = req.body;
  const username = req.user.username;

  if (quizId === undefined || score === undefined) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: quizId, score" });
  }

  // URL del servizio api-stats su mesh-net
  // In Fase 3 contatterà direttamente http://api-stats:3000/api/v1/stats
  // In Fase 4 questo traffico passerà attraverso i sidecar Envoy in mTLS
  const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://api-stats:3000/api/v1/stats';

  try {
    const response = await fetch(statsServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'api-content-service'
      },
      body: JSON.stringify({ username, quizId, score })
    });

    const data = await response.json();
    res.json({
      message: "Quiz sottomesso e statistiche salvate!",
      statsResponse: data
    });
  } catch (err) {
    console.error("[ERROR] Errore di comunicazione con il microservizio api-stats:", err.message);
    res.status(502).json({
      error: "Bad Gateway",
      message: "Impossibile comunicare con il servizio statistiche interno (api-stats)",
      details: err.message
    });
  }
});

// Endpoint per recuperare lo storico dei punteggi dell'utente (comunicazione inter-servizio su mesh-net)
app.get('/api/v1/quiz/history', validateIdentity, async (req, res) => {
  const username = req.user.username;
  const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://api-stats:3000/api/v1/stats';
  
  // Costruisce l'URL specifico per lo storico dell'utente (es. http://127.0.0.1:5001/api/v1/stats/studente1)
  const historyUrl = `${statsServiceUrl.replace(/\/stats$/, '/stats/')}${encodeURIComponent(username)}`;

  try {
    const response = await fetch(historyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'api-content-service'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[ERROR] Errore di recupero storico da api-stats:", err.message);
    res.status(502).json({
      error: "Bad Gateway",
      message: "Impossibile recuperare lo storico dal servizio statistiche",
      details: err.message
    });
  }
});

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
