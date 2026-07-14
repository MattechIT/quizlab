-- ==========================================================================
-- SCHEMA DEL DATABASE APPLICATIVO CON SUPPORTO USER-GENERATED CONTENT (UGC)
-- ==========================================================================

-- Tabella dei Moduli Quiz
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    questions INT NOT NULL DEFAULT 0,
    difficulty VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) DEFAULT 'global', -- Identifica l'utente proprietario ('global' o username dello studente)
    description TEXT, -- Descrizione/introduzione opzionale del quiz
    image_url TEXT -- Immagine di copertina opzionale
);

-- Tabella delle Domande correlate ai Quiz
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array JSON di stringhe con le risposte possibili
    correct_option INT NOT NULL, -- Indice della risposta corretta (0-based)
    explanation TEXT, -- Spiegazione didattica visualizzata in caso di errore
    image_url TEXT -- Immagine didattica opzionale per la domanda
);

-- Tabella dei Mazzi di Flashcards
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) DEFAULT 'global' -- Identifica il proprietario del mazzo ('global' o username)
);

-- Tabella delle Flashcard per lo studio teorico (collegate ai mazzi)
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INT REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    category VARCHAR(100), -- Opzionale (eredita di default il titolo del mazzo se omessa)
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    created_by VARCHAR(255) DEFAULT 'global', -- Identifica il proprietario della flashcard
    image_url TEXT -- Immagine esplicativa sul fronte
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

-- 1. Inizializzazione Moduli Quiz Globali
INSERT INTO quizzes (id, title, questions, difficulty, created_by, description) VALUES
(1, 'Fondamenti di Virtualizzazione', 5, 'Facile', 'global', 'Modulo introduttivo sui concetti chiave degli hypervisor, KVM e allocazione hardware.'),
(2, 'Docker e Containerization', 8, 'Medio', 'global', 'Concetti intermedi su namespaces, cgroups, configurazioni multi-stage build ed eco-policy di storage.'),
(3, 'Service Mesh ed Envoy', 10, 'Difficile', 'global', 'Tematiche avanzate su controllo del traffico L7, mTLS est-ovest e proxy sidecar in contesti Zero-Trust.')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  questions = EXCLUDED.questions, 
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description;

-- Svuota le vecchie domande per caricare quelle nuove con i campi di spiegazione
TRUNCATE TABLE questions CASCADE;

-- 2. Inizializzazione Domande: Fondamenti di Virtualizzazione (quiz_id = 1)
INSERT INTO questions (quiz_id, question_text, options, correct_option, explanation) VALUES
(1, 'Quale tipologia di hypervisor (Tipo-1 o Tipo-2) viene eseguita direttamente sull''hardware host fisico (bare-metal)?', '["Hypervisor Tipo-1 (es. Proxmox VE, VMware ESXi)", "Hypervisor Tipo-2 (es. VirtualBox, VMware Workstation)", "Nessuno dei due, girano entrambi sopra un OS", "I container Docker"]', 0, 'Gli hypervisor Tipo-1 girano direttamente sull''hardware fisico dell''host (bare-metal) per garantire massime prestazioni ed efficienza energetica, senza il sovraccarico di un sistema operativo host intermedio.'),
(1, 'In Proxmox VE, qual è il modulo del kernel Linux che permette la virtualizzazione completa con accelerazione hardware?', '["LXC (Linux Containers)", "KVM (Kernel-based Virtual Machine)", "QEMU (Quick Emulator)", "OpenVZ"]', 1, 'KVM (Kernel-based Virtual Machine) trasforma il kernel Linux in un hypervisor di tipo-1 consentendo la virtualizzazione nativa accelerata via hardware (Intel VT-x o AMD-V).'),
(1, 'Quale tecnologia hardware consente a una macchina virtuale di accedere direttamente a una risorsa PCI-Express fisica (es. scheda di rete) bypassando l''hypervisor?', '["Virtual Network Bridge", "SR-IOV (Single Root I/O Virtualization)", "NAT (Network Address Translation)", "VLAN Tagging"]', 1, 'SR-IOV consente a un singolo dispositivo fisico PCI-Express di apparire come più dispositivi virtuali indipendenti (Virtual Functions), permettendo alle VM di bypassare l''hypervisor per I/O a bassissima latenza.'),
(1, 'Cos''è la tecnica del memory ''ballooning'' all''interno di un hypervisor?', '["Un''allocazione fissa e immutabile di RAM allocata all''avvio", "Un driver guest che permette di liberare RAM inutilizzata dalla VM e restituirla all''hypervisor", "Un tipo di memoria di swap su disco SSD", "Una tecnica di compressione delle pagine di memoria CPU"]', 1, 'Il memory ballooning usa un driver installato nella VM (guest) per "gonfiarsi" di memoria inutilizzata, costringendo l''OS guest a liberarla affinché l''hypervisor possa riallocarla ad altre macchine virtuali.'),
(1, 'In ambiente KVM/QEMU, quale formato disco virtuale supporta nativamente l''allocazione dinamica (thin provisioning), gli snapshot e la crittografia?', '["RAW (.raw)", "VMDK (.vmdk)", "QCOW2 (.qcow2)", "VHD (.vhd)"]', 2, 'Il formato QCOW2 (QEMU Copy-On-Write 2) è lo standard di elezione per QEMU in quanto supporta nativamente snapshot, cifratura e allocazione dinamica dello spazio su disco.');

