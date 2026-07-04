-- ==========================================================================
-- SCHEMA DEL DATABASE APPLICATIVO (postgres-app)
-- ==========================================================================

-- Tabella dei Moduli Quiz
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    questions INT NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

-- Tabella delle Domande correlate ai Quiz
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array JSON di stringhe con le risposte possibili
    correct_option INT NOT NULL -- Indice della risposta corretta (0-based)
);

-- Tabella delle Flashcard per lo studio teorico
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL
);

-- Tabella dello Storico Punteggi (utilizzata dal microservizio api-stats)
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- INSERIMENTO DATI INIZIALI (SEMINAZIONE / SEEDING)
-- ==========================================================================

-- 1. Inizializzazione Moduli Quiz
INSERT INTO quizzes (id, title, questions, difficulty) VALUES
(1, 'Fondamenti di Virtualizzazione', 5, 'Facile'),
(2, 'Docker e Containerization', 8, 'Medio'),
(3, 'Service Mesh ed Envoy', 10, 'Difficile')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  questions = EXCLUDED.questions, 
  difficulty = EXCLUDED.difficulty;

-- Svuota le vecchie domande per evitare duplicati in fase di sviluppo/re-deploy
TRUNCATE TABLE questions CASCADE;

-- 2. Inizializzazione Domande: Fondamenti di Virtualizzazione (quiz_id = 1)
INSERT INTO questions (quiz_id, question_text, options, correct_option) VALUES
(1, 'Quale tipologia di hypervisor (Tipo-1 o Tipo-2) viene eseguita direttamente sull''hardware host fisico (bare-metal)?', '["Hypervisor Tipo-1 (es. Proxmox VE, VMware ESXi)", "Hypervisor Tipo-2 (es. VirtualBox, VMware Workstation)", "Nessuno dei due, girano entrambi sopra un OS", "I container Docker"]', 0),
(1, 'In Proxmox VE, qual è il modulo del kernel Linux che permette la virtualizzazione completa con accelerazione hardware?', '["LXC (Linux Containers)", "KVM (Kernel-based Virtual Machine)", "QEMU (Quick Emulator)", "OpenVZ"]', 1),
(1, 'Quale tecnologia hardware consente a una macchina virtuale di accedere direttamente a una risorsa PCI-Express fisica (es. scheda di rete) bypassando l''hypervisor?', '["Virtual Network Bridge", "SR-IOV (Single Root I/O Virtualization)", "NAT (Network Address Translation)", "VLAN Tagging"]', 1),
(1, 'Cos''è la tecnica del memory ''ballooning'' all''interno di un hypervisor?', '["Un''allocazione fissa e immutabile di RAM allocata all''avvio", "Un driver guest che permette di liberare RAM inutilizzata dalla VM e restituirla all''hypervisor", "Un tipo di memoria di swap su disco SSD", "Una tecnica di compressione delle pagine di memoria CPU"]', 1),
(1, 'In ambiente KVM/QEMU, quale formato disco virtuale supporta nativamente l''allocazione dinamica (thin provisioning), gli snapshot e la crittografia?', '["RAW (.raw)", "VMDK (.vmdk)", "QCOW2 (.qcow2)", "VHD (.vhd)"]', 2);

