import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Layers, 
  Award, 
  Briefcase, 
  ArrowRight,
  Code2,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { CareerPathGuidance } from '../types';

interface CareerGuidanceViewProps {
  onActivityLogged: (activity: { title: string; type: 'planner'; highlight: string }) => void;
}

export const CareerGuidanceView: React.FC<CareerGuidanceViewProps> = ({ onActivityLogged }) => {
  const [dreamRole, setDreamRole] = useState('AI / Machine Learning Engineer');
  const [currentDegreeOrYear, setCurrentDegreeOrYear] = useState('3rd Year Undergraduate (Computer Science)');
  const [existingSkills, setExistingSkills] = useState('Python, Linear Algebra, Object-Oriented Programming, basic PyTorch');
  const [isLoading, setIsLoading] = useState(false);

  const [guidance, setGuidance] = useState<CareerPathGuidance | null>({
    targetRole: 'AI / Machine Learning Engineer',
    industryDemand: 'Very High',
    averageStartingSalary: '$125,000 - $170,000 / year',
    roleSummary: 'Designs, trains, and operationalizes neural architectures, retrieval-augmented pipelines, and low-latency inference systems with real production rigor.',
    keySkills: {
      technical: [
        { name: 'PyTorch & Distributed Training', proficiencyTarget: 'Advanced - Custom Autograd, FSDP & Tensor Parallelism' },
        { name: 'Transformer & Attention Mechanics', proficiencyTarget: 'Proficient - FlashAttention, LoRA fine-tuning & Quantization' },
        { name: 'Vector DBs & Hybrid Search', proficiencyTarget: 'Proficient - HNSW, Sparse-Dense embeddings, Rerankers' },
        { name: 'Production MLOps & Serving', proficiencyTarget: 'Intermediate - vLLM, TensorRT-LLM, Docker & Kubernetes' },
      ],
      soft: [
        { name: 'Empirical Research Synthesis', importance: 'Rapidly decoding arXiv preprints and benchmarking algorithms against production latency budgets.' },
        { name: 'Cross-Functional Translation', importance: 'Translating loss convergence and perplexity metrics into actionable user experience value.' },
      ],
    },
    learningRoadmap: [
      {
        phase: 'Phase 1: Mathematical Foundations & Tensor Ops',
        timeframe: 'Months 1 - 2',
        title: 'From-Scratch Deep Learning Implementations',
        objectives: [
          'Code backpropagation and reverse-mode automatic differentiation from scratch using pure NumPy arrays.',
          'Understand matrix calculus, Hessian dynamics, and AdamW optimizer momentum invariants.',
          'Profile GPU memory bottlenecks and CUDA tensor operations.'
        ],
        portfolioProject: {
          title: 'MicroGrad & Custom Tensor Engine',
          description: 'A lightweight auto-differentiation engine with a micro-transformer trained on TinyShakespeare, featuring live loss visualization.',
          techStackOrTools: ['Python', 'PyTorch', 'Weights & Biases', 'NumPy'],
        },
      },
      {
        phase: 'Phase 2: Modern Generative Architectures & Retrieval',
        timeframe: 'Months 3 - 4',
        title: 'Applied Systems Engineering, Fine-Tuning & RAG',
        objectives: [
          'Build multi-stage retrieval pipelines with semantic re-rankers, chunking strategies, and query expansion.',
          'Implement Parameter-Efficient Fine-Tuning (PEFT/QLoRA) on open-weights reasoning models.',
          'Evaluate hallucination rates using automated LLM-as-a-judge benchmark harnesses.'
        ],
        portfolioProject: {
          title: 'Enterprise Multi-Agent Knowledge Engine',
          description: 'Production-ready agentic RAG application with query routing, self-correction loops, and structured evaluation metrics.',
          techStackOrTools: ['Gemini API', 'ChromaDB', 'FastAPI', 'LangGraph', 'Docker'],
        },
      },
      {
        phase: 'Phase 3: High-Throughput Serving & Capstone Impact',
        timeframe: 'Months 5 - 6',
        title: 'Scalable Systems & End-to-End Delivery',
        objectives: [
          'Serve quantized models using vLLM continuous batching under strict P99 latency bounds.',
          'Implement streaming response APIs with client-side audio and markdown renderers.',
          'Publish a comprehensive technical report and reproducible benchmark repository on GitHub.'
        ],
        portfolioProject: {
          title: 'Autonomous Real-Time Multimodal Research Assistant',
          description: 'Full-stack application delivering real-time academic paper ingestion, mathematical derivation diagrams, and synthetic audio briefings.',
          techStackOrTools: ['Cloud Run', 'PyTorch', 'React', 'TypeScript', 'vLLM'],
        },
      },
    ],
    topCertifications: [
      'DeepLearning.AI Deep Learning Specialization (Coursera)',
      'Google Cloud Professional Machine Learning Engineer Certification',
      'NVIDIA Deep Learning Institute: Fundamentals of Accelerated Computing'
    ],
    recommendedRealWorldProjects: [
      'Submit a pull request improving documentation or test coverage in Hugging Face Transformers or vLLM.',
      'Write an interactive technical blog post breaking down a recent paper with interactive 3D visualizations.',
      'Participate in a Kaggle competition targeting code synthesis or medical document QA.'
    ],
    industryOutlook2026: 'Hiring managers are moving past superficial prompt engineering towards engineers who understand mathematical loss surfaces, inference kernel optimization, and production system reliability.'
  });

  const handleGeneratePathway = async (overrideRole?: string) => {
    const target = overrideRole || dreamRole;
    if (!target || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/career/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamRole: target,
          currentDegreeOrYear,
          existingSkills,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate career guidance');
      }

      const data: CareerPathGuidance = await response.json();
      setGuidance(data);
      onActivityLogged({
        title: `Career Roadmap: ${data.targetRole}`,
        type: 'planner',
        highlight: `Market Demand: ${data.industryDemand} · Roadmap mapped`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Setup & Exploration Studio */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mb-6">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Academic-to-Industry Mentorship
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
            Career Guidance & Field Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Connects your coursework to real industry expectations. Diagnoses your current preparation, architects tangible portfolio milestones, and provides candid advice from seasoned domain leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Target Dream Role</label>
            <input
              type="text"
              id="career-role-input"
              value={dreamRole}
              onChange={(e) => setDreamRole(e.target.value)}
              placeholder="e.g. AI Research Engineer, Quantitative Researcher..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Current Degree / Academic Year</label>
            <input
              type="text"
              value={currentDegreeOrYear}
              onChange={(e) => setCurrentDegreeOrYear(e.target.value)}
              placeholder="e.g. 3rd Year B.S. in Computer Science"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Existing Core Skills</label>
            <input
              type="text"
              value={existingSkills}
              onChange={(e) => setExistingSkills(e.target.value)}
              placeholder="e.g. Python, SQL, Linear Algebra"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-600 font-medium"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Curated Tracks:</span>
            {[
              'Autonomous Robotics Engineer',
              'Quantitative Researcher',
              'Computational Biologist',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setDreamRole(preset);
                  handleGeneratePathway(preset);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-all cursor-pointer font-medium"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            id="generate-career-pathway-btn"
            onClick={() => handleGeneratePathway()}
            disabled={isLoading || !dreamRole.trim()}
            className="flex items-center justify-center gap-2 py-2 px-5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>{isLoading ? 'Consulting Industry Benchmarks...' : 'Generate Career Pathway'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Career Path Guidance */}
      {guidance && (
        <div className="space-y-6">
          {/* Target Role Overview: Warm, dignified scholar panel */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300 font-medium border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-semibold">Market Demand:</span>
                <span>{guidance.industryDemand}</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <span className="text-stone-400">Typical Starting Compensation:</span>
                <span className="font-semibold text-stone-100">{guidance.averageStartingSalary}</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {guidance.targetRole}
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed font-serif">
                {guidance.roleSummary}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-800 text-xs text-stone-300">
              <strong className="text-amber-300 font-semibold block sm:inline mr-1">
                Senior Mentor's Perspective:
              </strong>
              <span className="font-serif leading-relaxed italic text-stone-200">
                "{guidance.industryOutlook2026}"
              </span>
            </div>
          </div>

          {/* Core Competencies: Technical & Professional Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <Code2 className="w-4 h-4 text-stone-700" />
                <span className="font-serif text-base">Technical Core Competencies</span>
              </div>
              <div className="space-y-2.5 pt-1">
                {guidance.keySkills.technical.map((skill, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
                    <div className="font-semibold text-xs text-stone-900">{skill.name}</div>
                    <div className="text-[11px] text-stone-600">
                      <span className="text-stone-800 font-medium">Standard Target: </span>
                      {skill.proficiencyTarget}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft / Professional Skills */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                <UserCheck className="w-4 h-4 text-stone-700" />
                <span className="font-serif text-base">Professional & Human Skills</span>
              </div>
              <div className="space-y-2.5 pt-1">
                {guidance.keySkills.soft.map((skill, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
                    <div className="font-semibold text-xs text-stone-900">{skill.name}</div>
                    <div className="text-[11px] text-stone-600">
                      <span className="text-stone-800 font-medium">Why Hiring Leads Care: </span>
                      {skill.importance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Phase Milestone Roadmap */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Structured Progression
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                3-Phase Milestone & Portfolio Roadmap
              </h3>
            </div>

            <div className="space-y-4">
              {guidance.learningRoadmap.map((milestone, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-stone-500 font-bold text-sm">
                        0{idx + 1}.
                      </span>
                      <h4 className="font-serif font-bold text-sm text-stone-900">
                        {milestone.phase}: {milestone.title}
                      </h4>
                    </div>

                    <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      {milestone.timeframe}
                    </span>
                  </div>

                  {/* Phase objectives */}
                  <div>
                    <span className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Learning Objectives:
                    </span>
                    <ul className="space-y-1 text-xs text-stone-600 font-serif leading-relaxed">
                      {milestone.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-800 font-bold shrink-0">·</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Portfolio Capstone Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1">
                    <span className="font-semibold text-xs text-stone-900 block font-serif">
                      Portfolio Milestone: {milestone.portfolioProject.title}
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed font-serif">
                      {milestone.portfolioProject.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <span className="text-[10px] text-stone-400 font-medium">Tools:</span>
                      {milestone.portfolioProject.techStackOrTools.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Certifications & Real-World Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Recognized Industry Credentials:</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700 font-serif">
                {guidance.topCertifications.map((cert, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-stone-700" />
                <span>High-Leverage Real-World Actions:</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700 font-serif">
                {guidance.recommendedRealWorldProjects.map((act, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