-- 3. Inizializzazione Domande: Docker e Containerization (quiz_id = 2)
INSERT INTO questions (quiz_id, question_text, options, correct_option, explanation) VALUES
(2, 'Quale primitiva del kernel Linux fornisce l''isolamento dello stack di rete, del file system e dei PID per un container?', '["Control Groups (cgroups)", "Linux Namespaces", "Chroot jail", "AppArmor"]', 1, 'I Namespaces di Linux isolano le risorse di sistema globali a livello di processo. Ad esempio, il PID namespace nasconde gli altri processi e il NET namespace crea uno stack di rete dedicato.'),
(2, 'Quale primitiva del kernel Linux si occupa invece di porre limiti fisici all''uso di CPU, RAM e I/O su disco per un container?', '["Linux Namespaces", "Seccomp Profiles", "Control Groups (cgroups)", "Capabilities"]', 2, 'I Control Groups (cgroups) limitano e monitorano l''utilizzo delle risorse hardware (CPU, RAM, disco) dei processi del container, impedendo blocchi da esaurimento risorse.'),
(2, 'Nel file Dockerfile, qual è l''obiettivo principale nell''utilizzare il pattern ''Multi-stage Build''?', '["Compilare l''app su più server contemporaneamente", "Ridurre l''impronta di memoria dell''immagine finale escludendo i compilatori ed i tool di sviluppo", "Evitare di usare il demone Docker", "Migliorare la velocità della cache DNS"]', 1, 'Le build multi-stage consentono di dividere la build in stadi separati. Lo stadio finale conterrà solo l''eseguibile finale e i runtime necessari, escludendo SDK o compilatori per mantenere l''immagine leggera e sicura.'),
(2, 'In Docker, a cosa serve il driver di storage grafico di default denominato ''overlay2''?', '["A connettere container su macchine fisiche diverse", "A sovrapporre layer di file system a sola lettura con un layer di scrittura (Copy-On-Write)", "A fare il backup dei volumi sul cloud", "Ad accelerare il rendering grafico 3D"]', 1, 'Il driver overlay2 combina più layer di filesystem in un''unica vista logica, gestendo i layer a sola lettura dell''immagine ed un layer scrivibile in cima con logica Copy-On-Write (COW).'),
(2, 'Che differenza c''è tra le istruzioni ENTRYPOINT e CMD in un Dockerfile?', '["ENTRYPOINT definibile l''eseguibile fisso del container; CMD definisce i parametri di default sovrascrivibili", "CMD definisce l''eseguibile fisso; ENTRYPOINT definisce le variabili d''ambiente", "Sono perfettamente identiche e intercambiabili", "ENTRYPOINT serve solo in fase di build, CMD solo in esecuzione"]', 0, 'ENTRYPOINT stabilisce il comando principale ed immutabile che verrà avviato nel container. CMD stabilisce gli argomenti di default passati a ENTRYPOINT, che l''utente può sovrascrivere all''avvio.'),
(2, 'In base all''Eco-Policy del nostro progetto, quale dei seguenti accorgimenti è obbligatorio nel docker-compose.yml per proteggere lo storage SSD?', '["Riavviare i container ogni ora", "Impostare il logging su stdout e abilitare la rotazione automatica (max-size: 10m) sul demone Docker", "Non usare volumi persistenti", "Eseguire solo immagini basate su Ubuntu"]', 1, 'Scrivere log costantemente su file fisici locali genera un logorio continuo (write-wear) sulla memoria flash SSD. L''eco-policy impone l''uso di stdout/stderr combinato con la rotazione dei log gestita da Docker.'),
(2, 'Cos''è un''immagine Docker definita ''distroless''?', '["Un container privo di indirizzo IP", "Un''immagine minimale che contiene esclusivamente l''applicazione e le sue dipendenze, senza shell Bash o utility di sistema", "Un''immagine corrotta che non può essere avviata", "Un container che non salva log su disco"]', 1, 'Le immagini distroless contengono solo l''applicazione e le dipendenze minime di sistema. Non ospitando shell (sh/bash) né utility comuni come cat o curl, minimizzano la superficie d''attacco di sicurezza.'),
(2, 'In Docker Compose, configurare ''network_mode: service:api-content'' su un container sidecar comporta:', '["Che il sidecar condivide l''interfaccia di rete (e l''interfaccia loopback/localhost) del servizio api-content", "Che il sidecar gestisce il DNS del database", "Che api-content viene spento all''avvio del sidecar", "Che i log dei due container vengono uniti in un unico file fisico"]', 0, 'Il sidecar viene inserito nello stesso identico namespace di rete di api-content. Questo consente loro di parlare tramite localhost, in modo che il sidecar possa intercettare e gestire il traffico in trasparenza.');