-- 3. Inizializzazione Domande: Docker e Containerization (quiz_id = 2)
INSERT INTO questions (quiz_id, question_text, options, correct_option) VALUES
(2, 'Quale primitiva del kernel Linux fornisce l''isolamento dello stack di rete, del file system e dei PID per un container?', '["Control Groups (cgroups)", "Linux Namespaces", "Chroot jail", "AppArmor"]', 1),
(2, 'Quale primitiva del kernel Linux si occupa invece di porre limiti fisici all''uso di CPU, RAM e I/O su disco per un container?', '["Linux Namespaces", "Seccomp Profiles", "Control Groups (cgroups)", "Capabilities"]', 2),
(2, 'Nel file Dockerfile, qual è l''obiettivo principale nell''utilizzare il pattern ''Multi-stage Build''?', '["Compilare l''app su più server contemporaneamente", "Ridurre l''impronta di memoria dell''immagine finale escludendo i compilatori ed i tool di sviluppo", "Evitare di usare il demone Docker", "Migliorare la velocità della cache DNS"]', 1),
(2, 'In Docker, a cosa serve il driver di storage grafico di default denominato ''overlay2''?', '["A connettere container su macchine fisiche diverse", "A sovrapporre layer di file system a sola lettura con un layer di scrittura (Copy-On-Write)", "A fare il backup dei volumi sul cloud", "Ad accelerare il rendering grafico 3D"]', 1),
(2, 'Che differenza c''è tra le istruzioni ENTRYPOINT e CMD in un Dockerfile?', '["ENTRYPOINT definisce l''eseguibile fisso del container; CMD definisce i parametri di default sovrascrivibili", "CMD definisce l''eseguibile fisso; ENTRYPOINT definisce le variabili d''ambiente", "Sono perfettamente identiche e intercambiabili", "ENTRYPOINT serve solo in fase di build, CMD solo in esecuzione"]', 0),
(2, 'In base all''Eco-Policy del nostro progetto, quale dei seguenti accorgimenti è obbligatorio nel docker-compose.yml per proteggere lo storage SSD?', '["Riavviare i container ogni ora", "Impostare il logging su stdout e abilitare la rotazione automatica (max-size: 10m) sul demone Docker", "Non usare volumi persistenti", "Eseguire solo immagini basate su Ubuntu"]', 1),
(2, 'Cos''è un''immagine Docker definita ''distroless''?', '["Un container privo di indirizzo IP", "Un''immagine minimale che contiene esclusivamente l''applicazione e le sue dipendenze, senza shell Bash o utility di sistema", "Un''immagine corrotta che non può essere avviata", "Un container che non salva log su disco"]', 1),
(2, 'In Docker Compose, configurare ''network_mode: service:api-content'' su un container sidecar comporta:', '["Che il sidecar condivide l''interfaccia di rete (e l''interfaccia loopback/localhost) del servizio api-content", "Che il sidecar gestisce il DNS del database", "Che api-content viene spento all''avvio del sidecar", "Che i log dei due container vengono uniti in un unico file fisico"]', 0);

