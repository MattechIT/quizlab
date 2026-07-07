# 🐳 Analisi e Spiegazione del file docker-compose.yml

Questo documento analizza in dettaglio la struttura di configurazione dello stack di **QuizLab** definito nel file [docker-compose.yml](../docker-compose.yml). L'architettura è suddivisa in sezioni di rete, volumi persistenti e servizi logici.

---

## 🌐 1. Blocco Reti (`networks`)

Le reti Docker isolano il traffico dei microservizi a livello di indirizzamento IP.

```yaml
networks:
  gateway-net:
    name: gateway-net
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
  auth-net:
    name: auth-net
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/24
  mesh-net:
    name: mesh-net
    driver: bridge
    internal: true # Isolata L3
    ipam:
      config:
        - subnet: 172.22.0.0/24
```

### Parametri Spiegati:
*   **`driver: bridge`:** Crea un commutatore ethernet virtuale locale (bridge) sull'host Linux. I container collegati possono comunicare tra loro usando gli indirizzi IP assegnati o tramite risoluzione DNS interna (nome del servizio).
*   **`ipam.config.subnet`:** Configura manualmente il range degli indirizzi IP (**IP Address Management**) per evitare collisioni con l'infrastruttura reale del datacenter.
*   **`internal: true` (`mesh-net`):** Direttiva di sicurezza molto forte che permette di configurare il bridge in modalità isolata:  
Docker **non crea** le regole di NAT (`iptables`) per instradare i pacchetti verso internet. I container in questa rete possono parlare solo con altri container della stessa rete, garantendo quindi una buona seoarazione tra applicativo e traffico esterno.

---

## 💾 2. Blocco Volumi Persistenti (`volumes`)

Assicurano la persistenza dello stato dei database PostgreSQL oltre il ciclo di vita dei container.

```yaml
volumes:
  postgres_auth_data:
  postgres_app_data:
```

*   **`postgres_auth_data`:** Memorizza i profili degli utenti e i permessi gestiti da Keycloak.
*   **`postgres_app_data`:** Memorizza l'archivio dei quiz svolti, le domande e le flashcard inserite dagli utenti.

---

## 📦 3. Analisi dei Servizi (`services`)

I servizi rappresentano i singoli moduli/container del sistema.

### 🔌 Servizio: `traefik` (Edge API Gateway)
```yaml
  traefik:
    image: traefik:latest
    container_name: quiz-traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - gateway-net
    ports:
      - "80:80"
      - "8080:8080"
    environment:
      - DOCKER_API_VERSION=1.40
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./config/traefik/dynamic.yml:/etc/traefik/dynamic.yml:ro
```
*   **`security_opt - no-new-privileges:true`:** Opzione di hardening del Kernel Linux. Impedisce ai processi del container di acquisire privilegi superiori (ad esempio tramite binari `setuid`), riducendo la gravità di potenziali bug di sicurezza.
*   **`ports - "80:80"`:** Mappa la porta TCP `80` dell'host sulla porta `80` interna del container per accettare il traffico HTTP.
*   **`volumes - /var/run/docker.sock:...:ro`:** Monta il socket di Docker in modalità **Read-Only**. Consente a Traefik di ascoltare gli eventi di creazione dei container per generare dinamicamente le rotte, ma gli impedisce di manipolare o spegnere altri container sull'host.

---

### 🗄️ Servizio: `postgres-auth` (Database Identity Provider)
```yaml
  postgres-auth:
    image: postgres:16-alpine
    container_name: quiz-postgres-auth
    restart: unless-stopped
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: ${DB_AUTH_PASSWORD}
    networks:
      - auth-net
    volumes:
      - postgres_auth_data:/var/lib/postgresql/data
```
*   **`environment - ${DB_AUTH_PASSWORD}`:** Utilizza l'espansione delle variabili d'ambiente caricate a caldo dal file protetto `.env`, evitando di inserire password in chiaro nei sorgenti Git.
*   **`networks - auth-net`:** Connette il database esclusivamente alla rete di autenticazione, impedendo l'accesso da reti pubbliche o applicative.

---