-- 4. Inizializzazione Domande: Service Mesh ed Envoy (quiz_id = 3)
INSERT INTO questions (quiz_id, question_text, options, correct_option, explanation) VALUES
(3, 'A quale livello del modello OSI opera principalmente il proxy Envoy per gestire e ispezionare il traffico delle API?', '["Livello 3 (Rete)", "Livello 4 (Trasporto)", "Livello 7 (Applicazione - HTTP, gRPC, TLS)", "Livello 2 (Collegamento Dati)"]', 2, 'Envoy opera principalmente a Livello 7. Ciò gli consente di comprendere le richieste HTTP (es. percorsi URI, intestazioni) e gRPC, oltre che di gestire la terminazione e validazione dei tunnel TLS.'),
(3, 'Qual è il meccanismo con cui la Service Mesh implementa l''autenticazione mutua (mTLS) est-ovest?', '["Inserendo una password in chiaro in ogni header HTTP", "Entrambi i proxy (client e server) convalidano a vicenda i rispettivi certificati crittografici X.509 firmati dalla stessa CA fidata", "Usando una rete VPN IPsec", "Bloccando le porte TCP tramite iptables"]', 1, 'In una Service Mesh con mTLS, sia il proxy di invio (client) che quello di ricezione (server) presentano e convalidano reciprocamente i propri certificati X.509 firmati da una CA comune prima di scambiare dati.'),
(3, 'In una configurazione statica di Envoy, cos''è un ''Cluster''?', '["Un insieme di macchine virtuali Proxmox", "Un gruppo di host logici a monte (upstream) ai quali Envoy instrada il traffico di rete", "Un''interfaccia grafica per monitorare la memoria", "Un tipo di certificato X.509 client"]', 1, 'Un Cluster in Envoy definisce un gruppo di host/servizi a monte (upstream) con le relative configurazioni di bilanciamento del carico, timeout e parametri di sicurezza (es. TLS).'),
(3, 'Quale componente di una Service Mesh fa parte del ''Data Plane'' (Piano Dati)?', '["Il proxy Sidecar (es. Envoy) installato accanto all''applicazione", "L''orchestratore Istiod / Consul Control Plane", "Il database PostgreSQL del server SSO", "Il pannello di controllo amministrativo di Keycloak"]', 0, 'Il Data Plane è composto esclusivamente dai proxy sidecar intermedi che intercettano fisicamente, filtrano e instradano i pacchetti di rete scambiati tra i microservizi.'),
(3, 'Come fa l''Envoy client (egress) a validare l''identità del server a cui si connette nel cluster di statistiche?', '["Controlla se il server risponde in meno di 10ms", "Confronta il Subject Alternative Name (SAN) del certificato ricevuto con i valori consentiti (es. api-stats)", "Chiede al DNS di confermare l''indirizzo IP", "Usa il token JWT estratto da Keycloak"]', 1, 'Envoy client convalida l''identità del server verificando che il certificato ricevuto includa il Subject Alternative Name (SAN) configurato nel cluster (es. api-stats), sventando attacchi di impersonazione.'),
(3, 'In Envoy, quale parametro del DownstreamTlsContext forza l''mTLS respingendo connessioni prive di certificato client?', '["require_client_certificate: true", "forward_client_cert: always", "validation_context.trusted_ca", "allow_expired: false"]', 0, 'Il parametro require_client_certificate: true all''interno di DownstreamTlsContext impone al proxy di negoziare la cifratura mutua, rifiutando ogni connessione che non presenti un certificato client valido.'),
(3, 'In una configurazione Envoy, a cosa serve il blocco ''admin'' configurato sulla porta 9901 o 9902?', '["Ad accedere a Keycloak", "A fornire una console locale (e metriche Prometheus) per ispezionare stato, cluster e statistiche del proxy", "A connettersi al database di PostgreSQL", "A modificare le chiavi crittografiche a caldo"]', 1, 'La porta admin di Envoy offre un''interfaccia locale di ispezione da cui è possibile scaricare le metriche per Prometheus, visualizzare lo stato della mesh e forzare il reload delle configurazioni.'),
(3, 'Quale comando permette di verificare a basso livello che la comunicazione est-ovest sia cifrata catturando i pacchetti sulla rete?', '["docker compose logs", "tcpdump -i <interfaccia> -X port <porta>", "curl -I https://localhost", "ping api-stats"]', 1, 'tcpdump permette di catturare ed esaminare i pacchetti a basso livello. Sniffando la porta mTLS (es. 5002) in modalità esadecimale (-X), vedremo solo l''handshake iniziale e poi dati cifrati illeggibili.'),
(3, 'Perché in una Service Mesh Zero-Trust l''applicazione backend (es. api-stats) viene configurata per ascoltare su 127.0.0.1?', '["Per risparmiare RAM sull''LXC", "Per impedire che altri container della rete bypassino il sidecar Envoy, forzando tutto il traffico a passare dal controllo mTLS", "Perché non ha i driver per la scheda di rete Docker", "Per velocizzare le query del database"]', 1, 'Associando il backend a localhost (127.0.0.1), l''app non risponderà ad altre interfacce di rete. L''unico modo per contattarla è passare dal proxy locale Envoy, garantendo che mTLS sia ineludibile.'),
(3, 'Quale byte iniziale indica che stiamo catturando un pacchetto di tipo ''TLS Application Data'' (cifrato) in tcpdump?', '["0x16 (TLS Handshake)", "0x17 (TLS Application Data)", "0x01 (Client Hello)", "0x08 (HTTP Get)"]', 1, 'Il byte 0x17 (decimale 23) identifica i record TLS che trasportano "Application Data" cifrati. I record di handshake (es. Client Hello) iniziano invece con il byte 0x16 (decimale 22).');

