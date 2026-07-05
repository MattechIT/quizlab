import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import QuizRunnerHeader from './quizRunner/QuizRunnerHeader';
import QuizLoadingState from './quizRunner/QuizLoadingState';
import QuizErrorState from './quizRunner/QuizErrorState';
import QuizQuestionCard from './quizRunner/QuizQuestionCard';

export default function QuizRunner({ quizId, onComplete, onCancel }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);

  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/quiz/${quizId}/questions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Impossibile caricare le domande dal database.');
        }
        return res.json();
      })
      .then((data) => {
        setQuestions(data.questions || []);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[ERROR] Errore nel caricamento delle domande:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (loading || error || questions.length === 0) return;

    setTimeLeft(30);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextQuestion(true);
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

    const selected = isTimeout ? -1 : selectedOption;
    const updatedAnswers = [...userAnswers, selected];
    setUserAnswers(updatedAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = !isTimeout && selectedOption === currentQuestion.correct;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setSelectedOption(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
      const finalScore = Math.round((finalCorrectCount / questions.length) * 100);
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete(finalScore, updatedAnswers);
    }
  };

  if (loading) {
    return <QuizLoadingState message="Caricamento domande dal database applicativo..." />;
  }

  if (error || questions.length === 0) {
    return <QuizErrorState error={error} onCancel={onCancel} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = Math.round((currentQuestionIndex / questions.length) * 100);
  const timeProgressPercent = (timeLeft / 30) * 100;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '680px', paddingBottom: '40px' }}>
      <QuizRunnerHeader
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onCancel={onCancel}
      />

      <QuizQuestionCard
        currentQuestion={currentQuestion}
        selectedOption={selectedOption}
        onOptionSelect={handleOptionSelect}
        timeLeft={timeLeft}
        progressPercent={progressPercent}
        timeProgressPercent={timeProgressPercent}
      />

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