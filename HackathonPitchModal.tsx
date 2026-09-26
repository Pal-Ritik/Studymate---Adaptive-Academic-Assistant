import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Award, 
  Layers, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Zap,
  Target
} from 'lucide-react';
import { HACKATHON_PITCH_SLIDES } from '../data/mockAcademicData';
import { NavTab } from './Navigation';

interface HackathonPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToFeature: (tab: NavTab) => void;
}

export const HackathonPitchModal: React.FC<HackathonPitchModalProps> = ({
  isOpen,
  onClose,
  onJumpToFeature,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  const currentSlide = HACKATHON_PITCH_SLIDES[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Track 4: Education Hackathon Pitch & Value Showcase
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  StudyMate
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Interactive presentation deck & competitive differentiation matrix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Slide Indicator Dots */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {HACKATHON_PITCH_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-8 bg-indigo-600'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Slide {currentSlideIndex + 1} of {HACKATHON_PITCH_SLIDES.length}
            </span>
          </div>

          {/* Active Slide Content */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full inline-block">
              {currentSlide.badge}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentSlide.title}
            </h2>

            <div className="space-y-3 pt-2">
              {currentSlide.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs sm:text-sm leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Metric Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center gap-3 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="text-xs sm:text-sm font-semibold">
                <span className="text-amber-300 font-bold">Key Validation Metric: </span>
                {currentSlide.metric}
              </div>
            </div>
          </div>

          {/* Comparative Differentiation Table: Why Cognita AI is Unique */}
          {currentSlideIndex === 1 && (
            <div className="pt-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Competitive Landscape: What Did Not Exist Before</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Capability</th>
                      <th className="p-3 text-indigo-700 font-extrabold bg-indigo-50/50">Cognita AI (Our Hub)</th>
                      <th className="p-3 text-slate-500">Traditional LMS</th>
                      <th className="p-3 text-slate-500">Generic Chatbots</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold">Unified Cognitive Loop</td>
                      <td className="p-3 font-bold text-indigo-600 bg-indigo-50/20">Yes (Doubts ➔ Quiz ➔ Schedule)</td>
                      <td className="p-3 text-slate-400">No (Static Files)</td>
                      <td className="p-3 text-slate-400">No (Stateless Chat)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Socratic Guardrails</td>
                      <td className="p-3 font-bold text-indigo-600 bg-indigo-50/20">Yes (Prevents answer cheating)</td>
                      <td className="p-3 text-slate-400">N/A</td>
                      <td className="p-3 text-rose-500">Fails (Dumps answers)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Educator Rubric Generation</td>
                      <td className="p-3 font-bold text-indigo-600 bg-indigo-50/20">Yes (3-Tiered + LMS Export)</td>
                      <td className="p-3 text-slate-400">Manual Entry (Hours)</td>
                      <td className="p-3 text-slate-400">Unstructured Text</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Industry 2026 Career Sync</td>
                      <td className="p-3 font-bold text-indigo-600 bg-indigo-50/20">Yes (Tangible Capstone Milestones)</td>
                      <td className="p-3 text-slate-400">Disconnected</td>
                      <td className="p-3 text-slate-400">Generic Advice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1-Click Interactive Demo Flow Shortcuts */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Launch Live Feature Prototypes For Judges:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => {
                  onJumpToFeature('guide');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                ★ Personalized Guide
              </button>
              <button
                onClick={() => {
                  onJumpToFeature('tutor');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                1. AI Tutor
              </button>
              <button
                onClick={() => {
                  onJumpToFeature('doubt');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                2. Doubt Resolver
              </button>
              <button
                onClick={() => {
                  onJumpToFeature('quiz');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                3. Adaptive Quiz
              </button>
              <button
                onClick={() => {
                  onJumpToFeature('assignment');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                4. Rubric Studio
              </button>
              <button
                onClick={() => {
                  onJumpToFeature('faculty');
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-900 border border-violet-200 text-xs font-semibold text-center transition-all cursor-pointer"
              >
                🏛️ Faculty & Organizer Hub
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Slide Navigation */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentSlideIndex < HACKATHON_PITCH_SLIDES.length - 1 ? (
              <button
                onClick={() => setCurrentSlideIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Start Exploring Prototype</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
