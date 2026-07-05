import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ResultSummary from '../components/results/ResultSummary';
import ResultReview from '../components/results/ResultReview';
import ResultHistory from '../components/results/ResultHistory';

export default function Results({ quizId, score, userAnswers = [], username, onRestart }) {
  const [submitting, setSubmitting] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loadingReview, setLoadingReview] = useState(true);

  const quizNames = {
    1: 'Fondamenti di Virtualizzazione',
    2: 'Docker e Containerization',
    3: 'Service Mesh ed Envoy'
  };

  const submitScore = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, score })
      });

      if (!res.ok) {
        throw new Error('Salvataggio fallito sul server.');
      }

      setSubmitError(null);
      fetchHistory();
    } catch (err) {
      console.error('[ERROR] Errore salvataggio punteggio:', err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/v1/quiz/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('[ERROR] Errore recupero storico:', err);
    } finally {
      setLoadingHistory(false);
      setSubmitting(false);
    }
  };

  const fetchQuizDetailsForReview = async () => {
    try {
      setLoadingReview(true);
      const quizRes = await fetch('/api/v1/quiz');
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        const currentQuiz = quizData.data?.find((q) => q.id === quizId);
        if (currentQuiz) {
          setQuizTitle(currentQuiz.title);
        }
      }

      const questionsRes = await fetch(`/api/v1/quiz/${quizId}/questions`);
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }
    } catch (err) {
      console.error('[ERROR] Errore nel caricamento dei dati di review:', err);
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
      <ResultSummary
        quizTitle={activeTitle}
        score={score}
        isPassed={isPassed}
        submitting={submitting}
        submitError={submitError}
      />

      <ResultReview
        loadingReview={loadingReview}
        questions={questions}
        userAnswers={userAnswers}
      />

      <ResultHistory
        username={username}
        loadingHistory={loadingHistory}
        history={history}
        quizNames={quizNames}
      />

      <button onClick={onRestart} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
        Torna alla Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}
