import { StudentStats, Subject } from '../types';

export const ALL_SUBJECTS: Subject[] = [
  'Computer Science & AI',
  'Mathematics & Statistics',
  'Physics & Engineering',
  'Biology & Medicine',
  'Chemistry',
  'Economics & Business',
  'Humanities & Literature',
];

export const INITIAL_STUDENT_STATS: StudentStats = {
  studyStreakDays: 14,
  weeklyHoursStudied: 18.5,
  doubtsResolvedCount: 38,
  quizzesCompletedCount: 16,
  averageQuizScore: 89.4,
  conceptMastery: [
    { subject: 'Computer Science & AI', score: 94, color: '#6366f1' },
    { subject: 'Mathematics & Statistics', score: 86, color: '#0ea5e9' },
    { subject: 'Physics & Engineering', score: 79, color: '#f59e0b' },
    { subject: 'Biology & Medicine', score: 88, color: '#10b981' },
    { subject: 'Economics & Business', score: 92, color: '#ec4899' },
  ],
  recentActivities: [
    {
      id: 'act-1',
      type: 'quiz',
      title: 'Neural Networks & Loss Backprop Quiz',
      date: 'Today, 2:15 PM',
      highlight: 'Scored 100% (3/3) - Mastery Level: High',
    },
    {
      id: 'act-2',
      type: 'doubt',
      title: 'Doubt: Why Inductors Oppose Instantaneous Current',
      date: 'Yesterday, 8:40 PM',
      highlight: 'Resolved with Hydraulic Water Hammer Analogy',
    },
    {
      id: 'act-3',
      type: 'tutor',
      title: 'Socratic Session on Dynamic Programming memoization',
      date: 'Sep 20, 4:10 PM',
      highlight: 'Derived Top-Down vs Bottom-Up Space Complexity',
    },
    {
      id: 'act-4',
      type: 'planner',
      title: 'Completed Day 4 Study Milestone: 3.5 hrs logged',
      date: 'Sep 19, 7:30 PM',
      highlight: 'Active Recall on Calculus Integration by Parts',
    },
  ],
};

export const QUICK_TUTOR_PROMPTS = [
  {
    subject: 'Computer Science & AI' as Subject,
    prompt: 'How does self-attention in Transformers calculate queries, keys, and values intuitively?',
  },
  {
    subject: 'Mathematics & Statistics' as Subject,
    prompt: 'Why does multiplying two negative numbers result in a positive number?',
  },
  {
    subject: 'Physics & Engineering' as Subject,
    prompt: 'Why does time dilation occur near the speed of light in special relativity?',
  },
  {
    subject: 'Biology & Medicine' as Subject,
    prompt: 'How does CRISPR-Cas9 locate the exact 20-base-pair target sequence inside a genome of billions of bases?',
  },
];

export const QUICK_DOUBT_PRESETS = [
  {
    title: 'Why is dividing by zero mathematically undefined rather than infinity?',
    subject: 'Mathematics & Statistics',
  },
  {
    title: 'What is the difference between TCP and UDP and why does video streaming use UDP?',
    subject: 'Computer Science & AI',
  },
  {
    title: 'Why is the sky blue during the day but red at sunset?',
    subject: 'General Science & Math',
  },
  {
    title: 'How does quicksort pivot selection affect time complexity and avoid O(n²)?',
    subject: 'Computer Science & AI',
  },
  {
    title: 'Why do inductors resist instantaneous change in current while capacitors resist voltage changes?',
    subject: 'Physics & Engineering',
  },
  {
    title: 'Why doesn\'t the stomach digest its own epithelial lining with hydrochloric acid?',
    subject: 'Biology & Medicine',
  },
];

