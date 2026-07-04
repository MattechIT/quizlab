import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function QuizRunner({ quizId, onComplete, onCancel }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 secondi a domanda

  const timerRef = useRef(null);

  // Carica le domande dal database tramite il Gateway delle API
  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/quiz/${quizId}/questions`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Impossibile caricare le domande dal database.");
        }
        return res.json();
      })
      .then(data => {
        setQuestions(data.questions || []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("[ERROR] Errore nel caricamento delle domande:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  // Gestione del Timer per le domande
  useEffect(() => {
    if (loading || error || questions.length === 0) return;
    
    // Inizializza il timer a 30s per la domanda corrente
    setTimeLeft(30);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextQuestion(true); // Passa alla successiva per timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, loading, error, questions.length]);

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = (isTimeout = false) => {
    if (!isTimeout && selectedOption === null) return;

    // Controlla se la risposta data è corretta
    const currentQuestion = questions[currentQuestionIndex];
    if (!isTimeout && selectedOption === currentQuestion.correct) {
      setCorrectCount((prev) => prev + 1);
    }

    // Pulisci lo stato di selezione per la prossima domanda
    setSelectedOption(null);

    // Gestione transizione o completamento del quiz
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Fine quiz: calcola punteggio finale in percentuale ed invia ad App.jsx
      const finalScore = Math.round(( (isTimeout ? correctCount : (selectedOption === currentQuestion.correct ? correctCount + 1 : correctCount)) / questions.length) * 100);
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete(finalScore);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Caricamento domande dal database applicativo...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '60px 0' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>Errore di Connessione</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
          {error || "Nessuna domanda trovata per questo modulo nel database."}
        </p>
        <button onClick={onCancel} className="btn btn-secondary">Torna alla Dashboard</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex) / questions.length) * 100);
  const timeProgressPercent = (timeLeft / 30) * 100;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '680px', paddingBottom: '40px' }}>
      {/* HEADER QUIZ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-hover)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Esecuzione Quiz
          </span>
          <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>Domanda {currentQuestionIndex + 1} di {questions.length}</h2>
        </div>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          Annulla
        </button>
      </div>

      {/* BARRA DI PROGRESSO DOMANDE */}
      <div style={{ width: '100%', height: '4px', backgroundColor: '#18181b', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden', border: '1px solid #27272a' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.3s ease' }}></div>
      </div>

      {/* BOX DOMANDA */}
      <div className="card" style={{ marginBottom: '24px' }}>
        {/* TIMER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Seleziona la risposta corretta:
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{timeLeft}s</span>
          </div>
        </div>

        {/* BARRA TIMER */}
        <div style={{ width: '100%', height: '2px', backgroundColor: '#1f1f1f', marginBottom: '24px' }}>
          <div style={{ 
            width: `${timeProgressPercent}%`, 
            height: '100%', 
            backgroundColor: timeLeft <= 10 ? 'var(--danger)' : 'var(--accent-hover)', 
            transition: 'width 1s linear' 
          }}></div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.4', marginBottom: '32px', color: 'var(--text-primary)' }}>
          {currentQuestion.q}
        </h3>

        {/* OPZIONI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedOption === idx ? 'var(--accent)' : 'var(--card-border)',
                backgroundColor: selectedOption === idx ? 'rgba(124, 58, 237, 0.05)' : '#161616',
                color: selectedOption === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: selectedOption === idx ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: selectedOption === idx ? 'var(--accent)' : 'var(--text-muted)'
                }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span style={{ flex: 1 }}>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NAVIGAZIONE DOMANDE */}
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <button
          onClick={() => handleNextQuestion(false)}
          disabled={selectedOption === null}
          className="btn btn-primary"
          style={{ padding: '12px 24px' }}
        >
          {currentQuestionIndex + 1 === questions.length ? 'Termina Quiz' : 'Prossima Domanda'} 
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