### 👤 Servizio: `keycloak` (OIDC Identity Server)
```yaml
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: quiz-keycloak
    restart: unless-stopped
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres-auth/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: ${DB_AUTH_PASSWORD}
      KC_PROXY_HEADERS: xforwarded
      KC_HTTP_RELATIVE_PATH: /auth
      KC_HOSTNAME_URL: https://${DOMAIN}/auth
      KC_HTTP_ENABLED: "true"
      OAUTH2_PROXY_CLIENT_SECRET: ${OAUTH2_PROXY_CLIENT_SECRET}
    networks:
      - auth-net
      - gateway-net
    volumes:
      - ./config/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
      - ./config/keycloak/themes:/opt/keycloak/themes:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(`${DOMAIN}`) && PathPrefix(`/auth`)"
      - "traefik.http.routers.keycloak.entrypoints=web"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
    depends_on:
      - postgres-auth
```
*   **`command: start-dev --import-realm`:** Avvia Keycloak in modalità di sviluppo e importa automaticamente le impostazioni del Realm pre-configurato dall'esportazione JSON all'avvio.
*   **`networks` (Duplice collegamento):** È inserito sia in `auth-net` (per comunicare con Postgres-Auth) sia in `gateway-net` (per consentire a Traefik di esporre la schermata di login OIDC agli utenti).
*   **`labels`:** Metadati letti da Traefik. Definiscono le regole di routing: tutte le richieste destinate all'host configurato nella variabile `${DOMAIN}` con prefisso di percorso `/auth` devono essere instradate sulla porta `8080` di Keycloak.

---

### 🛠️ Servizio: `keycloak-setup` (Configuratore automatico OIDC)
```yaml
  keycloak-setup:
    image: quay.io/keycloak/keycloak:24.0
    container_name: quiz-keycloak-setup
    entrypoint: ["/bin/bash", "-c"]
    command:
      - |
        echo "Attesa che Keycloak sia pronto..."
        until /opt/keycloak/bin/kcadm.sh config credentials --config /tmp/kcadm.config --server http://keycloak:8080/auth --realm master --user admin --password "$$KEYCLOAK_ADMIN_PASSWORD" > /dev/null 2>&1; do
          sleep 2
        done
        echo "Keycloak pronto, configurazione client secret..."
        CLIENT_ID=$$(/opt/keycloak/bin/kcadm.sh get clients --config /tmp/kcadm.config -r QuizLab --fields id,clientId --format csv | grep "oauth2-proxy-client" | cut -d, -f1 | tr -d '"' | tr -d '\r')
        
        if [ -z "$$CLIENT_ID" ]; then
          echo "[ERROR] Impossibile recuperare il CLIENT_ID per oauth2-proxy-client!"
          exit 1
        fi
        
        echo "CLIENT_ID trovato: $$CLIENT_ID"
        /opt/keycloak/bin/kcadm.sh update clients/$$CLIENT_ID --config /tmp/kcadm.config -r QuizLab -s secret="$$OAUTH2_PROXY_CLIENT_SECRET"
        echo "Configurazione completata!"
    environment:
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
      OAUTH2_PROXY_CLIENT_SECRET: ${OAUTH2_PROXY_CLIENT_SECRET}
    networks:
      - auth-net
    depends_on:
      - keycloak
```
*   **`command` (Loop CLI kcadm):** Esegue un ciclo di attesa provando ad autenticarsi via CLI di Keycloak. Appena il server Keycloak risponde, interroga le API per estrarre l'ID univoco di `oauth2-proxy-client` e ne aggiorna il secret nel database usando la password del file `.env` locale.
*   **`depends_on - keycloak`:** Si avvia solo dopo il completamento dello startup logico del container principale di Keycloak.

---

