# 🎓 QuizLab: Piattaforma Quiz/Flashcard Zero-Trust

![Stato Progetto](https://img.shields.io/badge/Stato-In_Sviluppo-orange)
![Architettura](https://img.shields.io/badge/Architettura-Microservizi_%7C_BFF-blue)
![Sicurezza](https://img.shields.io/badge/Sicurezza-Zero--Trust_%7C_OIDC-success)

**QuizLab** è una piattaforma interattiva per la gestione di quiz e flashcard, sviluppata come progetto per il corso in "Virtualizzazione e Integrazione di Sistemi". 

Il progetto non si concentra sul codice applicativo, ma esplora l'implementazione di un'architettura **Identity-Aware API Gateway (Scenario 1)** e **Service Mesh**, ponendo un forte accento sulla sicurezza perimetrale, l'isolamento dei container e il contenimento delle risorse hardware (Eco-Policy).

---

## 🏛️ Architettura di Sistema (BFF & Zero-Trust)

Il traffico segue un modello rigoroso in cui nessuna porta applicativa è esposta direttamente su Internet. Il flusso di comunicazione è diviso in tre livelli di sicurezza:

1. **Perimetro (Host):** Cloudflare Tunnel ➔ Caddy Reverse Proxy (Iniezione Header e SSL `quizlab.techmatrix.it`).
2. **Gateway Interno (BFF):** Traefik intercetta il traffico e applica il pattern **Forward-Auth** tramite OAuth2-Proxy.
3. **Core Applicativo:** Le API interne sono accessibili solo se la richiesta possiede un token JWT valido rilasciato da Keycloak. Le comunicazioni tra microservizi sono cifrate in mTLS.

---

## 💻 Tech Stack Selezionato

| Livello | Tecnologia | Ruolo |
| :--- | :--- | :--- |
| **API Gateway** | **Traefik v3** | Ingress controller interno, routing e terminazione TLS. |
| **Identity Provider** | **Keycloak (Quarkus)** | Gestione SSO, autenticazione OIDC e rilascio Token JWT. |
| **Security Proxy** | **OAuth2-Proxy** | Valida le sessioni e funge da middleware di Forward-Auth. |
| **Database** | **PostgreSQL 16** | Storage relazionale isolato per Keycloak e dati utente. |
| **Backend API** | **Node.js (Express)** | Microservizi CRUD leggeri (API 1: Contenuti, API 2: Statistiche). |
| **Service Mesh** | **Envoy proxy (Static Sidecars)** | Gestione mTLS e cifratura L7 per la comunicazione intra-servizio. |

---

## 📂 Struttura del Repository

Il repository segue un approccio *monorepo* per facilitare il deploy dello stack completo tramite Docker Compose.

```text
project/
├── .env.example
├── docker-compose.yml
├── config/
│   ├── traefik/
│   │   ├── traefik.yml               # Configurazione statica Traefik
│   │   └── dynamic.yml               # Configurazione dinamica (Middleware & Router)
│   └── keycloak/
│       └── realm-export.json         # Export automatico del Realm per avvio rapido
├── landing-page/                     # Front-end pubblico (No-Auth DMZ)
│   ├── Dockerfile
│   └── html/
├── api-content/                      # Sorgenti API 1: Gestione Flashcard e Quiz
│   ├── Dockerfile
│   └── src/
├── api-stats/                        # Sorgenti API 2: Punteggi e Statistiche
│   ├── Dockerfile
│   └── src/
├── mesh/                             # File per il Service Mesh (Envoy)
│   ├── envoy-content.yaml
│   └── envoy-stats.yaml
└── README.md
````

---

## 🚀 Guida al Deployment (Ambiente di Produzione)

L'infrastruttura di base richiede un nodo Docker eseguito in un ambiente LXC non privilegiato con supporto `nesting` e driver storage `overlay2`.

### 1. Prerequisiti

* Assicurarsi che il demone Docker abbia la rotazione dei log abilitata (`max-size: 10m`) per prevenire l'usura dell'unità NVMe.

### 2. Configurazione delle Variabili d'Ambiente (.env)

Prima di avviare lo stack, creare un file `.env` a partire dal modello `.env.example` e configurare le password e i segreti necessari:

```bash
cp .env.example .env
```

### 3. Avvio dello Stack Identità (Fase 1)

Inizializzare il database e l'Identity Provider prima dei microservizi:

```bash
# Avvia solo il database e Keycloak
docker compose up -d postgres-auth keycloak

# Controlla i log per verificare l'avvio di Quarkus
docker compose logs -f keycloak

```

### 4. Avvio Completo (Fase 2 & Fase 3)

Una volta configurato il Realm su Keycloak, avviare il resto dello stack (Traefik, OAuth2-Proxy, database applicativo e i microservizi):

```bash
docker compose up -d
```

---

## 🟢 Eco-Policy Applicativa (Linee Guida di Sviluppo)

Per mantenere il server efficiente (< 10W in idle) e proteggere lo storage NVMe, i microservizi di questo progetto devono rispettare i seguenti vincoli nel `docker-compose.yml`:

* **Memory Limits:** Ogni container API deve avere un limite massimo di RAM rigoroso (`deploy.resources.limits.memory: 256M`) per evitare lo swap su SSD.
* **Health Checks:** Intervallo minimo di **60 secondi**. Intervalli inferiori generano *interrupt* continui sulla CPU impedendo gli stati di riposo (C-States).
* **Logging:** Nessun microservizio deve scrivere log su file fisici locali. Tutto l'output deve andare su `stdout/stderr` ed essere gestito dal driver `json-file` di Docker con rotazione forzata.
* **Alpine Base:** I `Dockerfile` devono essere basati su immagini Alpine Linux o distroless per minimizzare l'impronta sul file system e accelerare il caricamento in memoria.

---
