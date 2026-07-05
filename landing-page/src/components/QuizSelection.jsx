import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Trophy, 
  Cpu, 
  Layers, 
  Network,
  Plus,
  X,
  Image as ImageIcon,
  BookOpenCheck,
  UserCheck,
  Edit3,
  Trash2,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function QuizSelection({ quizzes, onSelectQuiz, onViewFlashcards, onRefresh }) {
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
      {/* BANNER PRINCIPALE */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #121212 0%, #1a0f30 100%)',
        borderColor: 'rgba(124, 58, 237, 0.15)',
        padding: '32px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}><span className="gradient-text">Area Didattica</span></h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Seleziona un quiz d'esame oppure crea un percorso di test personalizzato. Puoi usare le flashcard per la memorizzazione dei termini chiave.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowQuizModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            <span>Crea Quiz</span>
          </button>
          <button onClick={onViewFlashcards} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--accent-hover)' }} />
            <span>Studio Flashcards</span>
          </button>
        </div>
      </div>

      {/* SEZIONE QUIZ */}
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={20} style={{ color: 'var(--accent)' }} /> Elenco Quiz Disponibili
      </h2>

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
            <div key={quiz.id} className="card card-hover" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              backgroundImage: quiz.image_url ? `linear-gradient(to bottom, rgba(18, 18, 18, 0.8), #121212), url(${quiz.image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#18181b', border: '1px solid #27272a' }}>
                  {meta.icon}
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Badge per capire se è creato da sé o globale */}
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isGlobal ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 58, 237, 0.1)',
                    color: isGlobal ? 'var(--text-secondary)' : 'var(--accent-hover)',
                    border: isGlobal ? '1px solid var(--card-border)' : '1px solid rgba(124, 58, 237, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {!isGlobal && <UserCheck size={10} />}
                    {isGlobal ? 'Globale' : 'Personale'}
                  </span>
                  
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: diffStyle.bg,
                    color: diffStyle.text,
                    border: `1px solid ${diffStyle.border}`
                  }}>
                    {quiz.difficulty}
                  </span>
                </div>
              </div>

              {/* RIGA TITOLO CON CONTROLLI DI MODIFICA/ELIMINAZIONE QUIZ */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', gap: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1, lineHeight: '1.3' }}>
                  {quiz.title}
                </h3>
                {!isGlobal && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <button 
                      onClick={() => {
                        setEditingQuiz(quiz);
                        setEditQuizTitle(quiz.title);
                        setEditQuizDifficulty(quiz.difficulty);
                        setEditQuizDescription(quiz.description || '');
                        setEditQuizImageUrl(quiz.image_url || '');
                        setShowEditQuizModal(true);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Modifica metadati quiz"
                    >
                      <Edit3 size={15} style={{ transition: 'color 0.15s ease' }} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Elimina quiz in modo permanente"
                    >
                      <Trash2 size={15} style={{ transition: 'opacity 0.15s ease' }} onMouseEnter={(e)=>e.currentTarget.style.opacity='0.8'} onMouseLeave={(e)=>e.currentTarget.style.opacity='1'} />
                    </button>
                  </div>
                )}
              </div>
              
              <p style={{ fontSize: '0.9rem', marginBottom: '24px', flex: 1, color: 'var(--text-secondary)' }}>
                {quiz.description || meta.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {quiz.questions} Domande
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Se il quiz è personale, mostra il tasto "Gestisci" per modificare le domande */}
                  {!isGlobal && (
                    <button 
                      onClick={() => handleOpenManage(quiz)}
                      className="btn btn-secondary" 
                      style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Gestisci le domande inserite in questo quiz"
                    >
                      <Settings size={14} /> Gestisci
                    </button>
                  )}
                  <button 
                    onClick={() => onSelectQuiz(quiz.id)} 
                    disabled={quiz.questions === 0}
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    title={quiz.questions === 0 ? "Aggiungi almeno una domanda per avviare il quiz" : ""}
                  >
                    Avvia <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================================
         MODALE CREAZIONE QUIZ (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showQuizModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Crea Nuovo Quiz</h3>
              <button onClick={() => setShowQuizModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Quiz *</label>
                <input 
                  type="text" required value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="Es. Docker Compose avanzato"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Difficoltà *</label>
                <select 
                  value={newQuizDifficulty} onChange={(e) => setNewQuizDifficulty(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <option value="Facile">Facile</option>
                  <option value="Medio">Medio</option>
                  <option value="Difficile">Difficile</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Descrizione</label>
                <textarea 
                  value={newQuizDescription} onChange={(e) => setNewQuizDescription(e.target.value)}
                  placeholder="Una breve spiegazione del modulo didattico..." rows={3}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} /> URL Immagine Copertina (Opzionale)
                </label>
                <input 
                  type="url" value={newQuizImageUrl} onChange={(e) => setNewQuizImageUrl(e.target.value)}
                  placeholder="https://esempio.it/immagine.jpg"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={submittingQuiz} className="btn btn-primary">
                  {submittingQuiz ? 'Salvataggio...' : 'Crea modulo'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         MODALE MODIFICA QUIZ (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showEditQuizModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Modifica Quiz</h3>
              <button onClick={() => { setShowEditQuizModal(false); setEditingQuiz(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Titolo Quiz *</label>
                <input 
                  type="text" required value={editQuizTitle} onChange={(e) => setEditQuizTitle(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Difficoltà *</label>
                <select 
                  value={editQuizDifficulty} onChange={(e) => setEditQuizDifficulty(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <option value="Facile">Facile</option>
                  <option value="Medio">Medio</option>
                  <option value="Difficile">Difficile</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Descrizione</label>
                <textarea 
                  value={editQuizDescription} onChange={(e) => setEditQuizDescription(e.target.value)}
                  rows={3}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} /> URL Immagine Copertina (Opzionale)
                </label>
                <input 
                  type="url" value={editQuizImageUrl} onChange={(e) => setEditQuizImageUrl(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => { setShowEditQuizModal(false); setEditingQuiz(null); }} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={updatingQuiz} className="btn btn-primary">
                  {updatingQuiz ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         PANNELLO GESTIONE DOMANDE (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showManageModal && manageQuiz && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ 
            maxWidth: '720px', width: '100%', padding: '28px', backgroundColor: '#121212', 
            border: '1px solid var(--card-border)', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header del Manager */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-hover)', fontWeight: '600', textTransform: 'uppercase' }}>Pannello Gestione</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginTop: '2px' }}>Domande per: {manageQuiz.title}</h3>
              </div>
              <button onClick={() => { setShowManageModal(false); setManageQuiz(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Pulsante per aggiungere una nuova domanda a questo quiz */}
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => { setSelectedQuizIdForQuestion(manageQuiz.id); setShowQuestionModal(true); }}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Aggiungi Nuova Domanda
              </button>
            </div>

            {/* Lista scrollabile delle domande */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
              {loadingManageQuestions ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Caricamento domande...</p>
                </div>
              ) : manageQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', border: '1px dashed var(--card-border)', borderRadius: '8px' }}>
                  <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Questo quiz non contiene ancora domande.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Clicca sul pulsante sopra per iniziare ad aggiungerne.</p>
                </div>
              ) : (
                manageQuestions.map((q, idx) => (
                  <div key={q.id || idx} style={{
                    padding: '16px', backgroundColor: '#18181b', border: '1px solid var(--card-border)', borderRadius: '8px',
                    position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px'
                  }}>
                    {/* Numero domanda ed azioni rapide */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-hover)', textTransform: 'uppercase' }}>
                        Quesito #{idx + 1}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditQuestionClick(q)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                          title="Modifica domanda"
                        >
                          <Edit3 size={14} onMouseEnter={(e)=>e.currentTarget.style.color='#fff'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--text-secondary)'} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                          title="Elimina domanda"
                        >
                          <Trash2 size={14} style={{ opacity: 0.9 }} onMouseEnter={(e)=>e.currentTarget.style.opacity=1} onMouseLeave={(e)=>e.currentTarget.style.opacity=0.9} />
                        </button>
                      </div>
                    </div>

                    {/* Testo domanda */}
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>
                      {q.q}
                    </h4>

                    {/* Anteprima Opzioni */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ 
                          padding: '6px 10px', borderRadius: '4px', backgroundColor: oIdx === q.correct ? 'rgba(16, 185, 129, 0.08)' : '#0d0d0d',
                          border: '1px solid', borderColor: oIdx === q.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: oIdx === q.correct ? 'var(--success)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          <strong>{String.fromCharCode(65 + oIdx)})</strong> {opt}
                        </div>
                      ))}
                    </div>

                    {/* Info aggiuntive in anteprima */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {q.image_url && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><ImageIcon size={12} /> Immagine Allegata</span>}
                      {q.explanation && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><BookOpenCheck size={12} /> Spiegazione Presente</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         MODALE MODIFICA DOMANDA (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showEditQuestionModal && editingQuestion && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Modifica Domanda</h3>
              <button onClick={() => { setShowEditQuestionModal(false); setEditingQuestion(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Testo della Domanda *</label>
                <textarea 
                  required value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)}
                  placeholder="Es. Qual è il comando per avviare i container in background?" rows={2}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              {/* OPZIONI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Opzioni di Risposta *</label>
                <input 
                  type="text" required value={editOptA} onChange={(e) => setEditOptA(e.target.value)} placeholder="Opzione A"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={editOptB} onChange={(e) => setEditOptB(e.target.value)} placeholder="Opzione B"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={editOptC} onChange={(e) => setEditOptC(e.target.value)} placeholder="Opzione C"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={editOptD} onChange={(e) => setEditOptD(e.target.value)} placeholder="Opzione D"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Risposta Corretta *</label>
                <select 
                  value={editCorrectOption} onChange={(e) => setEditCorrectOption(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <option value={0}>Opzione A</option>
                  <option value={1}>Opzione B</option>
                  <option value={2}>Opzione C</option>
                  <option value={3}>Opzione D</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Spiegazione Teorica (Mostrata a fine quiz)</label>
                <textarea 
                  value={editExplanation} onChange={(e) => setEditExplanation(e.target.value)}
                  placeholder="Es. Il flag -d permette l'esecuzione del container in modalità detached (sfondo)..." rows={2}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} /> URL Immagine per la Domanda (Opzionale)
                </label>
                <input 
                  type="url" value={editQuestionImageUrl} onChange={(e) => setEditQuestionImageUrl(e.target.value)}
                  placeholder="https://esempio.it/diagramma.png"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setShowEditQuestionModal(false); setEditingQuestion(null); }} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={updatingQuestion} className="btn btn-primary">
                  {updatingQuestion ? 'Salvataggio...' : 'Salva Domanda'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================
         MODALE INSERIMENTO DOMANDA (MAPPATO TRAMITE PORTALE)
         ========================================== */}
      {showQuestionModal && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '540px', width: '100%', padding: '28px', backgroundColor: '#121212', border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Aggiungi Domanda</h3>
              <button onClick={() => setShowQuestionModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Testo della Domanda *</label>
                <textarea 
                  required value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Es. Qual è il comando per avviare i container in background?" rows={2}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              {/* OPZIONI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Opzioni di Risposta *</label>
                <input 
                  type="text" required value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Opzione A"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={optB} onChange={(e) => setOptB(e.target.value)} placeholder="Opzione B"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={optC} onChange={(e) => setOptC(e.target.value)} placeholder="Opzione C"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
                <input 
                  type="text" required value={optD} onChange={(e) => setOptD(e.target.value)} placeholder="Opzione D"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Risposta Corretta *</label>
                <select 
                  value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                >
                  <option value={0}>Opzione A</option>
                  <option value={1}>Opzione B</option>
                  <option value={2}>Opzione C</option>
                  <option value={3}>Opzione D</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Spiegazione Teorica (Mostrata a fine quiz)</label>
                <textarea 
                  value={explanation} onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Es. Il flag -d permette l'esecuzione del container in modalità detached (sfondo)..." rows={2}
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ImageIcon size={14} /> URL Immagine per la Domanda (Opzionale)
                </label>
                <input 
                  type="url" value={questionImageUrl} onChange={(e) => setQuestionImageUrl(e.target.value)}
                  placeholder="https://esempio.it/diagramma.png"
                  style={{
                    backgroundColor: '#0a0a0a', border: '1px solid var(--card-border)', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-sans)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn btn-secondary">Annulla</button>
                <button type="submit" disabled={submittingQuestion} className="btn btn-primary">
                  {submittingQuestion ? 'Salvataggio...' : 'Aggiungi domanda'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
