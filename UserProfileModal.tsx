import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  Flame, 
  Clock, 
  Award, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  RotateCcw
} from 'lucide-react';
import { UserProfile, WeakTopicItem } from '../types';
import { NavTab } from './Navigation';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLogout: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white/20 shrink-0">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{user.name}</h3>
                <span className="text-[10px] px-2.5 py-0.5 font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Student
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <span>•</span>
                <span>{user.academicLevel}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/10">
                  {user.majorOrFocus}
                </span>
                <span className="text-xs font-medium text-indigo-300">
                  Target: {user.targetGoal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Study Streak
              </span>
              <span className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                {user.stats.studyStreakDays}d
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Hours Studied
              </span>
              <span className="text-xl font-black text-indigo-600">
                {user.stats.weeklyHoursStudied}h
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Doubts Solved
              </span>
              <span className="text-xl font-black text-emerald-600">
                {user.stats.doubtsResolvedCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Quiz Avg
              </span>
              <span className="text-xl font-black text-purple-600">
                {user.stats.averageQuizScore}%
              </span>
            </div>
          </div>

          {/* User's Specific Diagnosed Weakness Points */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-600" />
                <h4 className="text-sm font-extrabold text-slate-900">
                  Your Diagnosed Cognitive Weakness Points ({user.weakTopics.length})
                </h4>
              </div>
              <button
                onClick={() => {
                  onNavigateTab('guide');
                  onClose();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {user.weakTopics.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>No active critical weaknesses logged! Keep testing with quizzes to discover new opportunities.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {user.weakTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {topic.topicName}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              topic.severity === 'Critical Gap'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {topic.severity}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {topic.subject} • Mastery: {topic.masteryScore}%
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-700 shrink-0">
                        {topic.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Root Cause:</strong> {topic.rootCause}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white border border-rose-100 text-[11px] text-slate-700 space-y-1">
                      <strong className="text-indigo-900 block font-bold">Top Suggestion:</strong>
                      <p>{topic.actionableSuggestions[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of StudyMate</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('dashboard');
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>Visit My Academic Progress Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
