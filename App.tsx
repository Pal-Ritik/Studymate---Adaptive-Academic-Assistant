import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileView } from './components/UserProfileView';
import { AITutorView } from './components/AITutorView';
import { DoubtResolverView } from './components/DoubtResolverView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { AssignmentGeneratorView } from './components/AssignmentGeneratorView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { CareerGuidanceView } from './components/CareerGuidanceView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { PersonalizedGuideView } from './components/PersonalizedGuideView';
import { FacultyOrganizerView } from './components/FacultyOrganizerView';
import { HackathonPitchModal } from './components/HackathonPitchModal';
import { DEFAULT_USERS } from './data/mockUserData';
import { UserProfile, Subject } from './types';
import { GraduationCap, Sparkles } from 'lucide-react';
import { evaluateUserStreakOnVisit, recordUserPracticeAction } from './utils/streakManager';

const USERS_STORAGE_KEY = 'studymate_users_v2';
const CURRENT_USER_ID_KEY = 'studymate_current_user_id_v2';

export default function App() {
  // All registered users list (loaded from localStorage or default demo users)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to parse saved users, defaulting to mock data', err);
    }
    return DEFAULT_USERS;
  });

  // Current logged in user (null triggers the Login Portal first)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedId = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (savedId) {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        const list: UserProfile[] = stored ? JSON.parse(stored) : DEFAULT_USERS;
        const found = list.find((u) => u.id === savedId);
        if (found) {
          return evaluateUserStreakOnVisit(found);
        }
      }
    } catch (err) {
      console.warn('Failed to parse current user ID', err);
    }
    return null;
  });

  // Active navigation tab (defaults to 'profile' so students see their own progress & weakness points immediately on login)
  const [activeTab, setActiveTab] = useState<NavTab>('profile');
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Cross-module bridge params for quiz
  const [quizTargetTopic, setQuizTargetTopic] = useState<string | undefined>(undefined);
  const [quizTargetSubject, setQuizTargetSubject] = useState<Subject | undefined>(undefined);

  // Sync users list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('Failed to persist users to localStorage', err);
    }
  }, [users]);

  // Sync current user ID to localStorage whenever currentUser changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_ID_KEY, currentUser.id);
      } else {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
      }
    } catch (err) {
      console.warn('Failed to persist current user ID to localStorage', err);
    }
  }, [currentUser]);

  // Login handler with realistic streak check
  const handleLoginSuccess = (user: UserProfile) => {
    const verifiedUser = evaluateUserStreakOnVisit(user);
    setCurrentUser(verifiedUser);
    setUsers((prev) => prev.map((u) => (u.id === verifiedUser.id ? verifiedUser : u)));
    // If faculty, open faculty portal; otherwise student profile
    if (verifiedUser.role === 'faculty') {
      setActiveTab('faculty');
    } else {
      setActiveTab('profile');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  };

  // Register new student user
  const handleRegisterUser = (newUser: UserProfile) => {
    setUsers((prev) => {
      const existingIdx = prev.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newUser;
        return updated;
      }
      return [newUser, ...prev];
    });
  };

  // Remove student account from registered list
  const handleRemoveUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Restore default demo student accounts if needed
  const handleRestoreDefaultUsers = () => {
    setUsers(DEFAULT_USERS);
  };

  // Update current user profile or weak topics
  const handleUpdateCurrentUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Helper to log real-time activity and mark realistic practice for today
  const handleLogActivity = (activity: {
    title: string;
    type: 'tutor' | 'quiz' | 'doubt' | 'assignment' | 'planner' | 'guide';
    highlight: string;
  }) => {
    if (!currentUser) return;

    // Record realistic practice for today's streak calendar
    const practicedUser = recordUserPracticeAction(currentUser);

    const newAct = {
      id: `act-${Date.now()}`,
      type: activity.type,
      title: activity.title,
      date: 'Just now',
      highlight: activity.highlight,
    };

    let doubtsCount = practicedUser.stats.doubtsResolvedCount;
    if (activity.type === 'doubt') {
      doubtsCount += 1;
    }

    const updatedStats = {
      ...practicedUser.stats,
      doubtsResolvedCount: doubtsCount,
      recentActivities: [newAct, ...practicedUser.stats.recentActivities.slice(0, 7)],
    };

    handleUpdateCurrentUser({
      ...practicedUser,
      stats: updatedStats,
    });
  };

  // Helper when student completes a quiz - records realistic practice
  const handleQuizCompleted = (attempt: {
    quizTitle: string;
    score: number;
    total: number;
    timeSpentSeconds: number;
  }) => {
    if (!currentUser) return;

    // Record realistic practice for today's streak calendar
    const practicedUser = recordUserPracticeAction(currentUser);

    const percent = Math.round((attempt.score / attempt.total) * 100);
    const newQuizCount = practicedUser.stats.quizzesCompletedCount + 1;
    const updatedAvg = Math.round(
      (practicedUser.stats.averageQuizScore * practicedUser.stats.quizzesCompletedCount + percent) / newQuizCount
    );

    const newAct = {
      id: `act-${Date.now()}`,
      type: 'quiz' as const,
      title: attempt.quizTitle,
      date: 'Just now',
      highlight: `Scored ${attempt.score}/${attempt.total} (${percent}%)`,
    };

    const updatedStats = {
      ...practicedUser.stats,
      quizzesCompletedCount: newQuizCount,
      averageQuizScore: updatedAvg,
      recentActivities: [newAct, ...practicedUser.stats.recentActivities.slice(0, 7)],
    };

    handleUpdateCurrentUser({
      ...practicedUser,
      stats: updatedStats,
    });
  };

  // Bridge from Doubt Resolver, Weakness Cards, or Guide to AI Tutor
  const handleSendToTutor = (text: string, subject: Subject) => {
    setActiveTab('tutor');
  };

  // Bridge from Weakness Cards to Quiz Generator
  const handleSendToQuiz = (topic: string, subject: Subject) => {
    setQuizTargetTopic(topic);
    setQuizTargetSubject(subject);
    setActiveTab('quiz');
  };

  // IF NOT LOGGED IN: Render Login & Registration Portal
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        availableUsers={users}
        onRegisterUser={handleRegisterUser}
        onRemoveUser={handleRemoveUser}
        onRestoreDefaultUsers={handleRestoreDefaultUsers}
      />
    );
  }

  // IF LOGGED IN: Render StudyMate Full Application
  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col font-sans text-stone-900 selection:bg-amber-200 selection:text-stone-900">
      {/* Top Navigation Bar with Current User Badge & Tab Selectors */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
        streakDays={currentUser.stats.studyStreakDays}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Faculty & Organizer Command Hub */}
        {activeTab === 'faculty' && (
          <FacultyOrganizerView
            currentUser={currentUser}
            allUsers={users}
            onUpdateUser={handleUpdateCurrentUser}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* User Page: Personal Progress & Diagnosed Weakness Points */}
        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateCurrentUser}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
            onSendToTutor={handleSendToTutor}
            onSendToQuiz={handleSendToQuiz}
          />
        )}

        {/* Global Performance Hub */}
        {activeTab === 'dashboard' && (
          <ProgressDashboardView
            stats={currentUser.stats}
            currentUser={currentUser}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* AI Personalized Diagnostic Guide */}
        {activeTab === 'guide' && (
          <PersonalizedGuideView
            currentUser={currentUser}
            userWeakTopics={currentUser.weakTopics}
            onUpdateWeakTopics={(topics) =>
              handleUpdateCurrentUser({ ...currentUser, weakTopics: topics })
            }
            onNavigateTab={setActiveTab}
            onSendToTutor={handleSendToTutor}
            onActivityLogged={handleLogActivity}
          />
        )}

        {/* Socratic AI Tutor */}
        {activeTab === 'tutor' && (
          <AITutorView onActivityLogged={handleLogActivity} />
        )}

        {/* Doubt Resolver */}
        {activeTab === 'doubt' && (
          <DoubtResolverView
            onActivityLogged={handleLogActivity}
            onSendToTutor={handleSendToTutor}
          />
        )}

        {/* Quiz Generator */}
        {activeTab === 'quiz' && (
          <QuizGeneratorView
            onQuizCompleted={handleQuizCompleted}
            initialTopic={quizTargetTopic}
            initialSubject={quizTargetSubject}
            onSendToTutor={handleSendToTutor}
          />
        )}

        {/* Assignment & Rubric Studio */}
        {activeTab === 'assignment' && (
          <AssignmentGeneratorView onActivityLogged={handleLogActivity} />
        )}

        {/* Adaptive Study Planner */}
        {activeTab === 'planner' && (
          <StudyPlannerView onActivityLogged={handleLogActivity} />
        )}

        {/* Career & Milestone Guidance */}
        {activeTab === 'career' && (
          <CareerGuidanceView onActivityLogged={handleLogActivity} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-[#faf9f5]/90 py-4 px-4 sm:px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <GraduationCap className="w-4 h-4 text-stone-700" />
            <span className="font-serif font-bold text-stone-900">StudyMate</span>
            <span>— Academic Mentorship & Personalized Guidance</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-stone-600 font-medium">
              Student Desk: <strong className="text-stone-900">{currentUser.name}</strong> ({currentUser.email})
            </span>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="text-stone-700 hover:text-stone-900 font-semibold cursor-pointer underline"
            >
              Pitch Deck
            </button>
          </div>
        </div>
      </footer>

      {/* Hackathon Pitch & Value Showcase Modal */}
      <HackathonPitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        onJumpToFeature={setActiveTab}
      />
    </div>
  );
}
