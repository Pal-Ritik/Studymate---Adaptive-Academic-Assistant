import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  BookOpen, 
  Target, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  BrainCircuit, 
  TrendingUp, 
  Award, 
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Info,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  X,
  RotateCcw,
  LogIn,
  Building2
} from 'lucide-react';
import { Subject, UserProfile } from '../types';
import { ALL_SUBJECTS } from '../data/mockAcademicData';
import { getTodayDateString } from '../utils/streakManager';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  availableUsers: UserProfile[];
  onRegisterUser: (newUser: UserProfile) => void;
  onRemoveUser?: (userId: string) => void;
  onRestoreDefaultUsers?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  availableUsers,
  onRegisterUser,
  onRemoveUser,
  onRestoreDefaultUsers,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign-in state
  const [signInEmail, setSignInEmail] = useState('ritik.pal7905@gmail.com');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInSuccessMessage, setSignInSuccessMessage] = useState<string | null>(null);

  // Quick Select Menu & Modal States
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserProfile | null>(null);
  const [modalPasswordVisible, setModalPasswordVisible] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserProfile | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [quickSelectRoleFilter, setQuickSelectRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');

  // Sign-up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpMajor, setSignUpMajor] = useState<Subject>('Computer Science & AI');
  const [signUpLevel, setSignUpLevel] = useState('Undergraduate');
  const [signUpGoal, setSignUpGoal] = useState('Upcoming Semester Exams & Concept Mastery');
  const [signUpOrganization, setSignUpOrganization] = useState('');
  const [signUpRole, setSignUpRole] = useState<'student' | 'faculty'>('student');
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Helper to copy password to clipboard
  const handleCopyPassword = (pwd: string) => {
    navigator.clipboard?.writeText(pwd);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Helper to auto-fill password into sign-in form
  const handleFillPasswordAndProceed = (user: UserProfile) => {
    const pwd = user.password || 'password123';
    setAuthMode('signin');
    setSignInEmail(user.email);
    setSignInPassword(pwd);
    setPasswordModalUser(null);
    setSignInError(null);
    setSignInSuccessMessage(`Password loaded for ${user.name}. Click "Verify Password & Open Dashboard" below to continue.`);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  // Confirm removal of account
  const handleConfirmRemoveUser = () => {
    if (!userToRemove) return;
    const removedName = userToRemove.name;
    const removedEmail = userToRemove.email;
    const removedId = userToRemove.id;

    if (onRemoveUser) {
      onRemoveUser(removedId);
    }

    setUserToRemove(null);
    setActiveMenuUserId(null);

    // If current sign-in input was this user's email, clear it
    if (signInEmail.toLowerCase() === removedEmail.toLowerCase()) {
      setSignInEmail('');
      setSignInPassword('');
    }

    setActionFeedback(`Account for ${removedName} (${removedEmail}) has been removed.`);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  // Handle real sign in with credential verification
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setSignInSuccessMessage(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    const cleanPassword = signInPassword.trim();

    if (!cleanEmail) {
      setSignInError('Please enter your student email address.');
      return;
    }

    if (!cleanPassword) {
      setSignInError('Please enter your account password to sign in.');
      passwordInputRef.current?.focus();
      return;
    }

    // Lookup user in registered users list
    const existing = availableUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      setSignInError(`No registered account found for "${cleanEmail}". If you are a new student, please register first using the "Create Account" tab above.`);
      return;
    }

    // Verify password against stored credential
    const expectedPassword = existing.password || 'password123';
    if (cleanPassword !== expectedPassword) {
      setSignInError('Incorrect password for this student account. Please verify your password and try again.');
      passwordInputRef.current?.focus();
      return;
    }

    // Credentials verified successfully
    onLoginSuccess(existing);
  };

  // Handle new student registration
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setSignInSuccessMessage(null);

    const cleanEmail = signUpEmail.trim().toLowerCase();
    const cleanName = signUpName.trim();
    const cleanPassword = signUpPassword.trim();

    if (!cleanName) {
      setSignUpError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setSignUpError('Please enter a valid student email address (e.g. name@college.edu).');
      return;
    }

    if (cleanPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== signUpConfirmPassword.trim()) {
      setSignUpError('Passwords do not match. Please re-type your password.');
      return;
    }

    // Check if account already exists
    const duplicate = availableUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      setSignUpError(`An account with email "${cleanEmail}" is already registered. Please switch to the Sign In tab.`);
      return;
    }

    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

    const today = getTodayDateString();
    const cleanOrg = signUpOrganization.trim() || 'NA';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      avatarInitials: initials,
      academicLevel: signUpRole === 'faculty' ? 'Faculty & Mentor' : signUpLevel,
      majorOrFocus: signUpMajor,
      targetGoal: signUpGoal.trim() || (signUpRole === 'faculty' ? 'Cohort Diagnostic Mentorship & Remedial Coaching' : 'Academic Excellence & Concept Mastery'),
      organization: cleanOrg,
      role: signUpRole,
      joinedDate: 'September 2026',
      streakDetails: {
        lastVisitDate: today,
        lastPracticeDate: undefined,
        visitedDates: [today],
        practicedDates: [],
        currentStreak: 1, // Realistic starting streak: 1 day for registration visit
        longestStreak: 1,
      },
      stats: {
        studyStreakDays: 1,
        weeklyHoursStudied: 0.5,
        doubtsResolvedCount: 0,
        quizzesCompletedCount: 0,
        averageQuizScore: 0,
        conceptMastery: [
          { subject: signUpMajor, score: 70, color: '#6366f1' },
          { subject: 'Mathematics & Statistics', score: 68, color: '#8b5cf6' },
        ],
        recentActivities: [
          {
            id: `act-${Date.now()}`,
            type: 'guide',
            title: 'Account Registered & Activated',
            date: 'Today',
            highlight: `Profile initialized for ${signUpMajor} (${signUpLevel})`,
          }
        ]
      },
      weakTopics: [
        {
          id: `wt-${Date.now()}`,
          topicName: `${signUpMajor}: Foundational Invariants & Problem Modeling`,
          subject: signUpMajor,
          severity: 'Critical Gap',
          masteryScore: 50,
          rootCause: 'Diagnostic baseline shows room for deeper first-principles understanding.',
          actionableSuggestions: [
            'Use the StudyMate Personalized Guide to diagnose your specific syllabus trouble spots.',
            'Complete an interactive diagnostic quiz to establish your mastery baseline.'
          ],
          keyPitfallToAvoid: 'Rushing to memorization without intuitive causal models.',
          recommendedStudyTime: '30 mins / day',
          status: 'Under Review'
        }
      ]
    };

    // 1. Register the user into persistent storage
    onRegisterUser(newUser);

    // 2. Clear registration form
    setSignUpName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');

    // 3. User request: "if new user wants to login first register them then login with their id password after that"
    // Switch to Sign In, fill their email, and prompt them to enter password to login!
    setAuthMode('signin');
    setSignInEmail(cleanEmail);
    setSignInPassword('');
    setSignInError(null);
    setSignInSuccessMessage(
      `🎉 Account registered successfully for ${cleanName}! Please enter your password below to sign in to your dashboard.`
    );

    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  // Helper when user clicks an account in the registered profiles list
  // Does NOT bypass authentication; populates email, clears password, and requires entering password
  const handleSelectAccount = (user: UserProfile) => {
    setAuthMode('signin');
    setSignInEmail(user.email);
    setSignInPassword('');
    setSignInError(null);
    setSignInSuccessMessage(
      `Selected account: ${user.name} (${user.email}). Please enter this account's password to access the dashboard.`
    );
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-stone-900">
      {/* Top Header Brand */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-100 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-stone-900 tracking-tight text-xl">
              Study<span className="text-amber-800 italic font-normal">Mate</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-stone-500 font-medium">
              · Personalized Academic Mentorship
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-stone-700" />
          <span className="hidden sm:inline">Secure Student Authentication</span>
        </div>
      </div>

      {/* Main Centered Authentication & Profile Card */}
      <div className="max-w-5xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Value Proposition & Weakness Mission */}
        <div className="lg:col-span-6 space-y-6">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Academic Mentorship & Guidance
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              A quiet, personal space for your <span className="italic font-normal text-amber-900">deepest academic growth</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-serif leading-relaxed max-w-xl">
              Every student encounters difficult concepts. StudyMate diagnoses where you feel friction, tracks your study rhythm, and pairs you with first-principles mentorship.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                <Target className="w-4 h-4 text-amber-700" />
                <span>Gentle Diagnostics</span>
              </div>
              <p className="text-xs text-stone-500 font-serif">
                Uncovers root misconceptions without punitive grades.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                <BookOpen className="w-4 h-4 text-stone-700" />
                <span>Socratic Guidance</span>
              </div>
              <p className="text-xs text-stone-500 font-serif">
                Guided inquiries that build lasting first-principles intuition.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Study Rhythm</span>
              </div>
              <p className="text-xs text-stone-500 font-serif">
                Daily practice logs celebrating consistent effort.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                <Award className="w-4 h-4 text-stone-700" />
                <span>Targeted Micro-Checks</span>
              </div>
              <p className="text-xs text-stone-500 font-serif">
                3-question practice sets targeted to vulnerable points.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card & Student Accounts Selector */}
        <div className="lg:col-span-6 bg-white text-stone-900 rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/90 space-y-5">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex p-1 rounded-xl bg-stone-100 border border-stone-200">
            <button
              onClick={() => { 
                setAuthMode('signin'); 
                setSignInError(null); 
                setSignUpError(null); 
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-stone-900 text-stone-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { 
                setAuthMode('signup'); 
                setSignInError(null); 
                setSignUpError(null); 
                setSignInSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-stone-900 text-stone-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Registration Success / Account Selection Banner */}
              {signInSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{signInSuccessMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {signInError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{signInError}</p>
                    {signInError.includes('register') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setSignUpEmail(signInEmail);
                          setSignInError(null);
                        }}
                        className="text-indigo-600 hover:underline font-bold inline-block cursor-pointer"
                      >
                        Click here to create a new student account →
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Student Email / ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">Account Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      const match = availableUsers.find(u => u.email.toLowerCase() === signInEmail.trim().toLowerCase());
                      if (match) {
                        setPasswordModalUser(match);
                        setModalPasswordVisible(true);
                      } else if (availableUsers.length > 0) {
                        setPasswordModalUser(availableUsers[0]);
                        setModalPasswordVisible(true);
                      }
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    ref={passwordInputRef}
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify Password & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              {signUpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold">{signUpError}</span>
                </div>
              )}

              {/* Role Toggle: Student vs Faculty */}
              <div className="p-1 rounded-xl bg-slate-100 flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSignUpRole('student')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    signUpRole === 'student'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Learner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole('faculty')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    signUpRole === 'faculty'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Faculty / Organizer</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {signUpRole === 'faculty' ? 'Faculty Full Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder={signUpRole === 'faculty' ? 'e.g. Prof. David Miller' : 'e.g. Jordan Miller'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Email Address (Login ID)</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder={signUpRole === 'faculty' ? 'professor@institution.edu' : 'jordan@college.edu'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Institution / Organization Input (As Requested) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>College / Coaching Institution</span>
                  </label>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded">
                    Type 'NA' if Independent
                  </span>
                </div>
                <input
                  type="text"
                  value={signUpOrganization}
                  onChange={(e) => setSignUpOrganization(e.target.value)}
                  placeholder="Enter college, coaching name, or type 'NA' for individual use"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                
                {/* Quick Helper Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick select:</span>
                  {['Apex Coaching Institute', 'Stanford Pre-Med Academy', 'MIT Engineering', 'NA (Individual)'].map((org) => (
                    <button
                      key={org}
                      type="button"
                      onClick={() => setSignUpOrganization(org === 'NA (Individual)' ? 'NA' : org)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 font-medium transition-colors cursor-pointer"
                    >
                      {org}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Students associated with a coaching institute or college can be tracked by their faculty. Independent learners can type <strong>NA</strong> to use StudyMate individually.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Create Password</label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {signUpRole === 'faculty' ? 'Department / Subject Focus' : 'Primary Major / Subject'}
                  </label>
                  <select
                    value={signUpMajor}
                    onChange={(e) => setSignUpMajor(e.target.value as Subject)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                  >
                    {ALL_SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {signUpRole === 'faculty' ? 'Faculty Role / Title' : 'Academic Level'}
                  </label>
                  {signUpRole === 'faculty' ? (
                    <select
                      value={signUpLevel}
                      onChange={(e) => setSignUpLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    >
                      <option value="Head Professor & Academic Lead">Head Professor & Academic Lead</option>
                      <option value="Associate Professor & Coach">Associate Professor & Coach</option>
                      <option value="Coaching Faculty / Mentor">Coaching Faculty / Mentor</option>
                      <option value="Teaching Assistant / Fellow">Teaching Assistant / Fellow</option>
                    </select>
                  ) : (
                    <select
                      value={signUpLevel}
                      onChange={(e) => setSignUpLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer"
                    >
                      <option value="High School AP / Honors">High School AP / Honors</option>
                      <option value="Undergraduate">Undergraduate (College)</option>
                      <option value="Graduate / Master / PhD">Graduate / Master / PhD</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {signUpRole === 'faculty' ? 'Cohort Mentorship Goal' : 'Target Study Goal'}
                </label>
                <input
                  type="text"
                  value={signUpGoal}
                  onChange={(e) => setSignUpGoal(e.target.value)}
                  placeholder={signUpRole === 'faculty' ? 'e.g. Monitor batch exam performance & remedial guidance' : 'e.g. Master algorithms & prepare for finals'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>{signUpRole === 'faculty' ? 'Register Faculty & Organizer Account' : 'Register Student Account'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                After registration, you will log in with your email and chosen password.
              </p>
            </form>
          )}

          {/* Action Feedback Banner (e.g. Account removed) */}
          {actionFeedback && (
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="font-medium">{actionFeedback}</span>
              <button 
                onClick={() => setActionFeedback(null)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Select Student & Faculty Profiles */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Select Account:</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  <span>Passwords Hidden</span>
                </span>
                {onRestoreDefaultUsers && availableUsers.length < 3 && (
                  <button
                    type="button"
                    onClick={onRestoreDefaultUsers}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                    title="Restore default student accounts"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Role Filter Pills */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickSelectRoleFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickSelectRoleFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({availableUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickSelectRoleFilter('student')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickSelectRoleFilter === 'student'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Students ({availableUsers.filter(u => u.role !== 'faculty').length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuickSelectRoleFilter('faculty')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    quickSelectRoleFilter === 'faculty'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Faculty ({availableUsers.filter(u => u.role === 'faculty').length})
                </button>
              </div>

              <span className="text-[10px] text-slate-400 hidden sm:inline">Click ⋮ to view credentials</span>
            </div>

            {/* Click outside backdrop for dropdown menu */}
            {activeMenuUserId && (
              <div 
                className="fixed inset-0 z-20"
                onClick={() => setActiveMenuUserId(null)}
              />
            )}

            {availableUsers.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 text-center space-y-2.5 bg-slate-50">
                <p className="text-xs text-slate-500 font-medium">
                  No saved accounts currently in Quick Select.
                </p>
                {onRestoreDefaultUsers && (
                  <button
                    type="button"
                    onClick={onRestoreDefaultUsers}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Demo Student Accounts</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableUsers
                  .filter((u) => {
                    if (quickSelectRoleFilter === 'student') return u.role !== 'faculty';
                    if (quickSelectRoleFilter === 'faculty') return u.role === 'faculty';
                    return true;
                  })
                  .map((user) => {
                  const isSelected = signInEmail.toLowerCase() === user.email.toLowerCase() && authMode === 'signin';
                  const isMenuOpen = activeMenuUserId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`relative p-2.5 rounded-xl border text-left transition-all group flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/30'
                          : 'border-slate-200/90 hover:border-indigo-300 bg-slate-50/90 hover:bg-slate-100/80'
                      }`}
                    >
                      {/* Left: Avatar & Click-to-Select Body */}
                      <div 
                        onClick={() => handleSelectAccount(user)}
                        className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                        title={`Click to select ${user.name}`}
                      >
                        <div className={`w-8 h-8 rounded-lg text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                          user.role === 'faculty' ? 'bg-violet-600' : 'bg-indigo-600'
                        }`}>
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {user.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {user.email}
                          </p>

                          {/* Organization & Role Badge */}
                          <div className="flex items-center gap-1 my-0.5">
                            {user.role === 'faculty' ? (
                              <span className="text-[9px] font-bold text-violet-700 bg-violet-100/70 border border-violet-200 px-1.5 py-0.2 rounded truncate max-w-[125px]">
                                🏛️ Faculty • {user.organization || 'Apex'}
                              </span>
                            ) : user.organization && user.organization !== 'NA' ? (
                              <span className="text-[9px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded truncate max-w-[125px]">
                                🏛️ {user.organization}
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                👤 Individual (NA)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-0.5 text-[9px]">
                            <span className="text-slate-600 font-semibold truncate max-w-[90px]">
                              {user.majorOrFocus.split('&')[0]}
                            </span>
                            {/* Password is intentionally hidden with masked lock badge */}
                            <span 
                              className="text-slate-400 font-medium bg-slate-200/70 px-1.5 py-0.5 rounded flex items-center gap-1 select-none"
                              title="Password hidden for security. Click ⋮ to reveal."
                            >
                              <Lock className="w-2.5 h-2.5 text-slate-400" />
                              <span>••••••••</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top Right: Streak pill & 3-Dots Menu button */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                          <Flame className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>{user.stats.studyStreakDays}d</span>
                        </span>

                        {/* Account Menu Button (⋮) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuUserId(isMenuOpen ? null : user.id);
                            }}
                            className={`p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer ${
                              isMenuOpen ? 'bg-slate-200 text-slate-800' : ''
                            }`}
                            title="Account options menu"
                            aria-label={`Options menu for ${user.name}`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown Menu */}
                          {isMenuOpen && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                            >
                              <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                {user.name.split(' ')[0]}'s Account
                              </div>
                              
                              <div className="py-1">
                                {/* Option 1: View / Forgot Password */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    setPasswordModalUser(user);
                                    setModalPasswordVisible(true);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-start gap-2 cursor-pointer transition-colors"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-xs text-slate-800 hover:text-indigo-700">View / Forgot Password</div>
                                    <div className="text-[10px] text-slate-400">Reveal credentials or auto-fill</div>
                                  </div>
                                </button>

                                {/* Option 2: Sign In with this Account */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    handleSelectAccount(user);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <LogIn className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="text-xs">Sign In with Account</span>
                                </button>
                              </div>

                              {/* Option 3: Remove Account */}
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    setUserToRemove(user);
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors group/del"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover/del:text-rose-700 shrink-0" />
                                  <span className="text-xs font-semibold">Remove Account</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Password Recovery & Reveal Modal */}
      {passwordModalUser && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setPasswordModalUser(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Account Password & Credentials</h3>
                  <p className="text-xs text-slate-500">View or recover your login password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-800">{passwordModalUser.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Account Role:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  passwordModalUser.role === 'faculty' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {passwordModalUser.role === 'faculty' ? '🏛️ Faculty / Organizer' : '🎓 Student Learner'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Institution:</span>
                <span className="font-semibold text-slate-800">
                  {passwordModalUser.organization === 'NA' ? '👤 Independent / Individual' : passwordModalUser.organization || 'Independent'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono text-slate-800 font-semibold">{passwordModalUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Major / Focus:</span>
                <span className="font-medium text-indigo-700">{passwordModalUser.majorOrFocus}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Active Streak:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {passwordModalUser.stats.studyStreakDays} consecutive days
                </span>
              </div>
            </div>

            {/* Password Display Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Account Password</label>
                <button
                  type="button"
                  onClick={() => setModalPasswordVisible(!modalPasswordVisible)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {modalPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{modalPasswordVisible ? 'Hide Password' : 'Show Password'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={modalPasswordVisible ? 'text' : 'password'}
                    readOnly
                    value={passwordModalUser.password || 'password123'}
                    className="w-full bg-slate-100 border border-slate-300 font-mono text-slate-900 text-sm font-bold tracking-wider rounded-xl px-3.5 py-2.5 focus:outline-none select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPassword(passwordModalUser.password || 'password123')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Copy password to clipboard"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                If you forget your password, you can always reopen this dialog via the menu (<span className="font-bold">⋮</span>) on your account card.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFillPasswordAndProceed(passwordModalUser)}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>Auto-Fill Password & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Remove Account Confirmation Dialog */}
      {userToRemove && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setUserToRemove(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Remove Account</h3>
                  <p className="text-xs text-slate-500">Confirm removing saved account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToRemove(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80 space-y-2 text-xs">
              <p className="text-slate-800 leading-relaxed">
                Are you sure you want to remove the student account for <strong className="text-slate-900 font-bold">{userToRemove.name}</strong> (<span className="font-mono text-slate-700 font-semibold">{userToRemove.email}</span>)?
              </p>
              <p className="text-rose-700 font-medium leading-relaxed">
                This account will be removed from your Quick Select list on this browser. You can re-register or restore default accounts anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmRemoveUser}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove Account</span>
              </button>
              <button
                type="button"
                onClick={() => setUserToRemove(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span>StudyMate Academic Hub • Multi-Student Personalized Engine</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Realistic calendar streak tracking & individual password-protected student accounts.
        </div>
      </div>
    </div>
  );
};