-- 4. Inizializzazione Domande: Service Mesh ed Envoy (quiz_id = 3)
INSERT INTO questions (quiz_id, question_text, options, correct_option) VALUES
(3, 'A quale livello del modello OSI opera principalmente il proxy Envoy per gestire e ispezionare il traffico delle API?', '["Livello 3 (Rete)", "Livello 4 (Trasporto)", "Livello 7 (Applicazione - HTTP, gRPC, TLS)", "Livello 2 (Collegamento Dati)"]', 2),
(3, 'Qual è il meccanismo con cui la Service Mesh implementa l''autenticazione mutua (mTLS) est-ovest?', '["Inserendo una password in chiaro in ogni header HTTP", "Entrambi i proxy (client e server) convalidano a vicenda i rispettivi certificati crittografici X.509 firmati dalla stessa CA fidata", "Usando una rete VPN IPsec", "Bloccando le porte TCP tramite iptables"]', 1),
(3, 'In una configurazione statica di Envoy, cos''è un ''Cluster''?', '["Un insieme di macchine virtuali Proxmox", "Un gruppo di host logici a monte (upstream) ai quali Envoy instrada il traffico di rete", "Un''interfaccia grafica per monitorare la memoria", "Un tipo di certificato X.509 client"]', 1),
(3, 'Quale componente di una Service Mesh fa parte del ''Data Plane'' (Piano Dati)?', '["Il proxy Sidecar (es. Envoy) installato accanto all''applicazione", "L''orchestratore Istiod / Consul Control Plane", "Il database PostgreSQL del server SSO", "Il pannello di controllo amministrativo di Keycloak"]', 0),
(3, 'Come fa l''Envoy client (egress) a validare l''identità del server a cui si connette nel cluster di statistiche?', '["Controlla se il server risponde in meno di 10ms", "Confronta il Subject Alternative Name (SAN) del certificato ricevuto con i valori consentiti (es. api-stats)", "Chiede al DNS di confermare l''indirizzo IP", "Usa il token JWT estratto da Keycloak"]', 1),
(3, 'In Envoy, quale parametro del DownstreamTlsContext forza l''mTLS respingendo connessioni prive di certificato client?', '["require_client_certificate: true", "forward_client_cert: always", "validation_context.trusted_ca", "allow_expired: false"]', 0),
(3, 'In una configurazione Envoy, a cosa serve il blocco ''admin'' configurato sulla porta 9901 o 9902?', '["Ad accedere a Keycloak", "A fornire una console locale (e metriche Prometheus) per ispezionare stato, cluster e statistiche del proxy", "A connettersi al database di PostgreSQL", "A modificare le chiavi crittografiche a caldo"]', 1),
(3, 'Quale comando permette di verificare a basso livello che la comunicazione est-ovest sia cifrata catturando i pacchetti sulla rete?', '["docker compose logs", "tcpdump -i <interfaccia> -X port <porta>", "curl -I https://localhost", "ping api-stats"]', 1),
(3, 'Perché in una Service Mesh Zero-Trust l''applicazione backend (es. api-stats) viene configurata per ascoltare su 127.0.0.1?', '["Per risparmiare RAM sull''LXC", "Per impedire che altri container della rete bypassino il sidecar Envoy, forzando tutto il traffico a passare dal controllo mTLS", "Perché non ha i driver per la scheda di rete Docker", "Per velocizzare le query del database"]', 1),
(3, 'Quale byte iniziale indica che stiamo catturando un pacchetto di tipo ''TLS Application Data'' (cifrato) in tcpdump?', '["0x16 (TLS Handshake)", "0x17 (TLS Application Data)", "0x01 (Client Hello)", "0x08 (HTTP Get)"]', 1);

-- Svuota le vecchie flashcard per evitare duplicati
TRUNCATE TABLE flashcards CASCADE;

-- 5. Inizializzazione Flashcards
INSERT INTO flashcards (category, term, definition) VALUES
('Hypervisor', 'Hypervisor Tipo-1 (Bare Metal)', 'Eseguito direttamente sul ferro (hardware fisico). Offre prestazioni massime e isolamento sicuro. Esempi commerciali includono VMware ESXi e Proxmox VE (KVM).'),
('Hypervisor', 'Hypervisor Tipo-2 (Hosted)', 'Eseguito come applicazione sopra un Sistema Operativo host (es. Windows, macOS). Ha un sovraccarico maggiore dovuto al kernel sottostante. Esempio classico: VirtualBox.'),
('Containerization', 'Namespaces di Linux', 'Una feature del kernel Linux che isola le risorse globali del sistema per un gruppo di processi. Fornisce l''illusione di un OS dedicato (es. isolando pid, net, mnt, uts, ipc, user).'),
('Containerization', 'Control Groups (cgroups)', 'Una feature del kernel Linux che limita, alloca e monitora l''utilizzo delle risorse fisiche (CPU, RAM, I/O su disco, rete) per i container, impedendo che uno saturi l''intero server.'),
('Service Mesh', 'Mutual TLS (mTLS)', 'Protocollo di sicurezza che garantisce l''autenticazione a due vie: sia il client che il server verificano reciprocamente i propri certificati X.509 prima di avviare il tunnel cifrato.'),
('Service Mesh', 'Envoy Proxy (Sidecar Pattern)', 'Proxy ad alte prestazioni distribuito a fianco di un''applicazione. Intercetta tutto il traffico di rete in entrata ed uscita (L7) per applicare mTLS, routing e tracciamento metriche.');
