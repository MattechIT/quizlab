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

module.exports = { validateIdentity };
