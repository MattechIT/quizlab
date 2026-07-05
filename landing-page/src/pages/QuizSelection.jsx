import React, { useState } from 'react';
import {
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Trophy,
  Cpu,
  Layers,
  Network,
  Plus,
  BookOpenCheck,
  UserCheck,
} from 'lucide-react';
import QuizSelectionCard from './quizSelection/QuizSelectionCard';
import CreateQuizModal from './quizSelection/CreateQuizModal';
import EditQuizModal from './quizSelection/EditQuizModal';
import ManageQuestionsModal from './quizSelection/ManageQuestionsModal';
import EditQuestionModal from './quizSelection/EditQuestionModal';
import CreateQuestionModal from './quizSelection/CreateQuestionModal';

export default function QuizSelection({ quizzes, onSelectQuiz, onViewFlashcards, onRefresh, onBack }) {
  // Stati per il controllo dei modali di inserimento
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuizIdForQuestion, setSelectedQuizIdForQuestion] = useState(null);

  // Stati per la gestione del quiz (Modifica metadati)
  const [showEditQuizModal, setShowEditQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Stati del form Creazione Quiz
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDifficulty, setNewQuizDifficulty] = useState('Facile');
  const [newQuizDescription, setNewQuizDescription] = useState('');
  const [newQuizImageUrl, setNewQuizImageUrl] = useState('');

  // Stati del form Modifica Quiz
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizDifficulty, setEditQuizDifficulty] = useState('Facile');
  const [editQuizDescription, setEditQuizDescription] = useState('');
  const [editQuizImageUrl, setEditQuizImageUrl] = useState('');

  // Stati del form Aggiunta Domanda
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOption, setCorrectOption] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [questionImageUrl, setQuestionImageUrl] = useState('');

  // Stati per il pannello "Gestisci Domande"
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageQuiz, setManageQuiz] = useState(null);
  const [manageQuestions, setManageQuestions] = useState([]);
  const [loadingManageQuestions, setLoadingManageQuestions] = useState(false);

  // Stati del form Modifica Domanda
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptA, setEditOptA] = useState('');
  const [editOptB, setEditOptB] = useState('');
  const [editOptC, setEditOptC] = useState('');
  const [editOptD, setEditOptD] = useState('');
  const [editCorrectOption, setEditCorrectOption] = useState(0);
  const [editExplanation, setEditExplanation] = useState('');
  const [editQuestionImageUrl, setEditQuestionImageUrl] = useState('');

  // Stati di caricamento
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [updatingQuiz, setUpdatingQuiz] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);

  const getQuizMetadata = (id, createdBy) => {
    if (createdBy !== 'global') {
      return {
        icon: <BookOpenCheck size={24} style={{ color: 'var(--accent-hover)' }} />,
        desc: "Modulo personalizzato creato da te. Aggiungi domande per esercitarti."
      };
    }
    
    switch (id) {
      case 1:
        return {
          icon: <Cpu size={24} style={{ color: '#60a5fa' }} />,
          desc: "Architetture hypervisor Type-1 e Type-2, macchine virtuali, ottimizzazione hardware e isolamento delle risorse."
        };
      case 2:
        return {
          icon: <Layers size={24} style={{ color: '#34d399' }} />,
          desc: "Teoria dei container, namespaces e cgroups, ottimizzazione di Dockerfile multi-stage ed eco-policy di storage."
        };
      case 3:
        return {
          icon: <Network size={24} style={{ color: '#a78bfa' }} />,
          desc: "Data plane L7 con Envoy, handshake mutuo TLS (mTLS), sniffing dei pacchetti crittografati e architetture Zero-Trust."
        };
      default:
        return {
          icon: <HelpCircle size={24} style={{ color: '#a1a1aa' }} />,
          desc: "Metti alla prova le tue conoscenze tecniche su argomenti di cloud e virtualizzazione."
        };
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'facile':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'medio':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
      case 'difficile':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      default:
        return { bg: 'rgba(124, 58, 237, 0.1)', text: '#7c3aed', border: 'rgba(124, 58, 237, 0.2)' };
    }
  };

  // Creazione Nuovo Quiz (POST)
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuizTitle || !newQuizDifficulty) return;

    try {
      setSubmittingQuiz(true);
      const response = await fetch('/api/v1/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newQuizTitle,
          difficulty: newQuizDifficulty,
          description: newQuizDescription,
          imageUrl: newQuizImageUrl
        })
      });

      if (response.ok) {
        setShowQuizModal(false);
        // Resetta form
        setNewQuizTitle('');
        setNewQuizDescription('');
        setNewQuizImageUrl('');
        // Rinfresca la lista
        if (onRefresh) onRefresh();
      } else {
        if (window.customAlert) window.customAlert("Errore durante la creazione del quiz.");
        else alert("Errore durante la creazione del quiz.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Modifica Quiz Esistente (PUT)
  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!editQuizTitle || !editQuizDifficulty || !editingQuiz) return;

    try {
      setUpdatingQuiz(true);
      const response = await fetch(`/api/v1/quiz/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editQuizTitle,
          difficulty: editQuizDifficulty,
          description: editQuizDescription,
          imageUrl: editQuizImageUrl
        })
      });

      if (response.ok) {
        setShowEditQuizModal(false);
        setEditingQuiz(null);
        if (onRefresh) onRefresh();
      } else {
        if (window.customAlert) window.customAlert("Errore durante l'aggiornamento del quiz.");
        else alert("Errore durante l'aggiornamento del quiz.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setUpdatingQuiz(false);
    }
  };

  // Eliminazione Quiz (DELETE)
  const handleDeleteQuiz = async (quizId) => {
    const deleteAction = async () => {
      try {
        const response = await fetch(`/api/v1/quiz/${quizId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          if (onRefresh) onRefresh();
        } else {
          if (window.customAlert) window.customAlert("Errore durante l'eliminazione del quiz.");
          else alert("Errore durante l'eliminazione del quiz.");
        }
      } catch (err) {
        console.error(err);
        if (window.customAlert) window.customAlert("Errore di rete.");
        else alert("Errore di rete.");
      }
    };

    if (window.customConfirm) {
      window.customConfirm("Sei sicuro di voler eliminare questo quiz e tutte le sue domande in modo permanente?", deleteAction);
    } else {
      if (window.confirm("Sei sicuro di voler eliminare questo quiz e tutte le sue domande in modo permanente?")) {
        deleteAction();
      }
    }
  };

  // Caricamento domande per il pannello "Gestisci Domande"
  const loadManageQuestions = async (quizId) => {
    try {
      setLoadingManageQuestions(true);
      const res = await fetch(`/api/v1/quiz/${quizId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setManageQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("[ERROR] Impossibile caricare le domande del manager:", err);
    } finally {
      setLoadingManageQuestions(false);
    }
  };

  // Apertura pannello "Gestisci Domande"
  const handleOpenManage = (quiz) => {
    setManageQuiz(quiz);
    loadManageQuestions(quiz.id);
    setShowManageModal(true);
  };

  // Eliminazione Domanda (DELETE)
  const handleDeleteQuestion = async (questionId) => {
    const deleteAction = async () => {
      try {
        const response = await fetch(`/api/v1/questions/${questionId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Rinfresca il manager e la dashboard
          await loadManageQuestions(manageQuiz.id);
          if (onRefresh) onRefresh();
        } else {
          if (window.customAlert) window.customAlert("Errore durante l'eliminazione della domanda.");
          else alert("Errore durante l'eliminazione della domanda.");
        }
      } catch (err) {
        console.error(err);
        if (window.customAlert) window.customAlert("Errore di rete.");
        else alert("Errore di rete.");
      }
    };

    if (window.customConfirm) {
      window.customConfirm("Sei sicuro di voler eliminare questa domanda dal quiz?", deleteAction);
    } else {
      if (window.confirm("Sei sicuro di voler eliminare questa domanda dal quiz?")) {
        deleteAction();
      }
    }
  };

  // Apertura form di modifica domanda
  const handleEditQuestionClick = (question) => {
    setEditingQuestion(question);
    setEditQuestionText(question.q);
    setEditOptA(question.options[0] || '');
    setEditOptB(question.options[1] || '');
    setEditOptC(question.options[2] || '');
    setEditOptD(question.options[3] || '');
    setEditCorrectOption(question.correct);
    setEditExplanation(question.explanation || '');
    setEditQuestionImageUrl(question.image_url || '');
    setShowEditQuestionModal(true);
  };

  // Aggiornamento Domanda (PUT)
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    if (!editQuestionText || !editOptA || !editOptB || !editOptC || !editOptD || !editingQuestion) return;

    try {
      setUpdatingQuestion(true);
      const response = await fetch(`/api/v1/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionText: editQuestionText,
          options: [editOptA, editOptB, editOptC, editOptD],
          correctOption: parseInt(editCorrectOption),
          explanation: editExplanation,
          imageUrl: editQuestionImageUrl
        })
      });

      if (response.ok) {
        setShowEditQuestionModal(false);
        setEditingQuestion(null);
        // Rinfresca il manager e la dashboard
        await loadManageQuestions(manageQuiz.id);
        if (onRefresh) onRefresh();
      } else {
        if (window.customAlert) window.customAlert("Errore durante la modifica della domanda.");
        else alert("Errore durante la modifica della domanda.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setUpdatingQuestion(false);
    }
  };

  // Aggiunta Domanda al Quiz Personale (POST)
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!questionText || !optA || !optB || !optC || !optD) return;

    try {
      setSubmittingQuestion(true);
      const response = await fetch(`/api/v1/quiz/${selectedQuizIdForQuestion}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionText,
          options: [optA, optB, optC, optD],
          correctOption: parseInt(correctOption),
          explanation,
          imageUrl: questionImageUrl
        })
      });

      if (response.ok) {
        setShowQuestionModal(false);
        // Resetta form
        setNewQuizTitle(''); // non necessario ma ok
        setQuestionText('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setCorrectOption(0);
        setExplanation('');
        setQuestionImageUrl('');
        // Rinfresca la lista sia sul manager che sulla dashboard
        if (manageQuiz) {
          await loadManageQuestions(manageQuiz.id);
        }
        if (onRefresh) onRefresh();
      } else {
        if (window.customAlert) window.customAlert("Errore nell'aggiunta della domanda.");
        else alert("Errore nell'aggiunta della domanda.");
      }
    } catch (err) {
      console.error(err);
      if (window.customAlert) window.customAlert("Errore di rete.");
      else alert("Errore di rete.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* HEADER DELLA GRIGLIA QUIZ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <ArrowLeft size={16} /> Torna
        </button>

        <button 
          onClick={() => setShowQuizModal(true)} 
          className="btn btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <Plus size={16} /> Crea Quiz
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', marginBottom: '8px' }}>
          <Trophy size={20} style={{ color: 'var(--accent)' }} /> Elenco Quiz Disponibili
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Seleziona un quiz d'esame per iniziare il test o creane uno personalizzato.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {quizzes.map((quiz) => {
          const meta = getQuizMetadata(quiz.id, quiz.created_by);
          const diffStyle = getDifficultyColor(quiz.difficulty);
          const isGlobal = quiz.created_by === 'global';
          return (
            <QuizSelectionCard
              key={quiz.id}
              quiz={quiz}
              meta={meta}
              diffStyle={diffStyle}
              isGlobal={isGlobal}
              onStart={() => onSelectQuiz(quiz.id)}
              onManage={() => handleOpenManage(quiz)}
              onEdit={() => {
                setEditingQuiz(quiz);
                setEditQuizTitle(quiz.title);
                setEditQuizDifficulty(quiz.difficulty);
                setEditQuizDescription(quiz.description || '');
                setEditQuizImageUrl(quiz.image_url || '');
                setShowEditQuizModal(true);
              }}
              onDelete={() => handleDeleteQuiz(quiz.id)}
            />
          );
        })}
      </div>

      <CreateQuizModal
        open={showQuizModal}
        title={newQuizTitle}
        setTitle={setNewQuizTitle}
        difficulty={newQuizDifficulty}
        setDifficulty={setNewQuizDifficulty}
        description={newQuizDescription}
        setDescription={setNewQuizDescription}
        imageUrl={newQuizImageUrl}
        setImageUrl={setNewQuizImageUrl}
        submitting={submittingQuiz}
        onClose={() => setShowQuizModal(false)}
        onSubmit={handleCreateQuiz}
      />

      <EditQuizModal
        open={showEditQuizModal}
        editingQuiz={editingQuiz}
        title={editQuizTitle}
        setTitle={setEditQuizTitle}
        difficulty={editQuizDifficulty}
        setDifficulty={setEditQuizDifficulty}
        description={editQuizDescription}
        setDescription={setEditQuizDescription}
        imageUrl={editQuizImageUrl}
        setImageUrl={setEditQuizImageUrl}
        updating={updatingQuiz}
        onClose={() => { setShowEditQuizModal(false); setEditingQuiz(null); }}
        onSubmit={handleUpdateQuiz}
      />

      <ManageQuestionsModal
        open={showManageModal}
        manageQuiz={manageQuiz}
        loading={loadingManageQuestions}
        questions={manageQuestions}
        onClose={() => { setShowManageModal(false); setManageQuiz(null); }}
        onAddQuestion={() => { setSelectedQuizIdForQuestion(manageQuiz.id); setShowQuestionModal(true); }}
        onEditQuestion={handleEditQuestionClick}
        onDeleteQuestion={handleDeleteQuestion}
      />

      <EditQuestionModal
        open={showEditQuestionModal}
        editingQuestion={editingQuestion}
        questionText={editQuestionText}
        setQuestionText={setEditQuestionText}
        optA={editOptA}
        setOptA={setEditOptA}
        optB={editOptB}
        setOptB={setEditOptB}
        optC={editOptC}
        setOptC={setEditOptC}
        optD={editOptD}
        setOptD={setEditOptD}
        correctOption={editCorrectOption}
        setCorrectOption={setEditCorrectOption}
        explanation={editExplanation}
        setExplanation={setEditExplanation}
        imageUrl={editQuestionImageUrl}
        setImageUrl={setEditQuestionImageUrl}
        updating={updatingQuestion}
        onClose={() => { setShowEditQuestionModal(false); setEditingQuestion(null); }}
        onSubmit={handleUpdateQuestion}
      />

      <CreateQuestionModal
        open={showQuestionModal}
        questionText={questionText}
        setQuestionText={setQuestionText}
        optA={optA}
        setOptA={setOptA}
        optB={optB}
        setOptB={setOptB}
        optC={optC}
        setOptC={setOptC}
        optD={optD}
        setOptD={setOptD}
        correctOption={correctOption}
        setCorrectOption={setCorrectOption}
        explanation={explanation}
        setExplanation={setExplanation}
        imageUrl={questionImageUrl}
        setImageUrl={setQuestionImageUrl}
        submitting={submittingQuestion}
        onClose={() => setShowQuestionModal(false)}
        onSubmit={handleCreateQuestion}
      />
    </div>
  );
}
