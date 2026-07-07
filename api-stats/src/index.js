const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  console.error("[FATAL] La variabile d'ambiente DB_PASSWORD non è configurata!");
  process.exit(1);
}

// Configurazione Pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-app',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quizlab',
  user: process.env.DB_USER || 'quizlab_user',
  password: dbPassword,
});

app.use(express.json());

// Endpoint di Log delle Richieste (per tracciamento didattico mTLS)
app.use((req, res, next) => {
  console.log(`[REQUEST] Ricevuta chiamata ${req.method} ${req.url} da IP: ${req.ip} - User Agent: ${req.headers['user-agent']}`);
  next();
});

// Endpoint POST per salvare un punteggio
app.post('/api/v1/stats', async (req, res) => {
  const { username, quizId, score } = req.body;

  if (!username || !quizId || score === undefined) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: username, quizId, score" });
  }

  try {
    const queryText = 'INSERT INTO stats (username, quiz_id, score, completed_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const result = await pool.query(queryText, [username, quizId, score]);
    
    console.log(`[DATABASE] Salvato punteggio nel DB per ${username} - Quiz: ${quizId}, Punteggio: ${score}`);
    res.status(201).json({
      message: "Statistiche salvate con successo nel database",
      data: result.rows[0]
    });
  } catch (err) {
    console.warn(`[WARNING] Tabella stats non esistente o database offline. Simulo salvataggio per ${username}`);
    
    // Fallback di simulazione log
    res.status(201).json({
      message: "Statistiche salvate con successo (Simulato - tabella non migrata)",
      data: { username, quizId, score, completed_at: new Date().toISOString() }
    });
  }
});

// Endpoint GET per recuperare lo storico di un utente
app.get('/api/v1/stats/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const queryText = 'SELECT * FROM stats WHERE username = $1 ORDER BY completed_at DESC';
    const result = await pool.query(queryText, [username]);
    
    res.json({
      username,
      history: result.rows
    });
  } catch (err) {
    console.warn(`[WARNING] Tabella stats non esistente o database offline. Restituisco storico mock per ${username}`);
    
    // Fallback didattico
    const mockHistory = [
      { id: 101, username: username, quiz_id: 1, score: 80, completed_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 102, username: username, quiz_id: 2, score: 100, completed_at: new Date().toISOString() }
    ];

    res.json({
      username,
      history: mockHistory
    });
  }
});

// Avvio del server ristretto a localhost (accessibile solo dal sidecar Envoy)
app.listen(port, '127.0.0.1', () => {
  console.log(`[INFO] Microservizio api-stats avviato sulla porta ${port}`);
  
  // Test di connessione al database (non bloccante)
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error("[ERROR] Connessione al database postgres-app fallita:", err.message);
    } else {
      console.log("[INFO] Connessione al database postgres-app stabilita con successo alle:", res.rows[0].now);
    }
  });
});
