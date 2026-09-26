import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileCheck2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  ArrowRight,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { Quiz, Subject } from '../types';
import { ALL_SUBJECTS } from '../data/mockAcademicData';

interface QuizGeneratorViewProps {
  onQuizCompleted: (attempt: {
    quizTitle: string;
    score: number;
    total: number;
    timeSpentSeconds: number;
  }) => void;
  initialTopic?: string;
  initialSubject?: Subject;
  onSendToTutor?: (text: string, subject: Subject) => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({ 
  onQuizCompleted,
  initialTopic,
  initialSubject,
  onSendToTutor,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'Neural Networks & Loss Optimization');
  const [subject, setSubject] = useState<Subject>(initialSubject || 'Computer Science & AI');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(initialSubject);
  }, [initialTopic, initialSubject]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerActive && secondsRemaining > 0 && !isQuizFinished) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerActive && !isQuizFinished) {
      handleFinishQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining, isQuizFinished]);

  const handleStartQuiz = async (overrideTopic?: string) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic || isLoading) return;

    setIsLoading(true);
    setIsQuizFinished(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          subject,
          difficulty,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data: Quiz = await response.json();
      setCurrentQuiz(data);
      setSecondsRemaining(data.questions.length * 60);
      setTimerActive(true);
    } catch (err) {
      console.error(err);
      // Smart offline fallback quiz
      const fallbackQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: targetTopic,
        subject,
        difficulty,
        totalTimeMinutes: 3,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: 'q1',
            question: `In ${targetTopic}, which underlying assumption or boundary condition is most critical?`,
            options: [
              'Zero friction or boundary loss',
              'Conservation of energy and monotonic invariant bounds',
              'Arbitrary non-deterministic state progression',
              'Uniform linear scaling regardless of domain'
            ],
            correctIndex: 1,
            explanation: 'Physical and algorithmic systems depend on invariant conservation principles to remain mathematically stable.',
            hint: 'Think about conservation laws and boundaries that must never be violated.',
            difficulty: 'Medium',
          },
          {
            id: 'q2',
            question: `What is the most frequent student error when analyzing ${targetTopic}?`,
            options: [
              'Neglecting sign conventions and edge-case limits',
              'Using floating point numbers instead of decimals',
              'Applying the fundamental theorem backwards',
              'Writing excessive comments in the solution'
            ],
            correctIndex: 0,
            explanation: 'Boundary limits and sign inversions are the most common pitfall identified across exam evaluations.',
            hint: 'Recall common algebra and sign mistakes during examinations.',
            difficulty: 'Medium',
          },
          {
            id: 'q3',
            question: `When the scale of input parameters increases exponentially in ${targetTopic}, how does the system behave?`,
            options: [
              'Output remains strictly linear',
              'System approaches asymptotic saturation or logarithmic overhead',
              'Input scale has zero measurable effect',
              'The equation becomes undefined immediately'
            ],
            correctIndex: 1,
            explanation: 'Non-linear feedback and diminishing marginal returns cause logarithmic or asymptotic convergence.',
            hint: 'Consider how real-world systems respond to saturation.',
            difficulty: 'Hard',
          }
        ]
      };
      setCurrentQuiz(fallbackQuiz);
      setSecondsRemaining(180);
      setTimerActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isQuizFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleFinishQuiz = () => {
    if (!currentQuiz) return;
    setTimerActive(false);
    setIsQuizFinished(true);

    let score = 0;
    currentQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const percent = Math.round((score / currentQuiz.questions.length) * 100);
    if (percent >= 70) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    onQuizCompleted({
      quizTitle: currentQuiz.title,
      score,
      total: currentQuiz.questions.length,
      timeSpentSeconds: currentQuiz.questions.length * 60 - secondsRemaining,
    });
  };

  const calculateScore = () => {
    if (!currentQuiz) return { score: 0, total: 0, percent: 0 };
    let score = 0;
    currentQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return {
      score,
      total: currentQuiz.questions.length,
      percent: Math.round((score / currentQuiz.questions.length) * 100),
    };
  };

  // 1. SETUP SCREEN (When not taking a quiz)
  if (!currentQuiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4" />
              <span>Practice & Assessment</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Adaptive Practice Quiz
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any topic and test your conceptual grasp with quick feedback.
            </p>
          </div>

          <div className="space-y-4">
            {/* Topic Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Bayes Theorem, Photosynthesis..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500">
              <span className="shrink-0 font-medium">Try:</span>
              {[
                'Neural Networks & Loss',
                'Eigenvalues & PCA',
                'Rotational Inertia',
                'CRISPR Cas9'
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTopic(preset)}
                  className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Subject Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Difficulty & Length Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        difficulty === d
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Questions</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                  {[3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => handleStartQuiz()}
              disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-all shadow-xs cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Generating Questions...' : 'Start Practice Quiz'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. QUIZ RESULTS SCREEN
  if (isQuizFinished) {
    const { score, total, percent } = calculateScore();
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Quiz Completed
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              You scored {score} out of {total} ({percent}%)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {percent >= 80 ? 'Mastery demonstrated! Great work.' : percent >= 60 ? 'Good effort! Review the questions you missed below.' : 'Needs some revision. Discuss these concepts with the AI Tutor.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentQuiz(null);
                setIsQuizFinished(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Take Another Quiz</span>
            </button>

            {onSendToTutor && (
              <button
                onClick={() => {
                  onSendToTutor(`I just took a quiz on "${currentQuiz.title}" and scored ${score}/${total}. Can we review the concepts I struggled with?`, currentQuiz.subject as Subject);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Review with AI Tutor</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 px-1">Answer Review</h3>
          {currentQuiz.questions.map((q, idx) => {
            const userChoice = selectedAnswers[q.id];
            const isCorrect = userChoice === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs ${
                  isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {idx + 1}. {q.question}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Your Answer:</span>
                        <span className={isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                          {userChoice !== undefined ? q.options[userChoice] : 'Unanswered'}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <span className="text-emerald-600 block text-[10px] uppercase font-semibold">Correct Answer:</span>
                          <span className="font-medium">{q.options[q.correctIndex]}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 pt-1">
                      <strong className="text-slate-700">Explanation: </strong>
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ TEST RUNNER (Distraction-Free)
  const currentQ = currentQuiz.questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Runner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-400">
            Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
          </span>
          <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
            {currentQuiz.title}
          </h3>
        </div>

        {/* Clean Timer Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
          secondsRemaining < 60 ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>
            {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {currentQ.question}
        </h4>

        {/* Option Choices */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentQ.id] === optIdx;
            const letter = String.fromCharCode(65 + optIdx);
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(currentQ.id, optIdx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </div>
                <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Nav: Prev / Next / Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinishQuiz}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