### 🔑 Servizio: `oauth2-proxy` (Forward-Auth Controller)
```yaml
  oauth2-proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:v7.6.0
    container_name: quiz-oauth2-proxy
    restart: unless-stopped
    environment:
      OAUTH2_PROXY_PROVIDER: oidc
      OAUTH2_PROXY_CLIENT_ID: oauth2-proxy-client
      OAUTH2_PROXY_CLIENT_SECRET: ${OAUTH2_PROXY_CLIENT_SECRET}
      OAUTH2_PROXY_OIDC_ISSUER_URL: https://${DOMAIN}/auth/realms/QuizLab
      OAUTH2_PROXY_BACKEND_LOGOUT_URL: https://${DOMAIN}/auth/realms/QuizLab/protocol/openid-connect/logout?id_token_hint={id_token}&post_logout_redirect_uri=https://${DOMAIN}/
      OAUTH2_PROXY_COOKIE_SECRET: ${COOKIE_SECRET}
      OAUTH2_PROXY_REDIRECT_URL: https://${DOMAIN}/oauth2/callback
      OAUTH2_PROXY_HTTP_ADDRESS: 0.0.0.0:4180
      OAUTH2_PROXY_EMAIL_DOMAINS: "*"
      OAUTH2_PROXY_UPSTREAMS: static://200
      OAUTH2_PROXY_REVERSE_PROXY: "true"
      OAUTH2_PROXY_SET_XAUTHREQUEST: "true"
      OAUTH2_PROXY_INSECURE_OIDC_ALLOW_UNVERIFIED_EMAIL: "true"
      OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: "true"
    networks:
      - gateway-net
      - auth-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.oauth2.rule=Host(`${DOMAIN}`) && PathPrefix(`/oauth2/`)"
      - "traefik.http.routers.oauth2.entrypoints=web"
      - "traefik.http.services.oauth2.loadbalancer.server.port=4180"
    depends_on:
      keycloak-setup:
        condition: service_completed_successfully
```
*   **`OAUTH2_PROXY_UPSTREAMS: static://200`:** Poiché lavora in modalità *Forward-Auth*, non inoltra il traffico a un backend fisico, ma ritorna semplicemente un header HTTP `200 OK` se l'utente possiede un token valido.
*   **`OAUTH2_PROXY_BACKEND_LOGOUT_URL`:** Abilita il Single Log-Out (SLO) a monte. Quando l'utente chiama `/oauth2/sign_out`, il proxy cancella il cookie locale ed esegue un redirect all'endpoint di Keycloak passando l'ID Token corrente per distruggere la sessione OIDC globale in modo silenzioso.
*   **`OAUTH2_PROXY_SET_XAUTHREQUEST: "true"`:** Forza il proxy a convertire il JWT verificato in intestazioni HTTP standard (come `X-Auth-Request-Preferred-Username`), iniettandole all'interno della chiamata per renderle disponibili ai backend.
*   **`depends_on.keycloak-setup.condition: service_completed_successfully`:** Vincola l'avvio di questo container alla terminazione con successo del configuratore. Questo garantisce che `oauth2-proxy` parta solo quando il secret è stato effettivamente aggiornato all'interno del database di Keycloak.

---

### 📄 Servizio: `landing-page` (Frontend Nginx)
```yaml
  landing-page:
    build: ./landing-page
    container_name: quiz-landing
    restart: unless-stopped
    networks:
      - gateway-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.landing.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.landing.priority=1"
      - "traefik.http.routers.landing.entrypoints=web"
    deploy:
      resources:
        limits:
          memory: 32M
```
*   **`build: ./landing-page`:** Indica a docker-compose di compilare l'immagine leggendo il `Dockerfile` presente nella cartella `./landing-page`.
*   **`traefik.http.routers.landing.priority=1`:** Imposta la priorità minima. Garantisce che qualsiasi rotta non esplicitamente catturata da Keycloak o dalle API venga catturata dal web server Nginx statico (fondamentale per le rotte virtuali lato client nelle SPA).
*   **`deploy.resources.limits.memory: 32M`:** Limite fisico dei **Cgroups**. Impedisce a questo container di consumare più di 32 Megabyte di RAM, proteggendo il server host da attacchi DDoS focalizzati sul web server.

---

### 🗄️ Servizio: `postgres-app` (Database Dati Applicativi)
```yaml
  postgres-app:
    image: postgres:16-alpine
    container_name: quiz-postgres-app
    restart: unless-stopped
    environment:
      POSTGRES_DB: quizlab
      POSTGRES_USER: quizlab_user
      POSTGRES_PASSWORD: ${DB_APP_PASSWORD}
    networks:
      - mesh-net
    volumes:
      - postgres_app_data:/var/lib/postgresql/data
      - ./config/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```
*   **`volumes - ...:/docker-entrypoint-initdb.d/init.sql:ro`:** Mappa lo script SQL di inizializzazione all'interno della directory entrypoint del container di Postgres. Al primo avvio, Postgres esegue automaticamente questo file per creare le tabelle applicative ed inserire i quiz e le domande preconfigurate.