-- 5. Inizializzazione Mazzi di Flashcard Globali
INSERT INTO flashcard_decks (id, title, description, created_by) VALUES
(1, 'Virtualizzazione & Hypervisor', 'Termini fondamentali su Hypervisor Tipo-1 e 2, KVM, SR-IOV e memory ballooning.', 'global'),
(2, 'Docker & Containerization', 'Concetti su Namespaces, cgroups, configurazioni Dockerfile ed overlay2.', 'global'),
(3, 'Service Mesh & Envoy', 'Architetture Zero-Trust, proxy Envoy, sidecar pattern e TLS bidirezionale.', 'global')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  description = EXCLUDED.description;

-- Svuota le vecchie flashcard per ri-popolarle con la nuova chiave esterna deck_id
TRUNCATE TABLE flashcards CASCADE;

-- 6. Inizializzazione Flashcards Globali (collegate ai rispettivi mazzi)
INSERT INTO flashcards (deck_id, category, term, definition, created_by) VALUES
(1, 'Hypervisor', 'Hypervisor Tipo-1 (Bare Metal)', 'Eseguito direttamente sul ferro (hardware fisico). Offre prestazioni massime e isolamento sicuro. Esempi commerciali includono VMware ESXi e Proxmox VE (KVM).', 'global'),
(1, 'Hypervisor', 'Hypervisor Tipo-2 (Hosted)', 'Eseguito come applicazione sopra un Sistema Operativo host (es. Windows, macOS). Ha un sovraccarico maggiore dovuto al kernel sottostante. Esempio classico: VirtualBox.', 'global'),
(2, 'Containerization', 'Namespaces di Linux', 'Una feature del kernel Linux che isola le risorse globali del sistema per un gruppo di processi. Fornisce l''illusione di un OS dedicato (es. isolando pid, net, mnt, uts, ipc, user).', 'global'),
(2, 'Containerization', 'Control Groups (cgroups)', 'Una feature del kernel Linux che limita, alloca e monitora l''utilizzo delle risorse fisiche (CPU, RAM, I/O su disco, rete) per i container, impedendo che uno saturi l''intero server.', 'global'),
(3, 'Service Mesh', 'Mutual TLS (mTLS)', 'Protocollo di sicurezza che garantisce l''autenticazione a due vie: sia il client che il server verificano reciprocamente i propri certificati X.509 prima di avviare il tunnel cifrato.', 'global'),
(3, 'Service Mesh', 'Envoy Proxy (Sidecar Pattern)', 'Proxy ad alte prestazioni distribuito a fianco di un''applicazione. Intercetta tutto il traffico di rete in entrata ed uscita (L7) per applicare mTLS, routing e tracciamento metriche.', 'global');

-- ==========================================================================
-- RISINCRONIZZAZIONE DELLE SEQUENZE AUTOINCREMENTALI (setval)
-- ==========================================================================
SELECT setval('quizzes_id_seq', (SELECT MAX(id) FROM quizzes));
SELECT setval('questions_id_seq', COALESCE((SELECT MAX(id) FROM questions), 1));
SELECT setval('flashcard_decks_id_seq', (SELECT MAX(id) FROM flashcard_decks));
SELECT setval('flashcards_id_seq', COALESCE((SELECT MAX(id) FROM flashcards), 1));
