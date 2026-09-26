import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Volume2,
  VolumeX,
  MessageSquare,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  History,
  BookOpen,
  Zap,
  GraduationCap,
  Globe,
  Sliders,
  X,
  ThumbsUp,
  Compass
} from 'lucide-react';
import { DoubtResolution, Subject } from '../types';
import { ALL_SUBJECTS, QUICK_DOUBT_PRESETS } from '../data/mockAcademicData';

interface DoubtResolverViewProps {
  onActivityLogged: (activity: { title: string; type: 'doubt'; highlight: string }) => void;
  onSendToTutor: (text: string, subject: Subject) => void;
}

type ExplanationStyle = 'simple' | 'concise' | 'deep' | 'exam';
type ViewTab = 'all' | 'intuition' | 'steps' | 'traps' | 'quiz' | 'revision';

const STYLE_OPTIONS: { id: ExplanationStyle; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'simple', label: 'Simple & Intuitive (ELI5)', icon: Lightbulb, desc: 'Plain conversational English & everyday metaphors' },
  { id: 'concise', label: 'Fast & High-Yield', icon: Zap, desc: 'Quick bullets, rapid takeaways & key rules' },
  { id: 'deep', label: 'Deep Dive Academic', icon: GraduationCap, desc: 'First-principles logic & theoretical depth' },
  { id: 'exam', label: 'Exam Traps & Tricks', icon: AlertTriangle, desc: 'Avoid common traps & maximize scoring points' }
];

const LOADING_STAGES = [
  'Deconstructing query into core fundamental principles...',
  'Crafting vivid, everyday real-world analogy...',
  'Formulating intuitive step-by-step clarity...',
  'Calibrating interactive mastery check & exam traps...'
];