---

### ⚙️ Servizio: `api-content` (Backend Principale / BFF)
```yaml
  api-content:
    build: ./api-content
    container_name: quiz-api-content
    restart: unless-stopped
    environment:
      - DB_HOST=postgres-app
      - DB_USER=quizlab_user
      - DB_PASSWORD=${DB_APP_PASSWORD}
      - DB_NAME=quizlab
      - STATS_SERVICE_URL=http://127.0.0.1:5001/api/v1/stats
      - PORT=3000
    networks:
      - gateway-net
      - mesh-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api-content.rule=Host(`${DOMAIN}`) && PathPrefix(`/api/`)"
      - "traefik.http.routers.api-content.entrypoints=web"
      - "traefik.http.routers.api-content.middlewares=quiz-auth@file"
      - "traefik.http.services.api-content.loadbalancer.server.port=3000"
    depends_on:
      - postgres-app
```
*   **`STATS_SERVICE_URL=http://127.0.0.1:5001/...`:** Indica l'endpoint per trasmettere i punteggi. Punta a `localhost` (`127.0.0.1`) sulla porta `5001` perché la chiamata deve essere intercettata localmente dall'Envoy Sidecar di Egress, che si occuperà di crittografarla.
*   **`networks`:** Collegato sia a `gateway-net` (per ricevere comandi dal browser) sia a `mesh-net` (per connettersi a Postgres-App ed Envoy).
*   **`traefik...middlewares=quiz-auth@file`:** Attiva il middleware di autenticazione Forward-Auth per tutti gli endpoint `/api/`, forzando la verifica del cookie prima di inoltrare la richiesta a questo container.

---

### ⚙️ Servizio: `api-stats` (Backend Statistiche)
```yaml
  api-stats:
    build: ./api-stats
    container_name: quiz-api-stats
    restart: unless-stopped
    environment:
      - DB_HOST=postgres-app
      - DB_USER=quizlab_user
      - DB_PASSWORD=${DB_APP_PASSWORD}
      - DB_NAME=quizlab
      - PORT=3000
    networks:
      - mesh-net
    depends_on:
      - postgres-app
```
*   **Assenza di `labels`:** Non possiede configurazioni Traefik. È invisibile al reverse proxy e non ha alcuna connettività diretta con il traffico web esterno.
*   **`networks - mesh-net`:** Totalmente confinato nella rete backend privata isolata.

---

### 🤖 Servizi: `sidecar-content` e `sidecar-stats` (Service Mesh mTLS)
```yaml
  sidecar-content:
    image: envoyproxy/envoy:v1.28-latest
    container_name: quiz-sidecar-content
    restart: unless-stopped
    network_mode: "service:api-content"
    volumes:
      - ./mesh/envoy-content.yaml:/etc/envoy/envoy.yaml:ro
      - ./mesh/certificates:/etc/envoy/certs:ro
    depends_on:
      - api-content

  sidecar-stats:
    image: envoyproxy/envoy:v1.28-latest
    container_name: quiz-sidecar-stats
    restart: unless-stopped
    network_mode: "service:api-stats"
    volumes:
      - ./mesh/envoy-stats.yaml:/etc/envoy/envoy.yaml:ro
      - ./mesh/certificates:/etc/envoy/certs:ro
    depends_on:
      - api-stats
```
*   **`network_mode: "service:..."`:** Questa direttiva indica a Docker che il sidecar non deve avere un proprio indirizzo IP o stack di rete isolato. Esso viene inserito **nello stesso identico Namespace di rete del servizio principale** (API Content o API Stats). Di conseguenza:
    *   Envoy e l'applicazione Node.js condividono l'interfaccia di loopback (`localhost` / `127.0.0.1`).
    *   Envoy può intercettare le chiamate in arrivo sulla porta locale `5001` per cifrarle, e l'applicazione di destinazione riceve il traffico pulito decriptato su localhost porta `3000`.
*   **`volumes`:** Condivide all'interno dei proxy Envoy i file di configurazione (`envoy.yaml`) e le cartelle contenenti i certificati di crittografia X.509 generati offline, garantendo lo scambio sicuro mTLS.
