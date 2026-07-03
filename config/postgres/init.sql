-- Schema del database per il microservizio api-content
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    questions INT NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL
);

-- Schema del database per il microservizio api-stats
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserimento dati iniziali didattici (Quiz)
INSERT INTO quizzes (title, questions, difficulty) VALUES
('Fondamenti di Virtualizzazione', 5, 'Facile'),
('Docker e Containerization', 8, 'Medio'),
('Service Mesh ed Envoy', 10, 'Difficile')
ON CONFLICT DO NOTHING;

-- Inserimento dati iniziali didattici (Flashcard)
INSERT INTO flashcards (term, definition) VALUES
('LXC', 'LinuX Containers, virtualizzazione a livello di sistema operativo.'),
('mTLS', 'Mutual TLS, autenticazione crittografica bidirezionale tra servizi.'),
('Sidecar', 'Proxy accoppiato a un servizio per gestirne il traffico di rete.')
ON CONFLICT DO NOTHING;
