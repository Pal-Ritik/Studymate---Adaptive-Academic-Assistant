import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Search, 
  FileText, 
  MessageSquare, 
  Printer, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  X, 
  Send, 
  UserPlus, 
  Layers, 
  Clock, 
  Compass,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Calendar,
  Check
} from 'lucide-react';
import { UserProfile, Subject, WeakTopicItem, FacultyOfflinePlan } from '../types';
import { ALL_SUBJECTS } from '../data/mockAcademicData';

interface FacultyOrganizerViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNavigateTab: (tab: any) => void;
}

export const FacultyOrganizerView: React.FC<FacultyOrganizerViewProps> = ({
  currentUser,
  allUsers,
  onUpdateUser,
  onNavigateTab,
}) => {
  // Extract all distinct organizations in the system
  const organizationsList = useMemo(() => {
    const orgs = new Set<string>();
    allUsers.forEach((u) => {
      if (u.organization && u.organization.trim()) {
        orgs.add(u.organization.trim());
      }
    });
    // Default well-known institutions
    orgs.add('Apex Coaching Institute');
    orgs.add('Stanford Pre-Med Academy');
    orgs.add('NA'); // Individual learners
    return Array.from(orgs);
  }, [allUsers]);

  // Selected organization filter (defaults to current user's organization or 'Apex Coaching Institute')
  const [selectedOrg, setSelectedOrg] = useState<string>(() => {
    if (currentUser.organization && currentUser.organization !== 'NA') {
      return currentUser.organization;
    }
    return 'Apex Coaching Institute';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'moderate' | 'ontrack'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Modal states
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<UserProfile | null>(null);
  const [offlineNoteText, setOfflineNoteText] = useState('');
  const [savedNoteFeedback, setSavedNoteFeedback] = useState(false);

  // Remedial Plan Generator Modal State
  const [activeRemedialPlan, setActiveRemedialPlan] = useState<FacultyOfflinePlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planTopicInput, setPlanTopicInput] = useState('Dynamic Programming: State Space & Memoization');
  const [planSubjectInput, setPlanSubjectInput] = useState<Subject>('Computer Science & AI');
  const [planDurationMinutes, setPlanDurationMinutes] = useState<number>(45);

  // New Student Enrollment Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollMajor, setEnrollMajor] = useState<Subject>('Computer Science & AI');
  const [enrollOrg, setEnrollOrg] = useState(selectedOrg);

  // Batch Report copy feedback
  const [batchReportCopied, setBatchReportCopied] = useState(false);

  // Filter students based on organization
  const enrolledStudents = useMemo(() => {
    return allUsers.filter((u) => {
      // Don't show faculty members in the student roster
      if (u.role === 'faculty') return false;

      if (selectedOrg === 'ALL') return true;
      if (selectedOrg === 'NA') {
        return !u.organization || u.organization.trim().toUpperCase() === 'NA';
      }
      return (u.organization || '').trim().toLowerCase() === selectedOrg.trim().toLowerCase();
    });
  }, [allUsers, selectedOrg]);

  // Further filter by search, risk, and subject
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.majorOrFocus.toLowerCase().includes(searchQuery.toLowerCase());

      const hasCriticalGap = student.weakTopics.some((w) => w.severity === 'Critical Gap');
      const isLowMastery = student.stats.averageQuizScore > 0 && student.stats.averageQuizScore < 70;
      const isCritical = hasCriticalGap || isLowMastery;
      const isModerate = !isCritical && student.weakTopics.length > 0;
      const isOnTrack = student.weakTopics.length === 0 || student.stats.averageQuizScore >= 85;

      let matchesRisk = true;
      if (riskFilter === 'critical') matchesRisk = isCritical;
      if (riskFilter === 'moderate') matchesRisk = isModerate;
      if (riskFilter === 'ontrack') matchesRisk = isOnTrack;

      let matchesSubject = true;
      if (selectedSubjectFilter !== 'all') {
        matchesSubject = student.majorOrFocus === selectedSubjectFilter;
      }

      return matchesSearch && matchesRisk && matchesSubject;
    });
  }, [enrolledStudents, searchQuery, riskFilter, selectedSubjectFilter]);

  // Aggregated Batch Weaknesses & Problem Topics
  const batchProblemTopics = useMemo(() => {
    const topicMap: Record<
      string,
      {
        topicName: string;
        subject: Subject;
        count: number;
        students: string[];
        minMastery: number;
        rootCauses: string[];
        keyPitfall: string;
      }
    > = {};

    enrolledStudents.forEach((student) => {
      student.weakTopics.forEach((wt) => {
        if (!topicMap[wt.topicName]) {
          topicMap[wt.topicName] = {
            topicName: wt.topicName,
            subject: wt.subject,
            count: 0,
            students: [],
            minMastery: 100,
            rootCauses: [],
            keyPitfall: wt.keyPitfallToAvoid,
          };
        }
        topicMap[wt.topicName].count += 1;
        topicMap[wt.topicName].students.push(student.name);
        topicMap[wt.topicName].minMastery = Math.min(topicMap[wt.topicName].minMastery, wt.masteryScore);
        if (!topicMap[wt.topicName].rootCauses.includes(wt.rootCause)) {
          topicMap[wt.topicName].rootCauses.push(wt.rootCause);
        }
      });
    });

    return Object.values(topicMap).sort((a, b) => b.count - a.count);
  }, [enrolledStudents]);

  // Overall Statistics for this Cohort
  const cohortStats = useMemo(() => {
    const total = enrolledStudents.length;
    const criticalCount = enrolledStudents.filter(
      (s) => s.weakTopics.some((w) => w.severity === 'Critical Gap') || (s.stats.averageQuizScore > 0 && s.stats.averageQuizScore < 70)
    ).length;
    const totalDoubts = enrolledStudents.reduce((acc, s) => acc + s.stats.doubtsResolvedCount, 0);
    const avgScore =
      total > 0
        ? Math.round(enrolledStudents.reduce((acc, s) => acc + (s.stats.averageQuizScore || 75), 0) / total)
        : 0;

    return {
      total,
      criticalCount,
      totalDoubts,
      avgScore,
      topProblemTopic: batchProblemTopics.length > 0 ? batchProblemTopics[0].topicName : 'None identified',
    };
  }, [enrolledStudents, batchProblemTopics]);

  // Handle saving an offline note to a student's profile
  const handleSaveOfflineNote = () => {
    if (!selectedStudentForModal) return;
    const updated: UserProfile = {
      ...selectedStudentForModal,
      facultyNotes: offlineNoteText.trim(),
    };
    onUpdateUser(updated);
    setSelectedStudentForModal(updated);
    setSavedNoteFeedback(true);
    setTimeout(() => setSavedNoteFeedback(false), 2500);
  };

  // Generate AI Offline Remedial Plan
  const handleGenerateRemedialPlan = async (topic: string, subject: Subject) => {
    setIsGeneratingPlan(true);
    setPlanTopicInput(topic);
    setPlanSubjectInput(subject);

    try {
      const res = await fetch('/api/faculty/remedial-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          organization: selectedOrg === 'ALL' ? 'Coaching & Academic Institute' : selectedOrg,
          targetStudentsCount: enrolledStudents.length || 5,
          durationMinutes: planDurationMinutes,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate offline plan');
      const data: FacultyOfflinePlan = await res.json();
      setActiveRemedialPlan(data);
    } catch (err) {
      console.error('Error generating offline plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handle enrolling new student
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollEmail.trim()) return;

    const initials = enrollName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';

    const newStudent: UserProfile = {
      id: `user-enroll-${Date.now()}`,
      name: enrollName.trim(),
      email: enrollEmail.trim().toLowerCase(),
      password: 'password123',
      avatarInitials: initials,
      academicLevel: 'Undergraduate',
      majorOrFocus: enrollMajor,
      targetGoal: `Batch Excellence at ${enrollOrg}`,
      organization: enrollOrg.trim() || 'NA',
      role: 'student',
      joinedDate: 'September 2026',
      stats: {
        studyStreakDays: 1,
        weeklyHoursStudied: 0,
        doubtsResolvedCount: 0,
        quizzesCompletedCount: 0,
        averageQuizScore: 0,
        conceptMastery: [
          { subject: enrollMajor, score: 65, color: '#6366f1' },
          { subject: 'Mathematics & Statistics', score: 70, color: '#8b5cf6' },
        ],
        recentActivities: [
          {
            id: `act-${Date.now()}`,
            type: 'guide',
            title: `Enrolled in ${enrollOrg}`,
            date: 'Today',
            highlight: `Added to cohort by faculty`,
          },
        ],
      },
      weakTopics: [
        {
          id: `wt-${Date.now()}`,
          topicName: `${enrollMajor}: Core Boundary Axioms`,
          subject: enrollMajor,
          severity: 'Critical Gap',
          masteryScore: 52,
          rootCause: 'Newly enrolled student baseline requires diagnostic verification.',
          actionableSuggestions: ['Complete initial diagnostic quiz on StudyMate.'],
          keyPitfallToAvoid: 'Proceeding to advanced topics before foundational diagnostic check.',
          recommendedStudyTime: '30 mins',
          status: 'Under Review',
        },
      ],
    };

    onUpdateUser(newStudent);
    setIsEnrollModalOpen(false);
    setEnrollName('');
    setEnrollEmail('');
  };

  // Copy Batch Diagnostic Summary
  const handleCopyBatchReport = () => {
    const reportText = `### Cohort Diagnostic Report: ${selectedOrg}
Generated on: ${new Date().toLocaleDateString()}
Total Enrolled Students: ${cohortStats.total}
Students Requiring Offline Intervention: ${cohortStats.criticalCount}
Batch Average Quiz Score: ${cohortStats.avgScore}%
Total Doubts Raised: ${cohortStats.totalDoubts}

#### Top Problem Areas in Cohort:
${batchProblemTopics
  .slice(0, 5)
  .map(
    (b, i) =>
      `${i + 1}. **${b.topicName}** (${b.subject})\n   - Students affected: ${b.count} (${b.students.join(', ')})\n   - Lowest Mastery: ${b.minMastery}%\n   - Core Root Cause: ${b.rootCauses[0] || 'Conceptual modeling confusion'}\n   - Exam Trap: ${b.keyPitfall}`
  )
  .join('\n\n')}

#### Student Diagnostics & Offline Action Notes:
${enrolledStudents
  .map(
    (s) =>
      `- **${s.name}** (${s.email}) | Avg Quiz: ${s.stats.averageQuizScore}% | Streak: ${s.stats.studyStreakDays}d\n  Weaknesses: ${s.weakTopics.map((w) => `${w.topicName} (${w.severity})`).join(', ') || 'None'}\n  Faculty Offline Note: ${s.facultyNotes || 'None assigned yet'}`
  )
  .join('\n\n')}
`;
    navigator.clipboard.writeText(reportText);
    setBatchReportCopied(true);
    setTimeout(() => setBatchReportCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Organization Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Faculty & Organizer Portal
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 rounded-full border border-violet-200">
                  Institution Command Hub
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor student cohorts, pinpoint specific conceptual problem areas, and generate offline remedial intervention plans.
              </p>
            </div>
          </div>

          {/* Organization Switcher & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-semibold">Institute:</span>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {organizationsList.map((org) => (
                  <option key={org} value={org}>
                    {org === 'NA' ? '👤 Individual Learners (NA)' : `🏛️ ${org}`}
                  </option>
                ))}
                <option value="ALL">🌐 All Enrolled Cohorts</option>
              </select>
            </div>

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>

            <button
              onClick={handleCopyBatchReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Copy comprehensive markdown report for offline faculty meetings"
            >
              {batchReportCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Report Copied!</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Active Faculty Pill */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Active Organizer / Faculty: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Department: <strong>{currentUser.majorOrFocus}</strong>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Viewing {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''} in{' '}
            <strong className="text-indigo-600">{selectedOrg === 'NA' ? 'Individual Learner Roster' : selectedOrg}</strong>
          </span>
        </div>
      </div>

      {/* KPI Statistic Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{cohortStats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active in this cohort</p>
        </div>

        {/* Students Needing Offline Help */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600">Needs Offline Help</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{cohortStats.criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Students with critical gaps</p>
        </div>

        {/* Batch Average Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Batch Quiz Avg</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{cohortStats.avgScore}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {cohortStats.avgScore >= 80 ? 'Healthy concept retention' : 'Remedial review advised'}
          </p>
        </div>

        {/* Doubts Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Doubts Asked</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{cohortStats.totalDoubts}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cognitive queries raised</p>
        </div>

        {/* Top Problem Topic */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top Problem Area</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-900 truncate" title={cohortStats.topProblemTopic}>
            {cohortStats.topProblemTopic}
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Primary lecture friction</p>
        </div>
      </div>

      {/* Cohort Problem Topic & Curriculum Remedial Heatmap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Where Students Face Problems (Curriculum Diagnostic Heatmap)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified friction areas across quiz submissions and doubt inquiries. Use these insights for offline whiteboard lectures.
            </p>
          </div>
        </div>

        {batchProblemTopics.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/80">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No Critical Friction Points Detected</p>
            <p className="text-xs text-slate-500 mt-1">
              All students in this cohort are maintaining healthy mastery across their diagnostic topics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {batchProblemTopics.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {item.subject.split('&')[0]}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {item.count} Student{item.count > 1 ? 's' : ''} Struggling
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.topicName}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Root Cognitive Gap: </strong>
                    {item.rootCauses[0]}
                  </p>

                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900">
                    <strong className="font-semibold block mb-0.5">Common Exam Trap:</strong>
                    <span>{item.keyPitfall}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Students: <strong>{item.students.slice(0, 2).join(', ')}{item.students.length > 2 ? ` +${item.students.length - 2}` : ''}</strong>
                  </div>
                  <button
                    onClick={() => handleGenerateRemedialPlan(item.topicName, item.subject)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Create Offline Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Roster & Deep Diagnostics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Enrolled Student Diagnostic Roster</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect individual student streaks, quiz metrics, diagnosed weak topics, and assign custom offline guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="critical">🔴 Needs Offline Help</option>
              <option value="moderate">🟡 Moderate Gaps</option>
              <option value="ontrack">🟢 On Track / High Mastery</option>
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Majors</option>
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Cards Grid */}
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No students match your filter criteria in this organization.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const hasCritical = student.weakTopics.some((w) => w.severity === 'Critical Gap');
              const isLowMastery = student.stats.averageQuizScore > 0 && student.stats.averageQuizScore < 70;
              const needsHelp = hasCritical || isLowMastery;

              return (
                <div
                  key={student.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Avatar & Basic Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {student.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{student.name}</span>
                        {needsHelp ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Needs Offline Help
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            On Track
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {student.organization === 'NA' ? 'Individual' : student.organization || 'Individual'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600">
                        <span>Major: <strong>{student.majorOrFocus}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {student.stats.studyStreakDays}d streak
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Quiz Avg: <strong>{student.stats.averageQuizScore}%</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Doubts: <strong>{student.stats.doubtsResolvedCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Diagnosed Problem Topics */}
                  <div className="flex-1 max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Identified Problem Topics ({student.weakTopics.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {student.weakTopics.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No critical weakness points diagnosed</span>
                      ) : (
                        student.weakTopics.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border truncate max-w-[220px] ${
                              w.severity === 'Critical Gap'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                            title={`${w.topicName} (Mastery: ${w.masteryScore}%) - ${w.rootCause}`}
                          >
                            {w.topicName.split(':')[0]} ({w.masteryScore}%)
                          </span>
                        ))
                      )}
                    </div>
                    {student.facultyNotes && (
                      <p className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded border border-indigo-100 truncate">
                        <strong>Offline Task: </strong> {student.facultyNotes}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedStudentForModal(student);
                        setOfflineNoteText(student.facultyNotes || '');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Deep Diagnostic</span>
                    </button>

                    <button
                      onClick={() => {
                        const firstWeak = student.weakTopics[0]?.topicName || `${student.majorOrFocus} Core Invariants`;
                        handleGenerateRemedialPlan(firstWeak, student.majorOrFocus);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Plan Offline Effort</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STUDENT DEEP-DIVE MODAL */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center">
                  {selectedStudentForModal.avatarInitials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudentForModal.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentForModal.email} • {selectedStudentForModal.majorOrFocus} • {selectedStudentForModal.organization}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Study Streak</span>
                <span className="text-base font-black text-amber-600">{selectedStudentForModal.stats.studyStreakDays} Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Quiz Average</span>
                <span className="text-base font-black text-slate-900">{selectedStudentForModal.stats.averageQuizScore}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Doubts Solved</span>
                <span className="text-base font-black text-indigo-600">{selectedStudentForModal.stats.doubtsResolvedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Weekly Study</span>
                <span className="text-base font-black text-slate-900">{selectedStudentForModal.stats.weeklyHoursStudied}h</span>
              </div>
            </div>

            {/* Weakness Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Diagnosed Conceptual Gaps ({selectedStudentForModal.weakTopics.length})</span>
              </h4>

              {selectedStudentForModal.weakTopics.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No critical weak topics diagnosed for this student.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedStudentForModal.weakTopics.map((w, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900">{w.topicName}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          Mastery: {w.masteryScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-800">Root Cause: </strong> {w.rootCause}
                      </p>
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80">
                        <strong>Exam Pitfall to Avoid: </strong> {w.keyPitfallToAvoid}
                      </div>
                      <p className="text-[10px] text-indigo-600 font-semibold">
                        Recommended Recovery Study: {w.recommendedStudyTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offline Faculty Mentorship Note Section */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Assign Offline Action / Mentorship Task</span>
                </h4>
                {savedNoteFeedback && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Student Profile!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Write a note or instructions for this student to complete offline (e.g. "Come to Tuesday 4PM office hours to re-derive LIATE integration on the whiteboard").
              </p>
              <textarea
                rows={2}
                value={offlineNoteText}
                onChange={(e) => setOfflineNoteText(e.target.value)}
                placeholder="Type instructions or offline effort note for this student..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveOfflineNote}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Save Note for Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE REMEDIAL PLAN MODAL */}
      {activeRemedialPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Offline Remedial Workshop Blueprint
                  </h3>
                  <p className="text-xs text-slate-500">
                    Topic: <strong className="text-slate-800">{activeRemedialPlan.topic}</strong> ({activeRemedialPlan.estimatedDurationMinutes} mins)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRemedialPlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Learning Objectives */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <strong className="text-xs font-bold text-slate-800 block">Classroom Learning Objectives:</strong>
              <ul className="space-y-1 text-xs text-slate-600">
                {activeRemedialPlan.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timed Session Roadmap */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Timed Classroom Lecture & Board Roadmap</span>
              </h4>

              <div className="space-y-2.5">
                {activeRemedialPlan.sessionRoadmap.map((stage, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {stage.timeSlot}
                      </span>
                      <span className="text-slate-400 font-medium">{stage.pedagogyMethod}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900">{stage.stageTitle}</h5>
                    <p className="text-xs text-slate-700 leading-relaxed">{stage.instructionsForFaculty}</p>

                    {/* Whiteboard Notes */}
                    <div className="p-2.5 rounded-lg bg-slate-900 text-indigo-200 text-[11px] font-mono space-y-1">
                      <span className="text-slate-400 block font-sans font-bold text-[10px] uppercase">
                        Whiteboard Drawing / Board Notes:
                      </span>
                      {stage.whiteboardNotes.map((note, nIdx) => (
                        <div key={nIdx} className="flex gap-2">
                          <span className="text-emerald-400">➔</span>
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Handout Challenge */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <strong className="text-xs font-bold text-emerald-900 block">
                Offline Paper Worksheet Challenge for Students:
              </strong>
              <p className="text-xs text-slate-800 font-medium">
                {activeRemedialPlan.offlineHandoutChallenge.problemStatement}
              </p>
              <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100">
                <strong>Solution Key (for Faculty / TA): </strong>
                {activeRemedialPlan.offlineHandoutChallenge.solutionKey}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Lesson Plan</span>
              </button>
              <button
                onClick={() => setActiveRemedialPlan(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLL NEW STUDENT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Enroll Student into Institution</span>
              </h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="e.g. Tanya Sen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                  placeholder="tanya.sen@college.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Institution / Organization</label>
                <input
                  type="text"
                  required
                  value={enrollOrg}
                  onChange={(e) => setEnrollOrg(e.target.value)}
                  placeholder="e.g. Apex Coaching Institute or 'NA'"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Type 'NA' if adding an independent learner
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Subject / Focus</label>
                <select
                  value={enrollMajor}
                  onChange={(e) => setEnrollMajor(e.target.value as Subject)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  {ALL_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
