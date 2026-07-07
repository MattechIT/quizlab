const express = require('express');
const router = express.Router();
const { validateIdentity } = require('../middleware/auth');

// URL del servizio api-stats su mesh-net
const statsServiceUrl = process.env.STATS_SERVICE_URL || 'http://api-stats:3000/api/v1/stats';

// Endpoint per sottomettere un quiz e salvare il punteggio (comunicazione inter-servizio su mesh-net)
router.post('/submit', validateIdentity, async (req, res) => {
  const { quizId, score } = req.body;
  const username = req.user.username;

  if (quizId === undefined || score === undefined) {
    return res.status(400).json({ error: "Bad Request", message: "Campi obbligatori: quizId, score" });
  }

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
router.get('/history', validateIdentity, async (req, res) => {
  const username = req.user.username;
  
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

module.exports = router;
