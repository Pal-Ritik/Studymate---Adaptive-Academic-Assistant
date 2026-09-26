import React from 'react';
import { 
  BarChart3, 
  Award, 
  Clock, 
  HelpCircle, 
  FileCheck2, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Target,
  Check
} from 'lucide-react';
import { StudentStats, UserProfile } from '../types';
import { NavTab } from './Navigation';
import { getWeeklyStreakCalendar, getTodayDateString } from '../utils/streakManager';

interface ProgressDashboardViewProps {
  stats: StudentStats;
  onNavigateTab: (tab: NavTab) => void;
  currentUser?: UserProfile;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  stats,
  onNavigateTab,
  currentUser,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Top Header Banner: Dignified Scholar Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="text-xs text-amber-300 font-medium">
            Academic Growth & Disciplinary Analytics {currentUser ? `· ${currentUser.name}` : ''}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {currentUser ? `${currentUser.name}'s Academic Progress Hub` : 'Student Academic Progress Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-serif max-w-2xl leading-relaxed">
            {currentUser ? (
              <span>Focusing on <strong>{currentUser.majorOrFocus}</strong> ({currentUser.academicLevel}). Target goal: <em>"{currentUser.targetGoal}"</em></span>
            ) : (
              'Multi-dimensional tracking connecting your doubts, quiz attempts, study sprints, and career milestone progression.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-center">
            <span className="text-[10px] uppercase font-medium text-stone-400 block">Study Rhythm</span>
            <span className="text-lg sm:text-xl font-serif font-bold text-amber-300 flex items-center justify-center gap-1.5 mt-0.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {stats.studyStreakDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* 2. 4 Core Academic Vital Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 block mb-1">Weekly Study Time</span>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {stats.weeklyHoursStudied} <span className="text-xs font-normal text-stone-500 font-sans">hrs</span>
            </div>
            <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-stone-500" />
              Consistent pace
            </span>
          </div>
          <Clock className="w-6 h-6 text-stone-400" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 block mb-1">Average Quiz Score</span>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {stats.averageQuizScore}%
            </div>
            <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1 mt-1">
              <FileCheck2 className="w-3 h-3 text-stone-500" />
              {stats.quizzesCompletedCount} Quizzes Completed
            </span>
          </div>
          <Award className="w-6 h-6 text-stone-400" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 block mb-1">Doubts Deconstructed</span>
            <div className="text-2xl font-serif font-bold text-stone-900">
              {stats.doubtsResolvedCount}
            </div>
            <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1 mt-1">
              Concept clarity checked
            </span>
          </div>
          <HelpCircle className="w-6 h-6 text-stone-400" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 block mb-1">Estimated Retention</span>
            <div className="text-2xl font-serif font-bold text-stone-900">
              91.8%
            </div>
            <span className="text-[11px] font-medium text-stone-600 flex items-center gap-1 mt-1">
              Spaced practice active
            </span>
          </div>
          <BookOpen className="w-6 h-6 text-stone-400" />
        </div>
      </div>

      {/* 3. Study Rhythm Calendar */}
      {currentUser && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-serif font-bold text-stone-900">
              Consecutive Study Rhythm: {currentUser.stats.studyStreakDays} Days
            </h3>
            <p className="text-xs text-stone-600 font-serif max-w-xl">
              {currentUser.streakDetails?.practicedDates?.includes(getTodayDateString())
                ? 'Your active study practice is logged for today. Daily reviews build resilient neural memory.'
                : 'Visit recorded for today. Work through a quiz or doubt resolution to log today’s active study practice.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {getWeeklyStreakCalendar(currentUser).map((day) => (
              <div 
                key={day.date}
                className={`flex flex-col items-center justify-center w-9 py-1 rounded-xl border text-center transition-all ${
                  day.practiced
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                    : day.visited
                    ? 'bg-stone-100 border-stone-300 text-stone-700'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
                title={`${day.date}: ${day.practiced ? 'Practiced' : day.visited ? 'Visited' : 'No activity'}`}
              >
                <span className="text-[9px] font-medium uppercase">{day.dayLabel}</span>
                <span className="mt-0.5">
                  {day.practiced ? (
                    <Check className="w-3.5 h-3.5 text-amber-800" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 block my-1"></span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Focus Areas Callout: Calm, warm invitation */}
      <div className="bg-stone-100/70 border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Targeted Focus Points
          </span>
          <h3 className="text-base font-serif font-bold text-stone-900 mt-0.5">
            {currentUser ? `${currentUser.weakTopics.length} struggle points diagnosed in your coursework` : 'Personalized recovery plan ready'}
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl font-serif">
            {currentUser && currentUser.weakTopics.length > 0 ? (
              <span>
                Active focus points: <strong>{currentUser.weakTopics.map(t => t.topicName.split(':')[0]).slice(0, 3).join(', ')}</strong>. Explore step-by-step intuition and practice sets.
              </span>
            ) : (
              'Isolate specific cognitive blockers in your coursework with gentle, step-by-step suggestions.'
            )}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('guide')}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>Open Study Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Subject Mastery Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Disciplinary Competencies Breakdown
            </h3>
            <p className="text-xs text-stone-500 font-serif mt-0.5">
              Weighted composite understanding from tutor dialogues, doubt queries, and quiz checkpoints.
            </p>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Live Diagnostics
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {stats.conceptMastery.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-stone-800">{item.subject}</span>
                <span className="font-mono text-stone-700">{item.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-stone-800"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
