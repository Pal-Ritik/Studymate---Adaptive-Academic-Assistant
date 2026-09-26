import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Plus, 
  BookOpen, 
  MessageSquare,
  FileCheck2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  PenLine
} from 'lucide-react';
import { Subject, WeakTopicItem, PersonalizedDiagnosticGuide, UserProfile } from '../types';
import { ALL_SUBJECTS, INITIAL_WEAK_TOPICS } from '../data/mockAcademicData';
import { NavTab } from './Navigation';

interface PersonalizedGuideViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onSendToTutor: (prompt: string, subject: Subject) => void;
  onActivityLogged: (activity: { title: string; type: 'guide'; highlight: string }) => void;
  currentUser?: UserProfile;
  userWeakTopics?: WeakTopicItem[];
  onUpdateWeakTopics?: (topics: WeakTopicItem[]) => void;
}

export const PersonalizedGuideView: React.FC<PersonalizedGuideViewProps> = ({
  onNavigateTab,
  onSendToTutor,
  onActivityLogged,
  currentUser,
  userWeakTopics,
  onUpdateWeakTopics,
}) => {
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>(
    userWeakTopics || currentUser?.weakTopics || INITIAL_WEAK_TOPICS
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    currentUser?.majorOrFocus || 'Computer Science & AI'
  );
  const [customWeaknessInput, setCustomWeaknessInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Critical' | 'Mastered'>('All');
  
  // Quick Add Modal State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTopicName, setNewTopicName] = useState<string>('');
  const [newTopicCause, setNewTopicCause] = useState<string>('');
  const [newTopicSubject, setNewTopicSubject] = useState<Subject>(
    currentUser?.majorOrFocus || 'Computer Science & AI'
  );

  useEffect(() => {
    if (userWeakTopics) {
      setWeakTopics(userWeakTopics);
    } else if (currentUser?.weakTopics) {
      setWeakTopics(currentUser.weakTopics);
    }
  }, [currentUser?.id, userWeakTopics]);

  // AI Diagnostic Scan
  const handleRunDiagnosticScan = async (promptOverride?: string) => {
    const textToScan = promptOverride || customWeaknessInput.trim();
    if (!textToScan || isScanning) return;

    setIsScanning(true);
    try {
      const response = await fetch('/api/guide/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          goalContext: currentUser?.targetGoal || 'Semester Mastery',
          academicLevel: currentUser?.academicLevel || 'Undergraduate',
          customWeakness: textToScan,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run weakness diagnostic');
      }

      const data: PersonalizedDiagnosticGuide = await response.json();
      if (data.weakTopics && data.weakTopics.length > 0) {
        setWeakTopics((prev) => {
          const newNames = new Set(data.weakTopics.map(w => w.topicName.toLowerCase()));
          const filteredOld = prev.filter(w => !newNames.has(w.topicName.toLowerCase()));
          const merged = [...data.weakTopics, ...filteredOld];
          if (onUpdateWeakTopics) onUpdateWeakTopics(merged);
          return merged;
        });
      }

      onActivityLogged({
        title: `Topic Exploration: ${textToScan.slice(0, 24)}...`,
        type: 'guide',
        highlight: `Diagnosed friction points in ${selectedSubject}`,
      });
      setCustomWeaknessInput('');
    } catch (err) {
      console.error(err);
      // Smart local addition
      const fallbackTopic: WeakTopicItem = {
        id: `wt-${Date.now()}`,
        topicName: textToScan,
        subject: selectedSubject,
        severity: 'Critical Gap',
        masteryScore: 45,
        rootCause: 'Confusion regarding boundary conditions and foundational mathematical formulations.',
        actionableSuggestions: [
          'Decompose the formula into atomic variables and constraints.',
          'Solve 3 foundational warm-up questions before attempting composite problems.',
          'Review edge-case behavior with the Socratic AI Tutor.'
        ],
        keyPitfallToAvoid: 'Skipping baseline sanity checks on input limits.',
        quickCheckQuestion: `What invariant must hold true when computing ${textToScan}?`,
        recommendedStudyTime: '30 mins',
        status: 'Under Review'
      };
      const updated = [fallbackTopic, ...weakTopics];
      setWeakTopics(updated);
      if (onUpdateWeakTopics) onUpdateWeakTopics(updated);
      setCustomWeaknessInput('');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const topicItem: WeakTopicItem = {
      id: `custom-wt-${Date.now()}`,
      topicName: newTopicName.trim(),
      subject: newTopicSubject,
      severity: 'Critical Gap',
      masteryScore: 40,
      rootCause: newTopicCause.trim() || 'Struggling with problem set application and exam traps.',
      actionableSuggestions: [
        'Review core definitions and step-by-step proofs on paper.',
        'Use Socratic AI Tutor to test your mental model.',
        'Practice targeted 3-question micro-quizzes.'
      ],
      keyPitfallToAvoid: 'Memorizing final formulas without deriving the steps.',
      quickCheckQuestion: `Can you explain the main concept of ${newTopicName.trim()} in simple words?`,
      recommendedStudyTime: '25 mins',
      status: 'Under Review'
    };

    const nextTopics = [topicItem, ...weakTopics];
    setWeakTopics(nextTopics);
    if (onUpdateWeakTopics) onUpdateWeakTopics(nextTopics);

    setNewTopicName('');
    setNewTopicCause('');
    setIsAddOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setWeakTopics((prev: WeakTopicItem[]) => {
      const updated: WeakTopicItem[] = prev.map((t) => {
        if (t.id === id) {
          const nextStatus: WeakTopicItem['status'] = 
            t.status === 'Under Review' ? 'Practicing' : 
            t.status === 'Practicing' ? 'Mastered' : 'Under Review';
          const nextScore = nextStatus === 'Mastered' ? 92 : nextStatus === 'Practicing' ? 70 : 45;
          return { ...t, status: nextStatus, masteryScore: nextScore };
        }
        return t;
      });
      if (onUpdateWeakTopics) onUpdateWeakTopics(updated);
      return updated;
    });
  };

  const filteredTopics = weakTopics.filter((t) => {
    if (activeFilter === 'Critical') return t.status !== 'Mastered';
    if (activeFilter === 'Mastered') return t.status === 'Mastered';
    return true;
  });

  const criticalCount = weakTopics.filter(t => t.status !== 'Mastered').length;
  const masteredCount = weakTopics.filter(t => t.status === 'Mastered').length;
  const avgScore = Math.round(
    weakTopics.reduce((acc, t) => acc + t.masteryScore, 0) / (weakTopics.length || 1)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Header: Scholarly, humanized framing */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Targeted Learning & Remediation
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
            {currentUser ? `${currentUser.name}'s Personal Study Guide` : 'Personalized Learning Guide'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif">
            Isolate the exact concepts causing friction and discover gentle, step-by-step ways to understand them.
          </p>
        </div>

        {/* 3 Simple stats with zero pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[70px]">
            <span className="text-[10px] text-stone-500 font-medium uppercase block">Active Focus</span>
            <span className="text-base font-serif font-bold text-amber-800">{criticalCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[70px]">
            <span className="text-[10px] text-stone-500 font-medium uppercase block">Mastered</span>
            <span className="text-base font-serif font-bold text-emerald-800">{masteredCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center min-w-[70px]">
            <span className="text-[10px] text-stone-500 font-medium uppercase block">Avg Score</span>
            <span className="text-base font-serif font-bold text-stone-900">{avgScore}%</span>
          </div>
        </div>
      </div>

      {/* 2. Topic Input & Diagnostics Search */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
        <label className="text-xs font-semibold text-stone-800 block">
          What concept or topic feels confusing right now?
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="sm:w-52 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600 cursor-pointer shrink-0"
          >
            {ALL_SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            value={customWeaknessInput}
            onChange={(e) => setCustomWeaknessInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunDiagnosticScan()}
            placeholder="e.g., 'Dynamic programming tabulation' or 'Rotational torque'..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-600 font-medium"
          />

          <button
            onClick={() => handleRunDiagnosticScan()}
            disabled={isScanning || !customWeaknessInput.trim()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-stone-100 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>{isScanning ? 'Analyzing concept...' : 'Explore Concept'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick starter topics */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-1">
          <span className="font-medium text-stone-600">Sample topics:</span>
          {[
            'Dynamic Programming Tabulation',
            'Eigenvalues & Eigenvectors',
            'CRISPR Cas9 Mechanism',
            'Rotational Torque'
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setCustomWeaknessInput(preset);
                handleRunDiagnosticScan(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer text-[11px] font-medium"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Filter tabs & Add Custom Topic Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {(['All', 'Critical', 'Mastered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {filter === 'All' ? `All (${weakTopics.length})` : filter === 'Critical' ? `Active Focus (${criticalCount})` : `Mastered (${masteredCount})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {/* 4. Filtered Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isMastered = topic.status === 'Mastered';
          return (
            <div
              key={topic.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-all ${
                isMastered ? 'border-emerald-200/80 bg-emerald-50/15' : 'border-stone-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                    <span>{topic.subject}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <button
                      onClick={() => handleToggleStatus(topic.id)}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        isMastered
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : topic.status === 'Practicing'
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {topic.status === 'Mastered' ? 'Mastered' : topic.status === 'Practicing' ? 'Practicing' : 'Needs Review'} (click to change)
                    </button>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {topic.topicName}
                  </h3>
                </div>

                {/* Mastery Bar */}
                <div className="w-full sm:w-44 space-y-1 shrink-0">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span className="font-medium">Mastery</span>
                    <span className="font-mono text-stone-800">{topic.masteryScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered ? 'bg-emerald-600' : topic.masteryScore > 60 ? 'bg-amber-600' : 'bg-stone-600'
                      }`}
                      style={{ width: `${topic.masteryScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Content: Why you get stuck & Pitfall */}
              <div className="mt-3.5 space-y-3">
                <div className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/70 font-serif">
                  <strong className="text-stone-900 block font-sans font-semibold mb-0.5">Where the friction happens:</strong>
                  <span>{topic.rootCause}</span>
                </div>

                {topic.keyPitfallToAvoid && (
                  <div className="text-xs text-amber-950 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 flex items-start gap-2">
                    <span className="font-semibold text-amber-900 shrink-0">Common Pitfall:</span>
                    <span className="font-serif leading-relaxed">{topic.keyPitfallToAvoid}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-stone-500">
                  Recommended: {topic.recommendedStudyTime || '20 mins'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSendToTutor(`I want to master "${topic.topicName}" in ${topic.subject}. Help me understand why I get stuck: ${topic.rootCause}`, topic.subject);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                    <span>Coach in Socratic Tutor</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('quiz')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Practice Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs font-serif">
            No topics found under this filter.
          </div>
        )}
      </div>

      {/* Quick Add Custom Topic Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">Add a Struggle Topic</h3>
            <form onSubmit={handleAddNewTopic} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g., Fourier Transform, Photosynthesis Calvin Cycle..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Subject</label>
                <select
                  value={newTopicSubject}
                  onChange={(e) => setNewTopicSubject(e.target.value as Subject)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
                >
                  {ALL_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Why do you get stuck?</label>
                <textarea
                  rows={2}
                  value={newTopicCause}
                  onChange={(e) => setNewTopicCause(e.target.value)}
                  placeholder="e.g., I get lost when multiple variables change simultaneously..."
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