export const DoubtResolverView: React.FC<DoubtResolverViewProps> = ({
  onActivityLogged,
  onSendToTutor,
}) => {
  const [doubtText, setDoubtText] = useState('');
  const [subject, setSubject] = useState<Subject>('Mathematics & Statistics');
  const [style, setStyle] = useState<ExplanationStyle>('simple');
  const [activeTab, setActiveTab] = useState<ViewTab>('all');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<1.0 | 1.25>(1.0);
  const [copied, setCopied] = useState(false);
  const [copiedStepIdx, setCopiedStepIdx] = useState<number | null>(null);
  
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'helpful' | 'more' | null>(null);

  // Saved & Recent Doubts from LocalStorage
  const [savedDoubts, setSavedDoubts] = useState<DoubtResolution[]>(() => {
    try {
      const stored = localStorage.getItem('studymate_saved_doubts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentDoubts, setRecentDoubts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('studymate_recent_doubts');
      return stored ? JSON.parse(stored) : [
        'Why is dividing by zero mathematically undefined rather than infinity?',
        'What is the difference between TCP and UDP and why does video streaming use UDP?',
        'Why is the sky blue during the day but red at sunset?'
      ];
    } catch {
      return [];
    }
  });

  const [showRecentTray, setShowRecentTray] = useState(false);

  // Default seed resolution (dividing by zero)
  const [resolution, setResolution] = useState<DoubtResolution | null>({
    doubtText: 'Why is dividing by zero mathematically undefined rather than infinity?',
    subject: 'Mathematics & Statistics',
    coreConcept: 'Division as Reversible Multiplication',
    directAnswer: 'Dividing by zero is undefined because division asks: "What number multiplied by 0 gives you your original number?" Since 0 times anything is always 0, no number can ever equal a non-zero value. Therefore, dividing by zero has literally no mathematical solution.',
    whyItsConfusing: 'When you divide by tiny fractions like 0.1 or 0.001, the result grows huge (10, 1000). Students naturally guess that dividing by 0 must equal infinity, but division is an exact inverse equation requiring a valid real number.',
    intuitiveAnalogy: 'Think of 12 ÷ 3 as packing 12 cookies into bags of 3 (you get 4 bags). Now try packing 12 cookies into bags of 0. How many empty bags do you need to pack 12 cookies? No amount of empty bags can ever contain 12 cookies.',
    stepByStepSolution: [
      '**Step 1: Understand division as multiplication in reverse:** If a ÷ b = c, then b × c must equal a.',
      '**Step 2: Try dividing by zero:** Suppose 12 ÷ 0 = c. That means 0 × c must equal 12.',
      '**Step 3: Spot the contradiction:** Any number c multiplied by 0 is always 0 (0 × c = 0). It can never equal 12.',
      '**Step 4: Check approaching from both sides (Calculus):** Approaching 0 from positive numbers goes to +∞, but approaching 0 from negative numbers goes to -∞. Because they head toward opposite infinities, no single limit exists.'
    ],
    realWorldExample: 'Calculators and programming languages trigger a "DivideByZeroError" crash because computer registers cannot allocate memory for a value that mathematically does not exist.',
    commonPitfalls: [
      'Confusing "undefined" (impossible: 5/0) with "indeterminate" (any number works: 0/0).',
      'Thinking 1/0 equals infinity (limits can approach infinity, but 1/0 itself has no value).',
      'Canceling (x - a) in algebra without first verifying that x ≠ a.'
    ],
    keyFormulaOrRule: 'Division Rule: a / b = c  ⟺  b · c = a (Strictly invalid when b = 0)',
    summaryBullets: [
      'Division by zero is impossible because 0 times any number is 0, never your starting number.',
      '1/0 is strictly undefined; 0/0 is indeterminate.',
      'Calculators crash on division by zero because no valid mathematical number exists.'
    ],
    checkYourUnderstanding: {
      question: 'Why is 5 / 0 considered "undefined" instead of "infinity"?',
      options: [
        'Because 0 multiplied by any number is always 0, so no number can ever equal 5',
        'Because infinity is not allowed in any branch of mathematics',
        'Because computers run out of RAM when dividing by 0',
        'Because 5 / 0 actually equals 0 in modern algebra'
      ],
      correctIndex: 0,
      explanation: 'Division a / b = c requires b × c = a. For 5 / 0 = c, 0 × c must equal 5, which is impossible since 0 times anything is 0.'
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycling loading stage animation
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStageIdx((prev) => (prev + 1) % LOADING_STAGES.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Persist saved doubts
  useEffect(() => {
    try {
      localStorage.setItem('studymate_saved_doubts', JSON.stringify(savedDoubts));
    } catch {
      // ignore
    }
  }, [savedDoubts]);

  // Persist recent doubts
  useEffect(() => {
    try {
      localStorage.setItem('studymate_recent_doubts', JSON.stringify(recentDoubts));
    } catch {
      // ignore
    }
  }, [recentDoubts]);

  // Handle API doubt resolution
  const handleResolveDoubt = async (queryText?: string, querySubject?: Subject, queryStyle?: ExplanationStyle) => {
    const text = queryText || doubtText.trim();
    const subj = querySubject || subject;
    const st = queryStyle || style;
    if (!text || isLoading) return;

    setIsLoading(true);
    setLoadingStageIdx(0);
    setSelectedQuizOption(null);
    setHasSubmittedQuiz(false);
    setFeedbackState(null);

    // Stop speaking if active
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/doubt/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubtText: text,
          subject: subj,
          academicLevel: 'Undergraduate',
          style: st,
        }),
      });

      if (!response.ok) {
        throw new Error('Doubt resolution request failed');
      }

      const data: DoubtResolution = await response.json();
      setResolution(data);

      // Add to recent doubts list if not already first
      setRecentDoubts((prev) => {
        const filtered = prev.filter((d) => d.toLowerCase() !== text.toLowerCase());
        return [text, ...filtered].slice(0, 8);
      });

      onActivityLogged({
        title: `Resolved: ${text.slice(0, 32)}...`,
        type: 'doubt',
        highlight: `Subject: ${subj}`,
      });
    } catch (err) {
      console.error('Error resolving doubt:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech audio reader
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window) || !resolution) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `${resolution.coreConcept}. ${resolution.directAnswer || ''} Here is an intuitive way to understand it: ${resolution.intuitiveAnalogy}. Golden rule: ${resolution.keyFormulaOrRule || ''}`;
    
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy full explanation to clipboard
  const handleCopyExplanation = () => {
    if (!resolution) return;
    const content = `### Doubt: ${resolution.doubtText}
**Core Concept:** ${resolution.coreConcept} (${resolution.subject})

#### Direct Answer:
${resolution.directAnswer || resolution.whyItsConfusing}

#### Intuitive Analogy:
${resolution.intuitiveAnalogy}

#### Step-by-Step Breakdown:
${resolution.stepByStepSolution.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${resolution.realWorldExample ? `#### Real-World Application:\n${resolution.realWorldExample}\n` : ''}
${resolution.keyFormulaOrRule ? `#### Key Axiom / Formula:\n${resolution.keyFormulaOrRule}\n` : ''}

#### Common Pitfalls to Avoid:
${resolution.commonPitfalls.map((p) => `- ${p}`).join('\n')}
`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy single step
  const handleCopyStep = (stepText: string, idx: number) => {
    navigator.clipboard.writeText(stepText);
    setCopiedStepIdx(idx);
    setTimeout(() => setCopiedStepIdx(null), 1500);
  };

  // Toggle bookmark / saved status
  const isBookmarked = resolution 
    ? savedDoubts.some((d) => d.doubtText.toLowerCase() === resolution.doubtText.toLowerCase())
    : false;

  const handleToggleBookmark = () => {
    if (!resolution) return;
    if (isBookmarked) {
      setSavedDoubts((prev) => prev.filter((d) => d.doubtText.toLowerCase() !== resolution.doubtText.toLowerCase()));
    } else {
      setSavedDoubts((prev) => [resolution, ...prev]);
    }
  };

  // Handle Ctrl+Enter to solve
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleResolveDoubt();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Search & Doubt Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all">
        {/* Header with Title & Subject */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Instant Doubt Resolver
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Clear plain-language explanations, intuitive analogies, step-by-step solutions, and exam trap alerts.
              </p>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Subject:</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full sm:w-auto text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Textarea Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={3}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any question or concept doubt (e.g. 'Why is dividing by zero undefined?', 'Difference between TCP and UDP in streaming', 'How does quicksort pivot selection work?')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-8 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed"
            />
            {doubtText && (
              <button
                onClick={() => setDoubtText('')}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Explanation Style Selector Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-indigo-500" />
                Style:
              </span>
              {STYLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = style === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    title={opt.desc}
                    className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                    <span>{opt.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit Action Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-[10px] text-slate-400 hidden md:inline">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[9px]">Ctrl+Enter</kbd>
              </span>
              <button
                onClick={() => handleResolveDoubt()}
                disabled={isLoading || !doubtText.trim()}
                className="flex items-center justify-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer shrink-0 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isLoading ? 'Solving Step-by-Step...' : 'Resolve Doubt'}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets & History Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="font-semibold text-[11px] text-slate-500 shrink-0">Try Popular:</span>
              {QUICK_DOUBT_PRESETS.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDoubtText(p.title);
                    setSubject(p.subject as Subject);
                    handleResolveDoubt(p.title, p.subject as Subject);
                  }}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer font-medium border border-transparent hover:border-indigo-100"
                >
                  {p.title.length > 36 ? p.title.slice(0, 34) + '...' : p.title}
                </button>
              ))}
            </div>

            {/* Recent & Saved Toggle */}
            <button
              onClick={() => setShowRecentTray(!showRecentTray)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <History className="w-3.5 h-3.5" />
              <span>{showRecentTray ? 'Hide History' : `History (${recentDoubts.length})`}</span>
            </button>
          </div>

          {/* Expandable Recent Doubts Drawer */}
          {showRecentTray && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  Recent Doubts History
                </span>
                {savedDoubts.length > 0 && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {savedDoubts.length} Bookmarked
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentDoubts.map((recent, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDoubtText(recent);
                      handleResolveDoubt(recent);
                    }}
                    className="text-left text-xs p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800 transition-all cursor-pointer truncate flex items-center justify-between gap-2 group"
                  >
                    <span className="truncate">{recent}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smooth Loading Animated Skeleton Tracker */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Solving Your Doubt with High-Clarity Intelligence...
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {LOADING_STAGES[loadingStageIdx]}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
            <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-20 bg-slate-100 rounded-xl"></div>
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Output View */}
      {!isLoading && resolution && (
        <div className="space-y-4">
          {/* Main Resolution Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Top Bar: Subject Badge, Audio, Copy, Bookmark, AI Tutor */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-indigo-50/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                    {resolution.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Verified Resolution
                  </span>
                </div>

                {/* Toolbar buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Listen button */}
                  <button
                    onClick={handleToggleSpeech}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title="Listen to crystal-clear audio explanation"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  {/* Speech rate toggle when speaking */}
                  {isSpeaking && (
                    <button
                      onClick={() => setSpeechRate(speechRate === 1.0 ? 1.25 : 1.0)}
                      className="text-[11px] font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer"
                    >
                      {speechRate}x
                    </button>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyExplanation}
                    className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                    title="Copy full explanation"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleToggleBookmark}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
                      isBookmarked
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this doubt for later'}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Core Concept */}
              <div className="mt-3.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {resolution.coreConcept}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doubt: <span className="text-slate-700 font-medium">"{resolution.doubtText}"</span>
                </p>
              </div>
            </div>

            {/* Direct & Simple Answer Box */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      The Direct & Simple Answer
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Quick Insight
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                    {resolution.directAnswer || resolution.whyItsConfusing}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive View Navigation Tabs */}
            <div className="px-5 pt-3 pb-1 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Views:</span>
              {[
                { id: 'all' as ViewTab, label: 'Full Breakdown' },
                { id: 'intuition' as ViewTab, label: 'Intuition & Analogy' },
                { id: 'steps' as ViewTab, label: `Steps (${resolution.stepByStepSolution.length})` },
                { id: 'traps' as ViewTab, label: `Exam Traps (${resolution.commonPitfalls.length})` },
                { id: 'quiz' as ViewTab, label: 'Mastery Quiz' },
                ...(resolution.summaryBullets ? [{ id: 'revision' as ViewTab, label: 'Quick Summary' }] : [])
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer text-xs ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Body Sections */}
            <div className="p-5 space-y-5">
              {/* SECTION: Intuition & Analogy */}
              {(activeTab === 'all' || activeTab === 'intuition') && (
                <div className="space-y-4">
                  {/* Intuitive Real-World Analogy */}
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-slate-800 text-xs sm:text-sm leading-relaxed flex gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300/80 flex items-center justify-center shrink-0 text-amber-700">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <strong className="font-bold text-amber-900 block text-xs tracking-wide">
                        Memorable Everyday Analogy
                      </strong>
                      <p className="text-slate-800 font-normal">
                        {resolution.intuitiveAnalogy}
                      </p>
                    </div>
                  </div>

                  {/* Why It Confuses Students */}
                  {resolution.whyItsConfusing && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 flex gap-3">
                      <Compass className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-slate-900 block text-xs mb-0.5">
                          Why This Concept Feels Counter-Intuitive:
                        </strong>
                        <p>{resolution.whyItsConfusing}</p>
                      </div>
                    </div>
                  )}

                  {/* Real World Application */}
                  {resolution.realWorldExample && (
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-slate-800 flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="font-bold text-emerald-900 block text-xs mb-0.5">
                          Where You See This in the Real World:
                        </strong>
                        <p>{resolution.realWorldExample}</p>
                      </div>
                    </div>
                  )}

                  {/* Golden Formula or Axiom */}
                  {resolution.keyFormulaOrRule && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-indigo-200 font-mono text-xs flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold mb-1">
                          Golden Rule / Takeaway Axiom:
                        </span>
                        <span className="text-emerald-300 font-semibold">{resolution.keyFormulaOrRule}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (resolution.keyFormulaOrRule) {
                            navigator.clipboard.writeText(resolution.keyFormulaOrRule);
                          }
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                        title="Copy formula"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: Step-by-Step Breakdown */}
              {(activeTab === 'all' || activeTab === 'steps') && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>Step-by-Step Logical Derivation</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {resolution.stepByStepSolution.length} Clear Steps
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {resolution.stepByStepSolution.map((step, idx) => (
                      <div
                        key={idx}
                        className="group flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-xl border border-slate-200/90 transition-all"
                      >
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="text-slate-800">
                            {step.startsWith('**') ? (
                              <>
                                <strong className="font-bold text-slate-900">
                                  {step.split('**')[1]}
                                </strong>
                                {step.split('**')[2]}
                              </>
                            ) : (
                              step
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyStep(step, idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-1 rounded transition-all cursor-pointer"
                          title="Copy step"
                        >
                          {copiedStepIdx === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Common Pitfalls & Traps */}
              {(activeTab === 'all' || activeTab === 'traps') && (
                <div className="space-y-3 pt-1">
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2.5">
                    <h4 className="text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Exam Traps & Common Misconceptions to Avoid</span>
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                      {resolution.commonPitfalls.map((pitfall, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-rose-500 font-bold text-sm shrink-0">✕</span>
                          <span className="text-slate-800">{pitfall}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SECTION: Quick Revision Summary */}
              {(activeTab === 'all' || activeTab === 'revision') && resolution.summaryBullets && (
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>30-Second Rapid Revision</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {resolution.summaryBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTION: Interactive Mastery Quiz */}
              {(activeTab === 'all' || activeTab === 'quiz') && resolution.checkYourUnderstanding && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Check Your Understanding (Interactive Micro-Quiz)</span>
                    </h4>
                    {hasSubmittedQuiz && (
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setHasSubmittedQuiz(false);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {resolution.checkYourUnderstanding.question}
                    </p>

                    <div className="space-y-2">
                      {resolution.checkYourUnderstanding.options.map((opt, optIdx) => {
                        const isSelected = selectedQuizOption === optIdx;
                        const isCorrect = optIdx === resolution.checkYourUnderstanding.correctIndex;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedQuizOption(optIdx);
                              setHasSubmittedQuiz(true);
                            }}
                            className={`w-full text-left text-xs p-3 rounded-xl border transition-all cursor-pointer ${
                              hasSubmittedQuiz
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                                  : isSelected
                                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                                  : 'bg-white border-slate-200 text-slate-500 opacity-60'
                                : isSelected
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold'
                                : 'bg-white border-slate-200 hover:bg-indigo-50/40 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex-1">{opt}</span>
                              {hasSubmittedQuiz && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {hasSubmittedQuiz && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasSubmittedQuiz && (
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                        selectedQuizOption === resolution.checkYourUnderstanding.correctIndex
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50/80 border-amber-200 text-amber-900'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {selectedQuizOption === resolution.checkYourUnderstanding.correctIndex ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>🎉 Spot on! Great cognitive breakthrough!</span>
                            </>
                          ) : (
                            <>
                              <Lightbulb className="w-4 h-4 text-amber-600" />
                              <span>💡 Conceptual Clarification:</span>
                            </>
                          )}
                        </div>
                        <p>{resolution.checkYourUnderstanding.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bridge Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Feedback buttons */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">Helpful explanation?</span>
                <button
                  onClick={() => setFeedbackState('helpful')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    feedbackState === 'helpful'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span>Yes, super clear!</span>
                </button>
                <button
                  onClick={() => {
                    setFeedbackState('more');
                    onSendToTutor(`Can you explain "${resolution.coreConcept}" with another angle or deeper examples?`, resolution.subject as Subject);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    feedbackState === 'more'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Need more depth
                </button>
              </div>

              {/* Discuss in AI Tutor button */}
              <button
                onClick={() => onSendToTutor(`Let's dive deeper into my doubt: "${resolution.doubtText}". Can you test my intuition or give me practice problems?`, resolution.subject as Subject)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discuss with Socratic AI Tutor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
