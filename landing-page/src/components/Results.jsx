import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  ArrowRight, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';

export default function Results({ quizId, score, userAnswers = [], username, onRestart }) {
  const [submitting, setSubmitting] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Dati per la revisione del quiz
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loadingReview, setLoadingReview] = useState(true);

  const quizNames = {
    1: "Fondamenti di Virtualizzazione",
    2: "Docker e Containerization",
    3: "Service Mesh ed Envoy"
  };

  // 1. Sottomissione automatica del punteggio appena completato
  const submitScore = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quizId, score })
      });
      
      if (!res.ok) {
        throw new Error("Salvataggio fallito sul server.");
      }
      
      setSubmitError(null);
      // Dopo il salvataggio, scarica lo storico aggiornato
      fetchHistory();
    } catch (err) {
      console.error("[ERROR] Errore salvataggio punteggio:", err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  // 2. Recupero dello storico dei tentativi da api-stats tramite api-content (mTLS)
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/v1/quiz/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("[ERROR] Errore recupero storico:", err);
    } finally {
      setLoadingHistory(false);
      setSubmitting(false);
    }
  };

  // 3. Recupero delle domande e metadati del quiz corrente per la review
  const fetchQuizDetailsForReview = async () => {
    try {
      setLoadingReview(true);
      // Cerca il titolo del quiz dall'elenco generale dei quiz (sia globale che personale)
      const quizRes = await fetch('/api/v1/quiz');
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const currentQuiz = quizData.data?.find(q => q.id === quizId);
        if (currentQuiz) {
          setQuizTitle(currentQuiz.title);
        }
      }

      // Recupera le domande
      const questionsRes = await fetch(`/api/v1/quiz/${quizId}/questions`);
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }
    } catch (err) {
      console.error("[ERROR] Errore nel caricamento dei dati di review:", err);
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    submitScore();
    fetchQuizDetailsForReview();
  }, [quizId, score]);

  const isPassed = score >= 70;
  const activeTitle = quizTitle || quizNames[quizId] || `Modulo #${quizId}`;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '640px', paddingBottom: '40px' }}>
      {/* CARD RISULTATO CORRENTE */}
      <div className="card" style={{
        textAlign: 'center',
        background: 'linear-gradient(180deg, #121212 0%, #161616 100%)',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Cerchio colorato di sfondo sfumato in base all'esito */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          background: isPassed ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: isPassed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '20px' }}>
          {isPassed ? <CheckCircle2 size={32} style={{ color: 'var(--success)' }} /> : <XCircle size={32} style={{ color: 'var(--danger)' }} />}
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
          {isPassed ? 'Modulo Superato!' : 'Punteggio Insufficiente'}
        </h2>
        
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Hai completato il test su <strong>{activeTitle}</strong>
        </p>

        {/* CERCHIO PUNTEGGIO */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '4px solid',
          borderColor: isPassed ? 'var(--success)' : 'var(--danger)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: isPassed ? '0 0 20px rgba(16, 185, 129, 0.15)' : '0 0 20px rgba(239, 68, 68, 0.15)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{score}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Score</span>
        </div>

        {/* FEEDBACK SALVATAGGIO */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {submitting && (
            <>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Salvataggio risultati in corso...</span>
            </>
          )}
          {!submitting && !submitError && (
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Risultati persistiti nel database PostgreSQL
            </span>
          )}
          {submitError && (
            <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={14} /> Errore di connessione: {submitError}
            </span>
          )}
        </div>
      </div>

      {/* ==========================================
         SEZIONE REVISIONE RISPOSTE E SPIEGAZIONI
         ========================================== */}
      {loadingReview ? (
        <div className="card" style={{ marginBottom: '32px', textAlign: 'center', padding: '24px 0' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Elaborazione riepilogo didattico...</p>
        </div>
      ) : questions.length > 0 ? (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-hover)' }} /> Revisione Risposte & Spiegazioni
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((q, qIdx) => {
              const userAnswerIdx = userAnswers[qIdx];
              const isCorrect = userAnswerIdx === q.correct;
              
              return (
                <div key={qIdx} style={{
                  padding: '16px',
                  backgroundColor: '#141414',
                  border: '1px solid',
                  borderColor: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px'
                }}>
                  {/* Numero Domanda e Esito */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Domanda {qIdx + 1}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isCorrect ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {isCorrect ? 'Corretta' : 'Errata'}
                    </span>
                  </div>

                  {/* Immagine didattica opzionale */}
                  {q.image_url && (
                    <div style={{
                      width: '100%',
                      height: '140px',
                      backgroundImage: `url(${q.image_url})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      borderRadius: '6px',
                      backgroundColor: '#0a0a0a',
                      border: '1px solid var(--card-border)',
                      marginBottom: '12px'
                    }}></div>
                  )}

                  <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.4' }}>
                    {q.q}
                  </h4>

                  {/* Opzioni della domanda evidenziate */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: q.explanation ? '16px' : '0' }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserSelected = userAnswerIdx === optIdx;
                      const isCorrectOpt = q.correct === optIdx;
                      
                      let optBg = '#0d0d0d';
                      let optBorder = 'var(--card-border)';
                      let optColor = 'var(--text-secondary)';

                      if (isCorrectOpt) {
                        optBg = 'rgba(16, 185, 129, 0.05)';
                        optBorder = 'var(--success)';
                        optColor = 'var(--success)';
                      } else if (isUserSelected && !isCorrectOpt) {
                        optBg = 'rgba(239, 68, 68, 0.05)';
                        optBorder = 'var(--danger)';
                        optColor = 'var(--danger)';
                      }

                      return (
                        <div key={optIdx} style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: optBorder,
                          backgroundColor: optBg,
                          color: optColor,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontWeight: '700' }}>{String.fromCharCode(65 + optIdx)})</span>
                          <span style={{ flex: 1 }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Spiegazione didattica se presente */}
                  {q.explanation && (
                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: '#0d0d0d',
                      borderLeft: '3px solid var(--accent-hover)',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.4'
                    }}>
                      <strong style={{ color: 'var(--accent-hover)' }}>Spiegazione didattica:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* SEZIONE STORICO TENTATIVI */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} style={{ color: 'var(--accent-hover)' }} /> Storico Tentativi ({username})
        </h3>

        {loadingHistory ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            Caricamento storico in corso...
          </p>
        ) : history.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            Nessun tentativo salvato per questo modulo.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
            {history.map((attempt) => {
              const attemptPassed = attempt.score >= 70;
              const dateStr = new Date(attempt.completed_at).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <div key={attempt.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#161616',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {quizNames[attempt.quiz_id] || `Modulo #${attempt.quiz_id}`}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Calendar size={12} /> {dateStr}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: attemptPassed ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {attempt.score}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTONE RIPARTENZA */}
      <button onClick={onRestart} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
        Torna alla Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}
