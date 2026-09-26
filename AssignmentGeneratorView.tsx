import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  BookOpen, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Lightbulb,
  FileText
} from 'lucide-react';
import { GeneratedAssignment, Subject } from '../types';
import { ALL_SUBJECTS } from '../data/mockAcademicData';

interface AssignmentGeneratorViewProps {
  onActivityLogged: (activity: { title: string; type: 'assignment'; highlight: string }) => void;
}

export const AssignmentGeneratorView: React.FC<AssignmentGeneratorViewProps> = ({ onActivityLogged }) => {
  const [topic, setTopic] = useState('Graph Traversals, Dijkstra & Network Routing');
  const [subject, setSubject] = useState<Subject>('Computer Science & AI');
  const [gradeLevel, setGradeLevel] = useState('Undergraduate (College)');
  const [assignmentType, setAssignmentType] = useState('Applied Problem Set & Mini-Project');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [assignment, setAssignment] = useState<GeneratedAssignment | null>({
    id: 'asg-initial',
    title: 'Autonomous Transit Routing: Dynamic Graph Traversals & Shortest Paths',
    subject: 'Computer Science & AI',
    gradeLevel: 'Undergraduate (College)',
    durationEst: '4 - 6 Hours',
    problemScenario: 'You are the lead algorithm engineer for a metropolitan autonomous vehicle fleet. A central dispatch server must compute optimal multi-stop routes under dynamic road construction closures and congestion weightings.',
    learningObjectives: [
      'Implement graph representation models and analyze topological memory trade-offs.',
      'Formulate Dijkstra’s and A* search algorithms with priority queue data structures.',
      'Empirically evaluate asymptotic Big-O runtime performance across varied graph densities.'
    ],
    tieredTasks: [
      {
        tier: 'Foundation',
        description: 'Construct the adjacency-list graph representation and pass all automated unit tests for a 15-intersection municipal grid.',
        deliverable: 'Tested modular graph data structure with verification test suite logs.',
        estimatedMinutes: 60
      },
      {
        tier: 'Application',
        description: 'Implement priority-queue-based Dijkstra’s routing with dynamic edge weight updates when road construction delays occur.',
        deliverable: 'Source code and execution benchmark table comparing O(V^2) array search vs O((V+E)log V) min-heap.',
        estimatedMinutes: 120
      },
      {
        tier: 'Mastery & Innovation',
        description: 'Design an admissible Euclidean distance heuristic for A* traversal. Prove whether the heuristic remains optimal when vehicle speeds vary by lane.',
        deliverable: 'Technical analysis write-up (max 2 pages) with theoretical proof and failure-mode analysis.',
        estimatedMinutes: 90
      }
    ],
    rubric: [
      {
        criterion: 'Algorithmic Correctness & Data Structures',
        weight: 40,
        exemplary: 'Flawlessly handles cyclic paths, disconnected clusters, and negative-weight detection; zero runtime exceptions.',
        proficient: 'Solves connected test graphs; minor edge case issues on isolated nodes or zero-length paths.',
        developing: 'Fails on cyclic topologies; incorrect priority queue extraction logic.'
      },
      {
        criterion: 'Benchmark & Asymptotic Analysis',
        weight: 35,
        exemplary: 'Thorough empirical plots mapped directly against Big-O theoretical bounds with cache-locality observations.',
        proficient: 'Includes benchmark tables, but analysis lacks depth regarding dense vs sparse graph trade-offs.',
        developing: 'Superficial runtime notes without quantitative graphs or mathematical rigor.'
      },
      {
        criterion: 'Code Quality & Reproducibility',
        weight: 25,
        exemplary: 'Modular architecture, strict typing, comprehensive docstrings, and a 1-command automated test runner.',
        proficient: 'Readable and organized code; documentation requires slight interpretation.',
        developing: 'Monolithic script without modular functions or clear setup documentation.'
      }
    ],
    submissionGuidelines: [
      'Submit your code repository link (GitHub or zip archive) with a README explaining execution steps.',
      'Include your technical report PDF containing benchmark plots and proofs.',
      'Ensure code adheres to standard language style guides (PEP8 / Prettier).'
    ],
    teacherKeyInsights: 'Pay special attention to how students implement the priority queue decrease-key operation in Task 2. Many students forget that standard language libraries do not support O(log N) decrease-key natively, leading to interesting heap rebuild trade-offs.'
  });

  const handleGenerateAssignment = async (overrideTopic?: string) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/assignment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          subject,
          gradeLevel,
          assignmentType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate assignment');
      }

      const data: GeneratedAssignment = await response.json();
      setAssignment(data);
      onActivityLogged({
        title: `Created Assignment: ${data.title.slice(0, 36)}...`,
        type: 'assignment',
        highlight: `Tiered tasks & 3-criteria rubric for ${gradeLevel}`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!assignment) return;
    const md = `# ${assignment.title}
**Subject:** ${assignment.subject} | **Grade Level:** ${assignment.gradeLevel} | **Estimated Duration:** ${assignment.durationEst}

## Scenario Overview
${assignment.problemScenario}

## Learning Objectives
${assignment.learningObjectives.map((o) => `- ${o}`).join('\n')}

## Tiered Tasks
${assignment.tieredTasks
  .map(
    (t) => `### ${t.tier} (${t.estimatedMinutes} mins)
**Description:** ${t.description}
**Deliverable:** ${t.deliverable}`
  )
  .join('\n\n')}

## Grading Rubric
| Criterion | Weight | Exemplary | Proficient | Developing |
|---|---|---|---|---|
${assignment.rubric
  .map(
    (r) => `| ${r.criterion} | ${r.weight}% | ${r.exemplary} | ${r.proficient} | ${r.developing} |`
  )
  .join('\n')}

## Submission Guidelines
${assignment.submissionGuidelines.map((s) => `- ${s}`).join('\n')}

---
*Generated by StudyMate Academic Hub*
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Assignment Setup Studio */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="max-w-3xl mb-5">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Educator & Course Co-Pilot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Assignment & Rubric Studio
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Transforms any syllabus topic into an authentic, tiered problem scenario with rigorous multi-level assessment rubrics. Simplifies teaching and empowers students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Assignment Topic / Unit</label>
            <input
              type="text"
              id="assignment-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. CRISPR Gene Editing Ethics, Microeconomic Monopoly Pricing..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Academic Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="High School AP / IB">High School AP / IB</option>
              <option value="Undergraduate (College)">Undergraduate (College)</option>
              <option value="Graduate / Professional">Graduate / Professional</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Prompts:</span>
            {[
              'CRISPR Cas9 Genomic Engineering',
              'Macroeconomic Fiscal Policy & Inflation',
              'Quantum Wave Mechanics & Tunneling',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setTopic(preset);
                  handleGenerateAssignment(preset);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 transition-all cursor-pointer font-medium"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            id="generate-assignment-btn"
            onClick={() => handleGenerateAssignment()}
            disabled={isLoading || !topic.trim()}
            className="flex items-center justify-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Architecting Rubric...' : 'Generate Assignment & Rubric'}</span>
          </button>
        </div>
      </div>

      {/* Render Generated Assignment */}
      {assignment && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
          {/* Header Action Strip */}
          <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {assignment.subject}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {assignment.gradeLevel}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {assignment.durationEst}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {assignment.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Markdown' : 'Copy for Canvas/LMS'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Real-World Context Scenario */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>Authentic Problem Scenario</span>
              </h4>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                {assignment.problemScenario}
              </p>
            </div>

            {/* Learning Objectives */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Targeted Learning Objectives</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {assignment.learningObjectives.map((obj, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                    <span className="font-bold text-indigo-600 mt-0.5">{i + 1}.</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Tiered Tasks */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Tiered Task Architecture (Foundation ➔ Application ➔ Mastery)</span>
              </h4>
              <div className="space-y-3">
                {assignment.tieredTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          task.tier === 'Foundation'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : task.tier === 'Application'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          Tier {idx + 1}: {task.tier}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Est. Time: {task.estimatedMinutes} mins
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                        {task.description}
                      </p>
                      <div className="text-xs text-slate-500 font-medium pt-1">
                        <span className="text-slate-700 font-semibold">Deliverable: </span>
                        {task.deliverable}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Grading Rubric */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Multi-Dimensional Standards-Based Rubric</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3 w-1/4">Criterion & Weight</th>
                      <th className="p-3 w-1/4 text-emerald-800 bg-emerald-50/50">Exemplary (90-100%)</th>
                      <th className="p-3 w-1/4 text-blue-800 bg-blue-50/50">Proficient (75-89%)</th>
                      <th className="p-3 w-1/4 text-amber-800 bg-amber-50/50">Developing (&lt;75%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {assignment.rubric.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 align-top">
                          <span className="font-bold text-slate-900 block text-xs">
                            {r.criterion}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mt-1">
                            {r.weight}% of Total Grade
                          </span>
                        </td>
                        <td className="p-3.5 align-top text-slate-700 leading-relaxed bg-emerald-50/20">
                          {r.exemplary}
                        </td>
                        <td className="p-3.5 align-top text-slate-700 leading-relaxed bg-blue-50/20">
                          {r.proficient}
                        </td>
                        <td className="p-3.5 align-top text-slate-700 leading-relaxed bg-amber-50/20">
                          {r.developing}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submission Guidelines & Teacher Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Student Submission Protocol:
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {assignment.submissionGuidelines.map((g, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Instructor Diagnostic Note:</span>
                </h5>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {assignment.teacherKeyInsights}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
