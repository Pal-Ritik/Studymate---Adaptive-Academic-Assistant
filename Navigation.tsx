import React from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  HelpCircle, 
  FileCheck2, 
  FileSpreadsheet, 
  CalendarRange, 
  Compass, 
  BarChart3, 
  Target,
  User,
  LogOut,
  Flame,
  Building2,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 
  | 'profile'
  | 'guide'
  | 'tutor' 
  | 'doubt' 
  | 'quiz' 
  | 'assignment' 
  | 'planner' 
  | 'career' 
  | 'dashboard'
  | 'faculty';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenPitchModal: () => void;
  streakDays: number;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenPitchModal,
  streakDays,
  currentUser,
  onLogout,
}) => {
  const tabs = [
    { id: 'profile' as NavTab, label: 'My Page & Weaknesses', icon: User },
    { id: 'faculty' as NavTab, label: 'Faculty & Organizer Hub', icon: Building2 },
    { id: 'guide' as NavTab, label: 'Personalized Guide', icon: Target },
    { id: 'tutor' as NavTab, label: 'Socratic Tutor', icon: MessageSquare },
    { id: 'doubt' as NavTab, label: 'Doubt Resolver', icon: HelpCircle },
    { id: 'quiz' as NavTab, label: 'Practice Quiz', icon: FileCheck2 },
    { id: 'assignment' as NavTab, label: 'Assignment Studio', icon: FileSpreadsheet },
    { id: 'planner' as NavTab, label: 'Study Planner', icon: CalendarRange },
    { id: 'career' as NavTab, label: 'Career Guidance', icon: Compass },
    { id: 'dashboard' as NavTab, label: 'Progress Hub', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f5]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Wordmark & Human Academic Feel */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-stone-100 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-stone-900 tracking-tight text-xl">
                  Study<span className="italic font-normal text-amber-800">Mate</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] text-stone-500 font-medium">
                  · Academic Guidance & Mentorship
                </span>
              </div>
            </div>
          </div>

          {/* Action Area: Streak, Pitch Deck & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              title="Consecutive days studied on StudyMate"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-900"
            >
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{streakDays} Day Study Rhythm</span>
            </div>

            <button
              id="pitch-showcase-btn"
              onClick={onOpenPitchModal}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>Pitch Deck</span>
            </button>

            {/* User Profile Button / Switcher */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-stone-200 gap-1.5">
              <button
                id="user-profile-header-btn"
                onClick={() => setActiveTab('profile')}
                title="View My Student Page & Weakness Points"
                className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer group ${
                  activeTab === 'profile'
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'bg-white hover:bg-stone-100 border border-stone-200 text-stone-800'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg font-serif font-bold text-xs flex items-center justify-center shrink-0 ${
                  activeTab === 'profile' ? 'bg-stone-700 text-stone-100' : 'bg-stone-100 text-stone-800'
                }`}>
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-semibold block leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] block leading-tight truncate max-w-[130px] ${
                    activeTab === 'profile' ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    {currentUser.role === 'faculty' ? 'Faculty Mentor' : (currentUser.organization && currentUser.organization !== 'NA' ? currentUser.organization : 'Individual Student')}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-stone-200/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-200' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
