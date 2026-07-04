#!/bin/bash
set -e

# Determina la cartella dei certificati (mesh/certificates) rispetto allo script
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$DIR/certificates"
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

echo "[INFO] Generazione CA locale auto-firmata..."
# 1. Genera la chiave privata della CA locale (4096 bit)
openssl genrsa -out ca.key 4096

# 2. Genera il certificato CA (valido per 10 anni / 3650 giorni)
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 \
  -subj "/CN=QuizLab Local CA/O=University/C=IT" -out ca.crt

echo "[INFO] Generazione certificati Client per api-content (sidecar)..."
# 3. Genera la chiave privata del client api-content
openssl genrsa -out api-content.key 2048

# 4. Genera la CSR (Certificate Signing Request) per il client
openssl req -new -key api-content.key \
  -subj "/CN=api-content/O=University/C=IT" \
  -out api-content.csr

# 5. Firma il certificato client con la CA locale (valido per 365 giorni)
openssl x509 -req -in api-content.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out api-content.crt -days 365 -sha256

echo "[INFO] Generazione certificati Server per api-stats (sidecar)..."
# 6. Genera la chiave privata del server api-stats
openssl genrsa -out api-stats.key 2048

# 7. Crea il file di configurazione temporaneo per i Subject Alternative Names (SAN)
# Necessario per far validare a Envoy il nome host o l'IP locale
cat <<EOF > api-stats.ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = api-stats
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

# 8. Genera la CSR per il server
openssl req -new -key api-stats.key \
  -subj "/CN=api-stats/O=University/C=IT" \
  -out api-stats.csr

# 9. Firma il certificato server con la CA locale inserendo i SAN
openssl x509 -req -in api-stats.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out api-stats.crt -days 365 -sha256 -extfile api-stats.ext

# Pulisci i file di firma temporanei per tenere pulita la cartella
rm -f api-content.csr api-stats.csr api-stats.ext ca.srl

# Imposta permessi di lettura per consentire a Envoy (utente non privilegiato 101) di leggere le chiavi private
chmod 644 *

echo "[SUCCESS] Certificati mTLS generati correttamente in: $CERT_DIR"
ls -la
