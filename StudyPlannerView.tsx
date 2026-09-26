import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  BrainCircuit, 
  Target, 
  Calendar,
  Flame,
  Zap
} from 'lucide-react';
import { StudyPlan, StudyTaskItem } from '../types';

interface StudyPlannerViewProps {
  onActivityLogged: (activity: { title: string; type: 'planner'; highlight: string }) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ onActivityLogged }) => {
  const [goalName, setGoalName] = useState('Finals & Midterms Academic Sprint');
  const [daysCount, setDaysCount] = useState(7);
  const [dailyHours, setDailyHours] = useState(3);
  const [subjectsInput, setSubjectsInput] = useState('Data Structures & Algorithms, Multivariable Calculus, Organic Chemistry');
  const [weakAreas, setWeakAreas] = useState('Dynamic programming memoization, Triple integrals in spherical coordinates, Electrophilic additions');
  const [isLoading, setIsLoading] = useState(false);

  // Active day selection
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Study plan state
  const [plan, setPlan] = useState<StudyPlan>({
    id: 'plan-1',
    goalName: 'Finals & Midterms Academic Sprint',
    targetDate: 'Next 7 Days',
    totalDays: 7,
    dailyHoursAvailable: 3,
    subjects: [
      { name: 'Data Structures & Algorithms', targetScore: '94%+', priority: 'High' },
      { name: 'Multivariable Calculus', targetScore: '90%+', priority: 'High' },
      { name: 'Organic Chemistry', targetScore: '88%+', priority: 'Medium' },
    ],
    overallStrategy: 'Cognitive Science Spaced Repetition + Interleaving: High-focus active problem sets paired with 45-minute timed active recall intervals to maximize neural synaptic consolidation.',
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Day 1 (Monday)',
        focusTheme: 'Foundational Diagnostic & Weak Area Remediation',
        dailyGoal: 'Deconstruct dynamic programming states and solve 5 core recurrence relations',
        tasks: [
          {
            id: 'task-1-1',
            title: 'Concept Deconstruction: Dynamic Programming DAG Topology',
            subject: 'Data Structures & Algorithms',
            durationMinutes: 45,
            priority: 'High',
            technique: 'Active Recall',
            completed: true,
          },
          {
            id: 'task-1-2',
            title: 'Deliberate Problem Drilling: 0/1 Knapsack & Longest Common Subsequence',
            subject: 'Data Structures & Algorithms',
            durationMinutes: 60,
            priority: 'High',
            technique: 'Practice Problems',
            completed: true,
          },
          {
            id: 'task-1-3',
            title: 'Calculus Review: Converting Double Integrals to Polar/Cylindrical Coordinates',
            subject: 'Multivariable Calculus',
            durationMinutes: 45,
            priority: 'Medium',
            technique: 'Spaced Review',
            completed: false,
          },
          {
            id: 'task-1-4',
            title: 'Flash Quiz & Synthesis: Summarize 4 Key Recurrence Invariants in Notebook',
            subject: 'Data Structures & Algorithms',
            durationMinutes: 30,
            priority: 'Low',
            technique: 'Synthesizing Notes',
            completed: false,
          },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 (Tuesday)',
        focusTheme: 'Calculus Deep Dive & Spatial Coordinate Transformations',
        dailyGoal: 'Master Jacobian determinants and volume elements in spherical coordinates',
        tasks: [
          {
            id: 'task-2-1',
            title: 'Active Proof Derivation: Deriving Jacobian dV = rho^2 sin(phi) drho dphi dtheta',
            subject: 'Multivariable Calculus',
            durationMinutes: 50,
            priority: 'High',
            technique: 'Active Recall',
            completed: false,
          },
          {
            id: 'task-2-2',
            title: 'Problem Set: Computing Mass & Center of Gravity on Spherical Shells',
            subject: 'Multivariable Calculus',
            durationMinutes: 60,
            priority: 'High',
            technique: 'Practice Problems',
            completed: false,
          },
          {
            id: 'task-2-3',
            title: 'Interleaved Quick Check: 3 Random Dynamic Programming LeetCode Mediums',
            subject: 'Data Structures & Algorithms',
            durationMinutes: 40,
            priority: 'Medium',
            technique: 'Spaced Review',
            completed: false,
          },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 (Wednesday)',
        focusTheme: 'Organic Chemistry Reaction Mechanisms & Synthesis',
        dailyGoal: 'Map out Markovnikov vs Anti-Markovnikov addition stereochemistry',
        tasks: [
          {
            id: 'task-3-1',
            title: 'Stereochemistry Rules: Alkene Bromination & Hydroboration Oxidation',
            subject: 'Organic Chemistry',
            durationMinutes: 50,
            priority: 'High',
            technique: 'Active Recall',
            completed: false,
          },
          {
            id: 'task-3-2',
            title: 'Multi-Step Retrosynthesis Puzzle Solving',
            subject: 'Organic Chemistry',
            durationMinutes: 65,
            priority: 'High',
            technique: 'Practice Problems',
            completed: false,
          },
          {
            id: 'task-3-3',
            title: 'Calculus Spaced Check: 2 Surface Integral Flux Problems',
            subject: 'Multivariable Calculus',
            durationMinutes: 45,
            priority: 'Medium',
            technique: 'Spaced Review',
            completed: false,
          },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 (Thursday)',
        focusTheme: 'Mid-Sprint Mock Simulation & Weak Area Retest',
        dailyGoal: 'Complete a timed 90-minute cross-subject diagnostic',
        tasks: [
          {
            id: 'task-4-1',
            title: 'Timed Simulation: 5 Mixed Algorithmic & Calculus Problems',
            subject: 'Data Structures & Algorithms',
            durationMinutes: 90,
            priority: 'High',
            technique: 'Practice Problems',
            completed: false,
          },
          {
            id: 'task-4-2',
            title: 'Error Log Diagnostics: Feed Mistakes into Cognita Doubt Resolver',
            subject: 'Cross-Disciplinary',
            durationMinutes: 45,
            priority: 'High',
            technique: 'Active Recall',
            completed: false,
          },
        ],
      },
    ],
  });

  // Pomodoro Focus Timer
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isTimerRunning) {
      if (timerMode === 'study') {
        setTimerMode('break');
        setPomodoroSeconds(5 * 60);
      } else {
        setTimerMode('study');
        setPomodoroSeconds(25 * 60);
      }
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, pomodoroSeconds, timerMode]);

  const handleToggleTask = (dayIndex: number, taskId: string) => {
    setPlan((prev) => {
      const updatedSchedule = [...prev.schedule];
      const targetDay = { ...updatedSchedule[dayIndex] };
      targetDay.tasks = targetDay.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      updatedSchedule[dayIndex] = targetDay;
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleGeneratePlan = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const subjectsArray = subjectsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const response = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalName,
          daysCount,
          dailyHours,
          subjects: subjectsArray,
          weakAreas,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data: StudyPlan = await response.json();
      setPlan(data);
      setActiveDayIndex(0);
      onActivityLogged({
        title: `Adaptive Study Schedule Generated`,
        type: 'planner',
        highlight: `${daysCount} days with ${dailyHours} hrs/day for ${goalName}`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDay = plan.schedule[activeDayIndex] || plan.schedule[0];
  const completedTasksCount = currentDay ? currentDay.tasks.filter((t) => t.completed).length : 0;
  const totalTasksCount = currentDay ? currentDay.tasks.length : 1;
  const dayCompletionPct = Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <div className="space-y-6">
      {/* Planner Setup Studio */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="max-w-3xl mb-5">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <CalendarRange className="w-4 h-4" />
            <span>Spaced Repetition & Cognitive Schedule Architect</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Adaptive Study Planner
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Replaces chaotic all-nighters with proven cognitive science schedules: active recall intervals, spaced interleaving, and targeted weak-spot drilling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Goal / Exam Title</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. GRE Prep, Midterm Sprint, Finals Week..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Time Horizon (Days)</label>
            <select
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={3}>3 Days (Crash Prep)</option>
              <option value={7}>7 Days (1 Week Sprint)</option>
              <option value={14}>14 Days (2 Weeks Mastery)</option>
              <option value={21}>21 Days (Exam Block)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Daily Study Hours</label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={2}>2 Hours / Day</option>
              <option value={3}>3 Hours / Day</option>
              <option value={4}>4 Hours / Day</option>
              <option value={6}>6 Hours / Day (Intensive)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subjects (comma-separated)</label>
            <input
              type="text"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Known Weak Spots & Blind Spots</label>
            <input
              type="text"
              value={weakAreas}
              onChange={(e) => setWeakAreas(e.target.value)}
              placeholder="e.g. Integration by parts, dynamic programming..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            id="generate-planner-btn"
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="flex items-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Calibrating Schedule...' : 'Regenerate Adaptive Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Main Schedule & Pomodoro Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule Timeline & Active Day Tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {plan.schedule.map((day, idx) => {
              const isSelected = idx === activeDayIndex;
              const completedCount = day.tasks.filter((t) => t.completed).length;
              const allDone = completedCount === day.tasks.length && day.tasks.length > 0;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex flex-col items-center p-3 rounded-2xl border min-w-[96px] text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-sm font-extrabold mt-0.5">
                    {completedCount}/{day.tasks.length}
                  </span>
                  <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : allDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {allDone ? 'Done' : `${Math.round((completedCount / (day.tasks.length || 1)) * 100)}%`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Day Task Card */}
          {currentDay && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {currentDay.dayName}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {currentDay.focusTheme}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    🎯 Daily Target: {currentDay.dailyGoal}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">
                    Day Progress: {dayCompletionPct}%
                  </div>
                  <div className="w-28 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${dayCompletionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Checklist */}
              <div className="space-y-3">
                {currentDay.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(activeDayIndex, task.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      task.completed
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-2xs'
                    }`}
                  >
                    <button
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          task.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {task.technique}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>{task.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {task.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Pomodoro Focus Timer & Strategy Note */}
        <div className="space-y-4">
          {/* Pomodoro Focus Companion */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md text-center">
            <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pomodoro Active Sprint</span>
            </div>

            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-indigo-200 inline-block mb-3">
              {timerMode === 'study' ? '🧠 Deep Focus Interval (25m)' : '☕ Cognitive Reset Break (5m)'}
            </span>

            {/* Countdown display */}
            <div className="text-5xl font-mono font-black tracking-tight my-2">
              {Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0')}:
              {(pomodoroSeconds % 60).toString().padStart(2, '0')}
            </div>

            {/* Timer controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pause Sprint' : 'Start Sprint'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroSeconds(timerMode === 'study' ? 25 * 60 : 5 * 60);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Strategy Insight Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>Cognitive Architecture Strategy</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {plan.overallStrategy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
