import React, { useState } from 'react';
import { 
  Mail, 
  Target, 
  Flame, 
  Clock, 
  FileCheck2, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Plus, 
  LogOut, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Building2,
  PenLine,
  Compass,
  MessageSquare,
  Sparkles,
  Check,
  HeartHandshake
} from 'lucide-react';
import { UserProfile, WeakTopicItem, Subject } from '../types';
import { NavTab } from './Navigation';
import { ALL_SUBJECTS } from '../data/mockAcademicData';
import { getWeeklyStreakCalendar } from '../utils/streakManager';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onSendToTutor: (text: string, subject: Subject) => void;
  onSendToQuiz: (topic: string, subject: Subject) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigateTab,
  onSendToTutor,
  onSendToQuiz,
}) => {
  // Target Goal Editing
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(currentUser.targetGoal);

  // Personal Learning Journal & Reflection state
  const [isEditingJournal, setIsEditingJournal] = useState(false);
  const [reflectionText, setReflectionText] = useState(
    currentUser.personalReflection || 
    'Focused on gaining intuition rather than memorizing. My goal is to understand how algorithms behave in real systems and stay patient through difficult problem sets.'
  );

  // Preferred Learning Style
  const [learningStyle, setLearningStyle] = useState(
    currentUser.preferredLearningStyle || 'Intuitive analogies & tracing examples on paper'
  );

  // Weakness point personal note being edited
  const [editingNoteTopicId, setEditingNoteTopicId] = useState<string | null>(null);
  const [topicNoteText, setTopicNoteText] = useState<string>('');

  // Add Weakness Modal
  const [showAddWeaknessModal, setShowAddWeaknessModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState<Subject>(currentUser.majorOrFocus);
  const [newTopicSeverity, setNewTopicSeverity] = useState<'Critical Gap' | 'Moderate Difficulty' | 'Needs Polish'>('Critical Gap');
  const [newTopicRootCause, setNewTopicRootCause] = useState('');
  const [newTopicSuggestion, setNewTopicSuggestion] = useState('');

  // Accordion for question reveals
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const handleSaveGoal = () => {
    onUpdateUser({
      ...currentUser,
      targetGoal: goalText.trim() || currentUser.targetGoal,
    });
    setIsEditingGoal(false);
  };

  const handleSaveJournal = () => {
    onUpdateUser({
      ...currentUser,
      personalReflection: reflectionText.trim(),
      preferredLearningStyle: learningStyle,
    });
    setIsEditingJournal(false);
  };

  const handleToggleStatus = (topicId: string) => {
    const updatedWeakTopics = currentUser.weakTopics.map((topic) => {
      if (topic.id === topicId) {
        const nextStatus: WeakTopicItem['status'] = 
          topic.status === 'Under Review' ? 'Practicing' :
          topic.status === 'Practicing' ? 'Mastered' : 'Under Review';
        
        const scoreBump = nextStatus === 'Mastered' ? 88 : nextStatus === 'Practicing' ? 70 : 54;
        return {
          ...topic,
          status: nextStatus,
          masteryScore: scoreBump,
        };
      }
      return topic;
    });

    onUpdateUser({
      ...currentUser,
      weakTopics: updatedWeakTopics,
    });
  };

  const handleSaveStudentPersonalNote = (topicId: string) => {
    const updatedWeakTopics = currentUser.weakTopics.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          studentPersonalNote: topicNoteText.trim(),
        };
      }
      return topic;
    });

    onUpdateUser({
      ...currentUser,
      weakTopics: updatedWeakTopics,
    });
    setEditingNoteTopicId(null);
    setTopicNoteText('');
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic: WeakTopicItem = {
      id: `wt-custom-${Date.now()}`,
      topicName: newTopicName.trim(),
      subject: newTopicSubject,
      severity: newTopicSeverity,
      masteryScore: newTopicSeverity === 'Critical Gap' ? 50 : newTopicSeverity === 'Moderate Difficulty' ? 65 : 78,
      rootCause: newTopicRootCause.trim() || 'Identified through self-reflection and recent problem set friction.',
      actionableSuggestions: newTopicSuggestion.trim() 
        ? [newTopicSuggestion.trim()] 
        : ['Discuss the concept with the Socratic AI Tutor.', 'Trace small examples step-by-step on paper before coding.'],
      keyPitfallToAvoid: 'Rushing to apply memorized templates without checking edge cases or invariants.',
      quickCheckQuestion: `What is the core intuition or governing constraint that defines ${newTopicName.trim()}?`,
      recommendedStudyTime: '25 mins / day',
      status: 'Under Review',
    };

    onUpdateUser({
      ...currentUser,
      weakTopics: [newTopic, ...currentUser.weakTopics],
    });

    setNewTopicName('');
    setNewTopicRootCause('');
    setNewTopicSuggestion('');
    setShowAddWeaknessModal(false);
  };

  const toggleQuestionReveal = (topicId: string) => {
    setRevealedQuestions(prev => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Student Academic Desk & Welcome Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Scholar Avatar (Warm, dignified monogram) */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-900 text-stone-100 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.avatarInitials}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {currentUser.name}
                </h1>
                {currentUser.role === 'faculty' && (
                  <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                    Faculty Advisor
                  </span>
                )}
              </div>

              {/* Zero-pill metadata with clean typographical separators */}
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-600 font-medium">
                <span>{currentUser.academicLevel}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{currentUser.majorOrFocus}</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-700">
                  {currentUser.organization && currentUser.organization !== 'NA' ? currentUser.organization : 'Independent Student'}
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-500">Joined {currentUser.joinedDate}</span>
              </div>

              {/* Target Goal Display & Editor */}
              <div className="pt-1 flex items-start gap-2 text-xs">
                <span className="font-semibold text-stone-700 shrink-0 mt-0.5">Current Focus:</span>
                {isEditingGoal ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={goalText}
                      onChange={(e) => setGoalText(e.target.value)}
                      className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600 font-medium min-w-[280px]"
                    />
                    <button
                      onClick={handleSaveGoal}
                      className="text-xs font-semibold text-stone-900 hover:underline cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setGoalText(currentUser.targetGoal); setIsEditingGoal(false); }}
                      className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-800 italic font-serif">
                      "{currentUser.targetGoal}"
                    </span>
                    <button
                      onClick={() => setIsEditingGoal(true)}
                      className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                      title="Update my current goal"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={() => onNavigateTab('guide')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Target className="w-4 h-4 text-stone-300" />
              <span>Explore Study Guide</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl text-xs font-medium cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Offline Faculty Directive (If assigned by institution/coach) */}
        {currentUser.facultyNotes && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
            <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-900 block">
                Offline Faculty Mentor Note ({currentUser.organization}):
              </span>
              <p className="text-amber-900/90 leading-relaxed font-serif text-[13px]">
                {currentUser.facultyNotes}
              </p>
            </div>
          </div>
        )}

        {/* 4 Grounded Study Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-stone-100">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
              Study Rhythm
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
              <Flame className="w-5 h-5 text-amber-600" />
              <span>{currentUser.stats.studyStreakDays} Days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
              Weekly Practice
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-5 h-5 text-stone-600" />
              <span>{currentUser.stats.weeklyHoursStudied} hrs</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
              Struggle Points Tracked
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
              <Target className="w-5 h-5 text-amber-700" />
              <span>{currentUser.weakTopics.length} Concepts</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
              Average Quiz Check
            </span>
            <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-stone-600" />
              <span>{currentUser.stats.averageQuizScore}%</span>
            </div>
          </div>
        </div>

        {/* 7-Day Study Rhythm Calendar */}
        {(() => {
          const weekDays = getWeeklyStreakCalendar(currentUser);
          return (
            <div className="mt-5 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-stone-500">
                <span className="font-semibold text-stone-700">7-Day Study Rhythm:</span> Daily practice reinforces memory retention.
              </div>
              <div className="flex items-center gap-2">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 text-center">
                    <span className="text-[10px] text-stone-500 font-medium">{day.dayLabel}</span>
                    <div 
                      title={`${day.date}: ${day.practiced ? 'Active study session logged' : day.visited ? 'Visited StudyMate' : 'Rest day'}`}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        day.practiced 
                          ? 'bg-amber-100 border border-amber-300 text-amber-900' 
                          : day.visited 
                          ? 'bg-stone-100 border border-stone-300 text-stone-700' 
                          : 'bg-stone-50 border border-stone-200 text-stone-400'
                      }`}
                    >
                      {day.practiced ? (
                        <Check className="w-3.5 h-3.5 text-amber-800" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 2. Personalized Learning Journal & Mindset */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Self-Reflection & Personal Habits
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              My Learning Journal & Mindset
            </h2>
          </div>
          <button
            onClick={() => {
              if (isEditingJournal) {
                handleSaveJournal();
              } else {
                setIsEditingJournal(true);
              }
            }}
            className="self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors cursor-pointer"
          >
            {isEditingJournal ? 'Save My Notes' : 'Edit My Reflection'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* How I Learn Best */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-700 block">How I Learn Best:</span>
            {isEditingJournal ? (
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
              >
                <option value="Intuitive analogies & tracing examples on paper">Intuitive analogies & tracing on paper</option>
                <option value="Visual diagrams, flowcharts & spatial models">Visual diagrams, flowcharts & spatial models</option>
                <option value="Writing code & testing edge cases first">Writing code & testing edge cases first</option>
                <option value="Explaining concepts out loud (Feynman Technique)">Explaining out loud (Feynman Technique)</option>
                <option value="Deriving formulas from first principles">Deriving formulas from first principles</option>
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800 font-medium">
                {learningStyle}
              </div>
            )}
            <p className="text-[11px] text-stone-500 leading-normal">
              StudyMate adjusts tutor explanations and suggestions to honor this preference.
            </p>
          </div>

          {/* Personal Reflection & Mindset Note */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-xs font-semibold text-stone-700 block">My Study Philosophy & Notes to Self:</span>
            {isEditingJournal ? (
              <textarea
                rows={3}
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full text-xs font-serif bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
                placeholder="Write what motivates you or how you handle challenging material..."
              />
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800 font-serif leading-relaxed italic">
                "{reflectionText}"
              </div>
            )}
            <p className="text-[11px] text-stone-500 leading-normal">
              A personal anchor for tough study weeks. Reflects your evolving mindset.
            </p>
          </div>
        </div>
      </div>

      {/* 3. HUMANIZED WEAKNESS SECTIONS ("Concepts Needing Extra Care & Time") */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Personalized Growth Compass
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Concepts Needing Extra Care & Time
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Encountering friction is a natural part of deep academic growth. Here are the specific concepts where you've noticed hurdles, with actionable mentor guidance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddWeaknessModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-medium shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Struggle Topic</span>
            </button>
            <button
              onClick={() => onNavigateTab('guide')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl text-xs font-medium cursor-pointer transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Study Guide</span>
            </button>
          </div>
        </div>

        {/* Weakness Cards Grid */}
        <div className="grid grid-cols-1 gap-5">
          {currentUser.weakTopics.map((topic) => {
            const isRevealed = !!revealedQuestions[topic.id];
            const isEditingNote = editingNoteTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className="p-5 sm:p-6 rounded-2xl border border-stone-200/90 bg-stone-50/40 hover:bg-white hover:border-stone-300 transition-all space-y-4"
              >
                {/* Header row: Topic Name, Subject, and Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-stone-600">{topic.subject}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-500 font-medium">{topic.recommendedStudyTime || '25 mins'} daily focus</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className={`text-[11px] font-medium ${
                        topic.severity === 'Critical Gap' ? 'text-amber-800' : 'text-stone-600'
                      }`}>
                        {topic.severity}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                      {topic.topicName}
                    </h3>
                  </div>

                  {/* Status Toggle Button with Human Labels */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(topic.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        topic.status === 'Mastered'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                          : topic.status === 'Practicing'
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                      title="Click to advance status: Under Review → Practicing → Mastered"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{topic.status === 'Mastered' ? 'Mastered & Confident' : topic.status === 'Practicing' ? 'Practicing with Examples' : 'Under Active Review'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                    <span>Intuition & Confidence Level</span>
                    <span className="font-mono text-stone-800">{topic.masteryScore}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.masteryScore >= 80 ? 'bg-emerald-600' : topic.masteryScore >= 60 ? 'bg-amber-600' : 'bg-stone-500'
                      }`}
                      style={{ width: `${topic.masteryScore}%` }}
                    />
                  </div>
                </div>

                {/* Human Explanation: Why it feels confusing */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1">
                  <span className="text-xs font-semibold text-stone-800 block">
                    Where the friction happens:
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed font-serif">
                    {topic.rootCause}
                  </p>
                </div>

                {/* Student's Personal Note on this topic */}
                <div className="p-3 rounded-xl bg-stone-100/70 border border-stone-200/70 text-xs text-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <PenLine className="w-3 h-3 text-stone-500" />
                      <span>My Personal Study Note:</span>
                    </span>
                    {!isEditingNote && (
                      <button
                        onClick={() => {
                          setEditingNoteTopicId(topic.id);
                          setTopicNoteText(topic.studentPersonalNote || '');
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-900 underline cursor-pointer"
                      >
                        {topic.studentPersonalNote ? 'Edit note' : '+ Add personal note'}
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={topicNoteText}
                        onChange={(e) => setTopicNoteText(e.target.value)}
                        placeholder="e.g., Note to self: always draw the tree on paper first, and watch out for off-by-one errors..."
                        className="w-full text-xs font-serif bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveStudentPersonalNote(topic.id)}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-md text-xs font-medium cursor-pointer"
                        >
                          Save Note
                        </button>
                        <button
                          onClick={() => setEditingNoteTopicId(null)}
                          className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-600 italic font-serif text-[12px]">
                      {topic.studentPersonalNote ? `"${topic.studentPersonalNote}"` : 'No personal note added yet. Click above to jot down what specifically trips you up.'}
                    </p>
                  )}
                </div>

                {/* Practical Offline Mentor Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-700 block">
                    Actionable Practice for Today:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topic.actionableSuggestions.map((suggestion, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-stone-200/80 text-xs text-stone-700 font-serif leading-relaxed"
                      >
                        <span className="text-amber-800 font-bold shrink-0">·</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Pitfall to Avoid */}
                {topic.keyPitfallToAvoid && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2">
                    <span className="font-semibold text-amber-900 shrink-0">Common Pitfall:</span>
                    <span className="font-serif leading-relaxed">{topic.keyPitfallToAvoid}</span>
                  </div>
                )}

                {/* Optional Diagnostic Reflection Question */}
                {topic.quickCheckQuestion && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleQuestionReveal(topic.id)}
                      className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isRevealed ? 'Hide self-test question' : 'Show quick self-test reflection'}</span>
                    </button>
                    {isRevealed && (
                      <div className="mt-2 p-3.5 rounded-xl bg-stone-100/70 border border-stone-200 text-xs text-stone-800 font-serif leading-relaxed">
                        <strong className="block font-sans text-stone-900 font-semibold mb-1">Check your intuition:</strong>
                        {topic.quickCheckQuestion}
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Action Launchers */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-stone-200/60">
                  <button
                    onClick={() => {
                      onSendToTutor(
                        `I struggle with ${topic.topicName}. My core hurdle is: "${topic.rootCause}". Can you coach me through this concept step-by-step using first principles?`,
                        topic.subject
                      );
                      onNavigateTab('tutor');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-all cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss in Socratic Tutor</span>
                  </button>

                  <button
                    onClick={() => {
                      onSendToQuiz(topic.topicName, topic.subject);
                      onNavigateTab('quiz');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-all cursor-pointer border border-stone-300"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Practice Micro-Quiz</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('doubt')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-all cursor-pointer border border-stone-300"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Resolve Specific Doubt</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Subject Disciplinary Competencies & Recent Study Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Disciplinary Index
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Subject Mastery
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {currentUser.stats.conceptMastery.map((mastery, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-800">{mastery.subject}</span>
                  <span className="font-mono text-stone-700">{mastery.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-stone-800"
                    style={{ width: `${mastery.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Study Activity Timeline */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Recent Milestones
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Study Activity Log
            </h3>
          </div>

          <div className="space-y-2.5 pt-2">
            {currentUser.stats.recentActivities.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No activity recorded yet.</p>
            ) : (
              currentUser.stats.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/60"
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    {act.type === 'guide' ? (
                      <Target className="w-3.5 h-3.5 text-amber-700" />
                    ) : act.type === 'quiz' ? (
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900 truncate">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {act.date}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 truncate font-serif">
                      {act.highlight}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Manually Add Weakness Point */}
      {showAddWeaknessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Add a Concept Needing Extra Care
              </h3>
              <button
                onClick={() => setShowAddWeaknessModal(false)}
                className="text-xs text-stone-400 hover:text-stone-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddWeakness} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">Topic / Concept Name</label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Backtracking State Pruning, Ampere's Law, Normal Distribution"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Academic Subject</label>
                  <select
                    value={newTopicSubject}
                    onChange={(e) => setNewTopicSubject(e.target.value as Subject)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Current Friction Level</label>
                  <select
                    value={newTopicSeverity}
                    onChange={(e) => setNewTopicSeverity(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                  >
                    <option value="Critical Gap">Needs Immediate Focus</option>
                    <option value="Moderate Difficulty">Moderate Difficulty</option>
                    <option value="Needs Polish">Needs Polish</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">Why do you get stuck? (In your own words)</label>
                <textarea
                  rows={2}
                  value={newTopicRootCause}
                  onChange={(e) => setNewTopicRootCause(e.target.value)}
                  placeholder="e.g. I mix up boundary conditions when returning from recursive stack frames"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">Personal Reminder / Study Action</label>
                <input
                  type="text"
                  value={newTopicSuggestion}
                  onChange={(e) => setNewTopicSuggestion(e.target.value)}
                  placeholder="e.g. Trace small 3-element examples on paper before coding"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Add to My Study Desk</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
