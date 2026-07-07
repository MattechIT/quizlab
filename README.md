# 🎓 QuizLab: Piattaforma Quiz/Flashcard Zero-Trust

![Stato Progetto](https://img.shields.io/badge/Stato-Pronto-success)
![Architettura](https://img.shields.io/badge/Architettura-Microservizi_%7C_BFF-blue)
![Sicurezza](https://img.shields.io/badge/Sicurezza-Zero--Trust_%7C_OIDC-success)

**QuizLab** è una piattaforma web interattiva per la fruizione di quiz e lo studio assistito tramite flashcard. Sviluppato per il corso di *Virtualizzazione e Integrazione di Sistemi*, il progetto esplora l'implementazione pratica di un'architettura **Identity-Aware API Gateway** e di un **Service Mesh crittografato (mTLS)**, ponendo l'accento sulla sicurezza a livello applicativo e infrastrutturale.

Per un'analisi dettagliata dei flussi di rete e dei diagrammi delle componenti, consulta il documento **[structure.md](./docs/structure.md)**.

---

## 🏛️ Concetti Chiave dell'Infrastruttura

L'infrastruttura è progettata seguendo il principio del **privilegio minimo** e dell'isolamento dei microservizi:

*   **Ingress Zero-Trust:** Nessun microservizio backend è esposto direttamente all'esterno. Tutto il traffico passa attraverso l'Edge Gateway **Traefik**, che delega l'autenticazione a **OAuth2-Proxy** (Forward-Auth) collegato all'OIDC Identity Provider **Keycloak**.
*   **Crittografia Intra-Servizio (Service Mesh):** I microservizi di backend (`api-content` e `api-stats`) comunicano tramite sidecar proxy **Envoy** locali in modalità mTLS, garantendo comunicazioni cifrate e protette anche all'interno della rete interna privata.
*   **Isolamento delle Reti:** Lo stack Docker definisce tre reti virtuali distinte (`gateway-net`, `auth-net`, `mesh-net`), isolando il backend applicativo e i database dal traffico internet pubblico.

---

## 🛠️ Compilazione e Avvio dello Stack (Nativo)

### 1. Configurazione Iniziale (.env)
Crea una copia del file di configurazione locale a partire dal modello di esempio:
```bash
cp .env.example .env
```
Apri il file `.env` e configura i parametri reali, come il dominio pubblico (`DOMAIN=quizlab.techmatrix.it`) e le password ad alta sicurezza dei database.

### 2. Startup e Compilazione Automatica
Avvia l'infrastruttura tramite Docker Compose:
```bash
docker compose up -d --build
```

**Cosa succede a cascata all'avvio:**
1.  **Build dei Sorgenti:** Docker compila l'applicazione SPA del frontend (`landing-page`) all'interno di un web server leggero Nginx e compila le immagini Node.js dei due backend applicativi.
2.  **Importazione del Realm:** Keycloak importa automaticamente la configurazione base del Realm `QuizLab` definita nel file `realm-export.json`.
3.  **Bootstrap automatico (`keycloak-setup`):** Un container helper temporaneo attende che Keycloak sia in ascolto, dopodiché esegue in modo sicuro l'autenticazione ed aggiorna il Client Secret del realm con la chiave reale impostata nel tuo `.env` locale.
4.  **Avvio di OAuth2-Proxy:** Al termine della configurazione del segreto, Docker Compose avvia `oauth2-proxy` che si aggancia al database aggiornato di Keycloak senza generare errori di autenticazione.

Per una guida dettagliata alla struttura del file di Docker Compose, consulta il documento **[docker_compose.md](./docs/docker_compose.md)**.