export const INITIAL_WEAK_TOPICS = [
  {
    id: 'weak-1',
    topicName: 'Dynamic Programming: State Space & Subproblem Memoization',
    subject: 'Computer Science & AI' as const,
    severity: 'Critical Gap' as const,
    masteryScore: 54,
    rootCause: 'Struggling to identify optimal substructure vs greedy choice, and confusing call-stack depth with auxiliary table memory.',
    actionableSuggestions: [
      'Draw the recursion DAG (Directed Acyclic Graph) for small inputs (n=3, 4) before writing any code.',
      'Practice transforming Top-Down memoized recursive solutions into Bottom-Up iterative tabulation to visualize base cases.',
      'Use the 3-step blueprint: 1) Define state dp[i], 2) Formulate transition equation, 3) Identify boundary base cases.'
    ],
    keyPitfallToAvoid: 'Jumping straight into writing nested loops before formulating the formal recurrence relation.',
    quickCheckQuestion: 'In the 0/1 Knapsack problem, why does the inner weight loop run backward in a 1D space-optimized array?',
    recommendedStudyTime: '45 mins / day for 3 days',
    status: 'Practicing' as const,
  },
  {
    id: 'weak-2',
    topicName: 'Integration by Parts & Tabular Integration Traps',
    subject: 'Mathematics & Statistics' as const,
    severity: 'Critical Gap' as const,
    masteryScore: 58,
    rootCause: 'Sign-flipping errors during repeated integration and misidentifying which subfunction to assign to u vs dv using LIATE.',
    actionableSuggestions: [
      'Apply the LIATE mnemonic rule (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential) systematically.',
      'Master the Tabular Method for polynomial-exponential products to avoid algebraic arithmetic slips.',
      'Always differentiate your resulting antiderivative to verify it reproduces the original integrand.'
    ],
    keyPitfallToAvoid: 'Forgetting the negative sign distribution across multi-step nested integration terms.',
    quickCheckQuestion: 'When evaluating ∫ e^x * sin(x) dx, what recursive algebraic technique is required to isolate the integral?',
    recommendedStudyTime: '30 mins / day for 4 days',
    status: 'Under Review' as const,
  },
  {
    id: 'weak-3',
    topicName: 'Rotational Dynamics & Angular Momentum Conservation',
    subject: 'Physics & Engineering' as const,
    severity: 'Moderate Difficulty' as const,
    masteryScore: 64,
    rootCause: 'Failing to determine the correct axis of rotation when calculating moments of inertia, and confusing net torque with linear force.',
    actionableSuggestions: [
      'Always state your chosen reference pivot point explicitly before setting Στ = Iα or ΣL_initial = ΣL_final.',
      'Review Parallel Axis Theorem (I = I_cm + Md²) with rolling-without-slipping cylinder problems.',
      'Map linear analogs directly to rotational variables: m ↔ I, v ↔ ω, F ↔ τ, p ↔ L.'
    ],
    keyPitfallToAvoid: 'Assuming angular momentum is conserved about ANY point when an external force exerts a non-zero torque about that point.',
    quickCheckQuestion: 'Why does an ice skater spin faster when pulling in their arms if no external torque is applied?',
    recommendedStudyTime: '35 mins / day for 2 days',
    status: 'Practicing' as const,
  },
  {
    id: 'weak-4',
    topicName: 'CRISPR-Cas9 PAM Recognition & Non-Homologous End Joining (NHEJ)',
    subject: 'Biology & Medicine' as const,
    severity: 'Moderate Difficulty' as const,
    masteryScore: 71,
    rootCause: 'Mixing up the distinction between homology-directed repair (HDR) which requires a donor template versus error-prone NHEJ knockouts.',
    actionableSuggestions: [
      'Diagram the Cas9 R-loop formation and PAM (5\'-NGG-3\') interrogation process step-by-step.',
      'Contrast the cell cycle phases where HDR is active (S/G2 phase) vs NHEJ (throughout all phases).',
      'Review off-target mismatch mitigation strategies like Cas9 nickases and high-fidelity engineered variants.'
    ],
    keyPitfallToAvoid: 'Assuming Cas9 can cleave DNA without first recognizing the adjacent Protospacer Adjacent Motif (PAM).',
    quickCheckQuestion: 'What triggers NHEJ over HDR when double-strand breaks occur during G1 phase?',
    recommendedStudyTime: '25 mins / day for 2 days',
    status: 'Under Review' as const,
  },
  {
    id: 'weak-5',
    topicName: 'Buffer Systems & Henderson-Hasselbalch Equilibria',
    subject: 'Chemistry' as const,
    severity: 'Needs Polish' as const,
    masteryScore: 79,
    rootCause: 'Incorrectly assuming buffer capacity is infinite, or using molarity rather than mole ratios during strong acid/base titration stress.',
    actionableSuggestions: [
      'Use ICE (Initial, Change, Equilibrium) tables in moles first before applying pH = pKa + log([A-]/[HA]).',
      'Remember that optimal buffer capacity occurs when pH = pKa (i.e. [conjugate base] = [weak acid]).',
      'Practice calculating pH shifts when 0.05 M HCl is introduced to a 0.2 M acetate buffer.'
    ],
    keyPitfallToAvoid: 'Applying the Henderson-Hasselbalch equation after the buffer capacity has been completely overwhelmed.',
    quickCheckQuestion: 'At what ratio of [A-] to [HA] is a buffer most resistant to pH shifts upon addition of both acids and bases?',
    recommendedStudyTime: '20 mins / day for 2 days',
    status: 'Mastered' as const,
  }
];

