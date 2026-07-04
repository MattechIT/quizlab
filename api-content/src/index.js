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
    // Prova a interrogare il database applicativo
    const result = await pool.query('SELECT * FROM quizzes ORDER BY id ASC');
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

// Endpoint Flashcards (Protetto)
app.get('/api/v1/flashcards', validateIdentity, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM flashcards ORDER BY id ASC');
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
