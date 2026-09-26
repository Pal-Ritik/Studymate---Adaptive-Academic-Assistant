export type Subject = 
  | 'Computer Science & AI' 
  | 'Mathematics & Statistics' 
  | 'Physics & Engineering' 
  | 'Biology & Medicine' 
  | 'Chemistry' 
  | 'Economics & Business' 
  | 'Humanities & Literature';

export type TutorPedagogyMode = 'socratic' | 'feynman' | 'step_by_step' | 'exam_prep';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor' | 'system';
  content: string;
  timestamp: string;
  thoughtSnippet?: string;
  followUpSuggestions?: string[];
  principles?: string[];
  modelUsed?: string;
  latencyMs?: number;
}

export interface DoubtResolution {
  doubtText: string;
  subject: string;
  coreConcept: string;
  directAnswer?: string;
  whyItsConfusing: string;
  intuitiveAnalogy: string;
  stepByStepSolution: string[];
  realWorldExample?: string;
  commonPitfalls: string[];
  keyFormulaOrRule?: string;
  summaryBullets?: string[];
  checkYourUnderstanding: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomsTaxonomy?: 'Recall' | 'Understand' | 'Apply' | 'Analyze';
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  totalTimeMinutes: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  date: string;
}

export interface AssignmentRubricItem {
  criterion: string;
  weight: number;
  exemplary: string;
  proficient: string;
  developing: string;
}

export interface TieredTask {
  tier: 'Foundation' | 'Application' | 'Mastery & Innovation';
  description: string;
  deliverable: string;
  estimatedMinutes: number;
}

export interface GeneratedAssignment {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  durationEst: string;
  learningObjectives: string[];
  problemScenario: string;
  tieredTasks: TieredTask[];
  rubric: AssignmentRubricItem[];
  submissionGuidelines: string[];
  teacherKeyInsights: string;
}

export interface StudyTaskItem {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  technique: 'Active Recall' | 'Practice Problems' | 'Spaced Review' | 'Deep Reading' | 'Synthesizing Notes';
  completed: boolean;
}

export interface StudyDayPlan {
  dayNumber: number;
  dayName: string;
  focusTheme: string;
  dailyGoal: string;
  tasks: StudyTaskItem[];
}

export interface StudyPlan {
  id: string;
  goalName: string;
  targetDate: string;
  totalDays: number;
  dailyHoursAvailable: number;
  subjects: { name: string; targetScore: string; priority: 'High' | 'Medium' | 'Low' }[];
  schedule: StudyDayPlan[];
  overallStrategy: string;
}

export interface CareerMilestone {
  phase: string;
  timeframe: string;
  title: string;
  objectives: string[];
  portfolioProject: {
    title: string;
    description: string;
    techStackOrTools: string[];
  };
}

export interface CareerPathGuidance {
  targetRole: string;
  industryDemand: 'Very High' | 'High' | 'Moderate';
  averageStartingSalary: string;
  roleSummary: string;
  keySkills: {
    technical: { name: string; proficiencyTarget: string }[];
    soft: { name: string; importance: string }[];
  };
  learningRoadmap: CareerMilestone[];
  topCertifications: string[];
  recommendedRealWorldProjects: string[];
  industryOutlook2026: string;
}

export interface StudentStats {
  studyStreakDays: number;
  weeklyHoursStudied: number;
  doubtsResolvedCount: number;
  quizzesCompletedCount: number;
  averageQuizScore: number;
  conceptMastery: { subject: string; score: number; color: string }[];
  recentActivities: {
    id: string;
    type: 'tutor' | 'quiz' | 'doubt' | 'assignment' | 'planner' | 'guide';
    title: string;
    date: string;
    highlight: string;
  }[];
}

export interface StreakDetails {
  lastVisitDate: string;     // YYYY-MM-DD
  lastPracticeDate?: string; // YYYY-MM-DD
  visitedDates: string[];    // Array of YYYY-MM-DD dates visited
  practicedDates: string[];  // Array of YYYY-MM-DD dates practiced
  currentStreak: number;     // Real consecutive days
  longestStreak: number;     // Real max consecutive days
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarInitials: string;
  academicLevel: string;
  majorOrFocus: Subject;
  targetGoal: string;
  organization?: string; // e.g. "Apex Coaching Institute", "Stanford University", or "NA" (Individual)
  role?: 'student' | 'faculty' | 'organizer';
  facultyNotes?: string; // Custom offline notes/tasks written by faculty
  offlineInterventionPlan?: string;
  stats: StudentStats;
  weakTopics: WeakTopicItem[];
  joinedDate: string;
  streakDetails?: StreakDetails;
  personalReflection?: string;
  preferredLearningStyle?: string;
  personalStrengths?: string[];
}

export interface FacultyOfflinePlan {
  id: string;
  topic: string;
  subject: Subject;
  organization: string;
  targetStudentsCount: number;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
  sessionRoadmap: {
    timeSlot: string;
    stageTitle: string;
    pedagogyMethod: string;
    instructionsForFaculty: string;
    whiteboardNotes: string[];
  }[];
  keyMisconceptionsToAddress: string[];
  offlineHandoutChallenge: {
    problemStatement: string;
    guidingQuestions: string[];
    solutionKey: string;
  };
  generatedAt: string;
}

export interface WeakTopicItem {
  id: string;
  topicName: string;
  subject: Subject;
  severity: 'Critical Gap' | 'Moderate Difficulty' | 'Needs Polish';
  masteryScore: number;
  rootCause: string;
  actionableSuggestions: string[];
  keyPitfallToAvoid: string;
  quickCheckQuestion?: string;
  recommendedStudyTime: string;
  status: 'Under Review' | 'Practicing' | 'Mastered';
  studentPersonalNote?: string;
}

export interface PersonalizedDiagnosticGuide {
  id: string;
  subject: Subject;
  goalContext: string;
  overallDiagnosis: string;
  weakTopics: WeakTopicItem[];
  weeklyRecoveryRoadmap: {
    dayOrPhase: string;
    focus: string;
    actionItems: string[];
    recommendedTechnique: string;
  }[];
  generatedAt: string;
}