export const INITIAL_PERSONALIZED_GUIDE = {
  id: 'guide-default-1',
  subject: 'Computer Science & AI' as const,
  goalContext: 'Preparing for Technical Midterms & Data Structures Competency',
  overallDiagnosis: 'Your conceptual grasp of linear data structures and graph fundamentals is strong (90%+). However, a diagnostic vulnerability exists in Recursive State Formulation and Asymptotic Boundary Invariants (Dynamic Programming & Topological Traversal). Targeting these specific cognitive blockers will accelerate your mastery score past 92%.',
  weakTopics: INITIAL_WEAK_TOPICS,
  weeklyRecoveryRoadmap: [
    {
      dayOrPhase: 'Phase 1: Days 1-2',
      focus: 'Visualizing Overlapping Subproblems & Recursion Trees',
      actionItems: [
        'Complete 3 Socratic AI Tutor sessions deconstructing DP state transitions without looking at solutions.',
        'Draw DAG dependency structures on paper for Fibonacci, Climbing Stairs, and Coin Change.'
      ],
      recommendedTechnique: 'Feynman Technique: Explain the subproblem overlap to an imaginary 10-year old.'
    },
    {
      dayOrPhase: 'Phase 2: Days 3-4',
      focus: 'Tabulation Transformation & Space Optimization',
      actionItems: [
        'Convert recursive solutions into 2D iterative tables, observing row-to-row dependencies.',
        'Optimize memory from O(N²) to O(N) using rolling arrays and evaluate cache locality benefits.'
      ],
      recommendedTechnique: 'Deliberate Practice: Solve 2 medium-level DP problems with a 25-minute timer.'
    },
    {
      dayOrPhase: 'Phase 3: Days 5-6',
      focus: 'Timed Psychometric Diagnostic Assessment',
      actionItems: [
        'Take an interactive 5-question targeted assessment in StudyMate Quiz Studio.',
        'Review any missed distractors using the Doubt Resolver hydraulic/intuitive breakdowns.'
      ],
      recommendedTechnique: 'Active Recall & Error Log Audit.'
    }
  ],
  generatedAt: 'Updated Today'
};

export const HACKATHON_PITCH_SLIDES = [
  {
    id: 'problem',
    badge: 'The Problem Statement',
    title: 'Fragmented EdTech & Cognitive Exhaustion',
    points: [
      'Students juggle 5-7 disjointed tools (ChatGPT for Q&A, Anki for flashcards, Chegg/Google for doubts, Google Calendar for planning, Notion for notes).',
      'Educators spend 15+ hours every week manually creating rubric-aligned assignments and grading problem sets.',
      'Existing AI wrappers just dump raw answers, depriving students of the critical cognitive struggle required for long-term memory retention.',
    ],
    metric: '73% of students report cognitive overload switching between fragmented study tools.',
  },
  {
    id: 'solution',
    badge: 'Our Innovation & What Never Existed Before',
    title: 'The Closed-Loop Adaptive Academic Hub',
    points: [
      'Unified Cognitive Loop: Doubts resolved automatically trigger targeted micro-quizzes, which update the student\'s mastery radar, which re-weights the Adaptive Study Planner.',
      'Socratic Guardrails: AI Tutor enforces pedagogical modes (Feynman, Socratic, Rigorous Proofs) instead of passive answer generation.',
      'Educator-in-the-Loop Co-Pilot: Generates standards-based tiered assignments with multi-dimensional rubrics in seconds.',
      'Career Reality Alignment: Bridges classroom theory with 2026 industry demand, real-world portfolio capstones, and skill-gap diagnostics.',
    ],
    metric: '1 Single Interface replacing 6 separate standalone subscription applications.',
  },
  {
    id: 'architecture',
    badge: 'Technical & Pedagogical Architecture',
    title: 'Powered by Gemini 3.8 Flash & Full-Stack Rigor',
    points: [
      'Server-Authoritative Gemini 3.8 Flash orchestration: low-latency structured schema generation with zero browser key exposure.',
      'Cognitive Psychology Engine: Implements Spaced Repetition, Interleaved Practice, and Bloom\'s Taxonomy progression.',
      'High-yield psychometric assessment generation with distractors designed around diagnosed cognitive traps.',
      'Interactive Client State Engine: Instant timer integration, audio synthesis read-aloud, and mastery progression sync.',
    ],
    metric: 'Sub-second AI inference with rich JSON schema validation.',
  },
  {
    id: 'impact',
    badge: 'Value Proposition & Scalability',
    title: 'Measurable Academic & Operational Outcomes',
    points: [
      'For Students: 2.4x higher concept retention through Socratic retrieval practice and instant multi-angle doubt resolution.',
      'For Teachers: 80% reduction in assignment authoring & rubric drafting overhead.',
      'For Institutions: Real-time cohort analytics, early intervention flags for struggling students, and turnkey career readiness tracking.',
    ],
    metric: 'Estimated 12+ hours saved per student & teacher every single week.',
  },
];
