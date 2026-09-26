import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { generateSmartDoubtFallback } from "./src/server/doubtKnowledgeBase";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI client lazily/safely
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using smart AI simulation engine for fallback responses.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Candidate models prioritized for speed, latest capabilities, and uptime
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash"
];

async function generateGeminiContent(options: {
  contents: string | any[];
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.temperature !== undefined) config.temperature = options.temperature;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.responseSchema) config.responseSchema = options.responseSchema;

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      if (response && typeof response.text === "string" && response.text.trim().length > 0) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`Model ${model} temporarily unavailable: ${err.message || err.status}. Escalating to next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All candidate Gemini models failed to generate content");
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

function parseTutorDelimiters(text: string, defaultSnippet = "Deconstructed student query into core principles and formulated guiding inquiry.") {
  let thoughtSnippet = defaultSnippet;
  let content = text;
  let principles: string[] = ["Foundational Invariance", "Algorithmic Complexity", "Dynamic Equilibrium"];
  let followUpSuggestions: string[] = [
    "Can you give me an intuitive real-world analogy?",
    "Walk me through a step-by-step example",
    "Test my knowledge with an exam-style challenge"
  ];

  const posThought = text.search(/---\s*THOUGHT(?:\s*---)?/i);
  const posContent = text.search(/---\s*CONTENT(?:\s*---)?/i);
  const posPrinciples = text.search(/---\s*PRINCIPLES(?:\s*---)?/i);
  const posSuggestions = text.search(/---\s*SUGGESTIONS(?:\s*---)?/i);

  if (posThought !== -1 && posContent !== -1 && posContent > posThought) {
    const rawThought = text.slice(posThought, posContent).replace(/---\s*THOUGHT(?:\s*---)?/i, "").trim();
    if (rawThought) thoughtSnippet = rawThought;
  }

  if (posContent !== -1) {
    const endPos = posPrinciples !== -1 ? posPrinciples : (posSuggestions !== -1 ? posSuggestions : text.length);
    const rawContent = text.slice(posContent, endPos).replace(/---\s*CONTENT(?:\s*---)?/i, "").trim();
    if (rawContent) content = rawContent;
  }

  if (posPrinciples !== -1) {
    const endPos = posSuggestions !== -1 ? posSuggestions : text.length;
    const rawPrinciples = text.slice(posPrinciples, endPos).replace(/---\s*PRINCIPLES(?:\s*---)?/i, "").trim();
    const parsed = rawPrinciples.split(/\||\n/).map(s => s.trim().replace(/^[-*•\d.]\s*/, "")).filter(Boolean);
    if (parsed.length > 0) principles = parsed;
  }

  if (posSuggestions !== -1) {
    const rawSuggestions = text.slice(posSuggestions).replace(/---\s*SUGGESTIONS(?:\s*---)?/i, "").trim();
    const parsed = rawSuggestions.split(/\||\n/).map(s => s.trim().replace(/^[-*•\d.]\s*/, "")).filter(Boolean);
    if (parsed.length > 0) followUpSuggestions = parsed.slice(0, 3);
  }

  return { thoughtSnippet, content, principles, followUpSuggestions };
}

// 1. AI TUTOR CHAT (High-Level Cognitive Socratic & Multi-Pedagogy Engine)
app.post("/api/tutor/chat", async (req, res) => {
  const startTime = Date.now();
  const { 
    messages = [], 
    subject = "Computer Science & AI", 
    pedagogyMode = "socratic", 
    gradeLevel = "Undergraduate",
    depthMode = "balanced" 
  } = req.body || {};

  const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : "";

  try {
    const pedagogyInstructions: Record<string, string> = {
      socratic: "You are an intellectual Socratic guide like an MIT/Harvard master professor. NEVER just blurt out the final solution immediately. Instead, deeply acknowledge the nuance of the student's question, identify what underlying mental model or premise is at stake, offer a brilliant intuition or thought experiment, and ask 1-2 focused, razor-sharp guiding questions that prompt the student to deduce the breakthrough themselves. Be encouraging, warm, highly analytical, and clear.",
      feynman: "You are the Feynman Intuition Coach. Explain this concept using simple, everyday analogies (e.g. water pipes, libraries, postal systems, gears), zero impenetrable jargon (or demystify it instantly), and an intuitive mental picture. Make abstract math or science feel tangible and fascinating.",
      step_by_step: "Provide a rigorous university-level step-by-step derivation. State prerequisite definitions and governing axioms, walk through numbered mathematical or logical deduction steps, clarify boundary limits, and conclude with an actionable synthesis.",
      exam_prep: "Act as an elite high-yield exam coach. Highlight frequent trick questions, common cognitive pitfalls where students lose marks, memorization heuristics/mnemonics, and standard exam variations on this exact topic."
    };

    const depthInstructions: Record<string, string> = {
      high_yield: "Keep the explanation concise, high-impact, and immediately actionable with direct Socratic prompts.",
      balanced: "Provide a thorough conceptual response with clean structure, rich formatting, real examples, and guided inquiry.",
      deep_dive: "Provide advanced graduate/research level depth, exploring theoretical foundations, edge-case asymptotics, and formal reasoning."
    };

    const chosenInstruction = pedagogyInstructions[pedagogyMode] || pedagogyInstructions.socratic;
    const chosenDepth = depthInstructions[depthMode] || depthInstructions.balanced;

    const systemPrompt = `You are Cognita AI, a world-class adaptive AI Tutor and Cognitive Mentor operating with the reasoning power and responsiveness of ChatGPT, Gemini Advanced, and Perplexity Pro for ${subject} at the ${gradeLevel} level.
Pedagogical Methodology: ${chosenInstruction}
Response Depth: ${chosenDepth}

Format your output strictly using these section delimiters:
---THOUGHT---
(1-2 sentences stating your pedagogical strategy: what you observed in the student's question and how you are guiding their thinking)
---CONTENT---
(Your complete, deeply insightful, high-level pedagogical response. Use rich Markdown: **bold headers**, bullet points, numbered reasoning, LaTeX/math expressions ($...$ or $$...$$) and clean code blocks if applicable. Directly and specifically address the student's exact query. Never output generic or canned text.)
---PRINCIPLES---
(3-4 key principles, theorems, or conceptual foundations separated by | )
---SUGGESTIONS---
(3 clickable follow-up exploration queries tailored specifically to this inquiry, separated by | )`;

    const chatHistory = (messages || [])
      .map((m: any) => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join("\n\n");

    const userPrompt = `Conversation History:
${chatHistory}

Student's Latest Inquiry: "${latestMessage}"
Subject: ${subject}
Academic Level: ${gradeLevel}
Selected Pedagogy: ${pedagogyMode}

Provide a brilliant, high-level pedagogical response adhering strictly to the delimited structure.`;

    const { text, modelUsed } = await generateGeminiContent({
      contents: userPrompt,
      systemInstruction: systemPrompt,
      temperature: 0.7,
    });

    const parsed = parseTutorDelimiters(text);

    res.json({
      content: parsed.content,
      thoughtSnippet: parsed.thoughtSnippet,
      principles: parsed.principles,
      followUpSuggestions: parsed.followUpSuggestions,
      modelUsed,
      latencyMs: Date.now() - startTime
    });
  } catch (error: any) {
    console.error("AI Tutor runtime fallback triggered:", error.message);
    const query = latestMessage || "this concept";
    res.json({
      content: `### Socratic Exploration: **${query}**\n\nTo build genuine first-principles understanding rather than rote memorization, let us deconstruct this:\n\n1. **The Core Premise**: When examining **"${query}"**, what is the fundamental boundary condition or invariant that cannot be violated?\n2. **Mechanism in Action**: Imagine the system at its simplest edge state. How does perturbing the primary variable propagate through the dependent parameters?\n3. **Guiding Question**: If you were to explain the causal direction of this phenomenon, what underlying assumption feels most non-intuitive to you?\n\nTake a moment to formulate your hypothesis—what do you predict happens first?`,
      thoughtSnippet: "Deconstructed query into fundamental invariant boundaries and causal steps.",
      principles: ["Boundary Invariance", "Causal Directionality", "Inductive Generalization"],
      followUpSuggestions: [
        `What happens in the extreme edge case of "${query.slice(0, 25)}"?`,
        "Explain this with a concrete real-world analogy",
        "Challenge me with a diagnostic verification question"
      ],
      modelUsed: "offline-cognitive-engine",
      latencyMs: Date.now() - startTime
    });
  }
});

// 2. DOUBT RESOLUTION ASSISTANT (High-Clarity, Intuitive, Simple Language Engine)
app.post("/api/doubt/resolve", async (req, res) => {
  const { 
    doubtText = "Concept Inquiry", 
    subject = "General Science & Math", 
    academicLevel = "High School / College",
    style = "simple" // "simple" | "concise" | "deep" | "exam"
  } = req.body;

  try {
    if (!doubtText || !doubtText.trim()) {
      return res.status(400).json({ error: "doubtText is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateSmartDoubtFallback(doubtText, subject, academicLevel, style);
      return res.json(fallback);
    }

    const styleInstructions: Record<string, string> = {
      simple: "Use simple, conversational, crystal-clear language that any high school or college student can immediately grasp on their first read. Avoid dense, unnecessary academic jargon. Prefer everyday terms, relatable examples, and lucid explanations.",
      concise: "Keep explanations tight, high-yield, punchy, and fast to read with strong visual emphasis on bullet points and key axioms.",
      deep: "Provide thorough conceptual depth and first-principles rigor while keeping the language crystal clear and accessible.",
      exam: "Focus heavily on how examiners frame questions around this doubt, the exact points required for full credit, and common trick questions to avoid."
    };

    const chosenStyleGuide = styleInstructions[style] || styleInstructions.simple;

    const systemPrompt = `You are a world-class educational mentor and doubt-resolution specialist in ${subject} (${academicLevel}).
Your mission is to completely dispel the student's doubt with maximum clarity, high relevance, and simple, friendly language.

Pedagogy & Style Rules:
- ${chosenStyleGuide}
- DIRECT ANSWER FIRST: In 'directAnswer', give a concise 2-3 sentence answer directly answering the question without hedging or delay.
- MEMORABLE ANALOGY: In 'intuitiveAnalogy', provide an everyday real-world metaphor (e.g., postal letters, water pipes, kitchen recipes, backpacks, traffic) that turns the abstract concept into an instant mental picture.
- STEP-BY-STEP BREAKDOWN: In 'stepByStepSolution', provide 3 to 5 clear numbered steps. Each step MUST start with a concise bold action header (e.g. "**Step 1: Understand the setup:** ...") and walk through the reasoning logically in simple terms.
- REAL-WORLD APPLICATION: In 'realWorldExample', describe a practical real-world scenario (e.g., streaming apps, space travel, smartphones, medicine) where this principle is actively applied.
- GOLDEN RULE: In 'keyFormulaOrRule', provide a 1-sentence memorable rule of thumb or core equation.
- RAPID REVISION: In 'summaryBullets', provide 3 quick high-yield bullet points summarizing the core takeaways.
- COMMON PITFALLS: In 'commonPitfalls', provide 2 to 3 specific misconceptions, exam traps, or false assumptions students make on this exact topic.
- MASTERY CHECK: In 'checkYourUnderstanding', craft a multiple-choice question testing the core insight of this specific doubt, with 4 realistic options, 0-indexed correctIndex, and a clear explanation of why that answer is correct.`;

    const { text } = await generateGeminiContent({
      contents: `Student's Specific Doubt: "${doubtText}".
Subject: ${subject}. Academic Level: ${academicLevel}. Tone/Style: ${style}.`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.3,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coreConcept: { type: Type.STRING },
          directAnswer: { type: Type.STRING },
          whyItsConfusing: { type: Type.STRING },
          intuitiveAnalogy: { type: Type.STRING },
          stepByStepSolution: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          realWorldExample: { type: Type.STRING },
          keyFormulaOrRule: { type: Type.STRING },
          summaryBullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          commonPitfalls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          checkYourUnderstanding: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
            },
            required: ["question", "options", "correctIndex", "explanation"],
          },
        },
        required: [
          "coreConcept",
          "directAnswer",
          "whyItsConfusing",
          "intuitiveAnalogy",
          "stepByStepSolution",
          "realWorldExample",
          "commonPitfalls",
          "checkYourUnderstanding",
        ],
      },
    });

    const parsed = JSON.parse(text || "{}");
    res.json({
      doubtText,
      subject,
      ...parsed,
    });
  } catch (error: any) {
    console.warn("Doubt resolver upstream warning, falling back to smart contextual generator:", error.message);
    const fallback = generateSmartDoubtFallback(doubtText, subject, academicLevel, style);
    res.json(fallback);
  }
});

// 3. QUIZ GENERATOR
app.post("/api/quiz/generate", async (req, res) => {
  const { topic = "Machine Learning Fundamentals", subject = "Computer Science & AI", difficulty = "Medium", questionCount = 5 } = req.body || {};
  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        id: `quiz-${Date.now()}`,
        title: `${topic} Mastery Check`,
        subject,
        difficulty,
        totalTimeMinutes: questionCount * 2,
        createdAt: new Date().toISOString(),
        questions: [
          {
            id: "q1",
            question: "Why is the gradient descent learning rate parameter critical in training neural networks?",
            options: [
              "It determines the number of layers in the network",
              "It controls the step size taken towards a minimum of the loss function during optimization",
              "It prevents any non-linear activation functions from firing",
              "It sets the maximum number of training epochs automatically"
            ],
            correctIndex: 1,
            explanation: "The learning rate scales the magnitude of parameter updates with respect to the gradient of the loss surface. Too high causes divergence; too low results in extremely sluggish convergence.",
            hint: "Think about taking steps down a misty hillside to find the lowest valley.",
            difficulty: "Medium",
            bloomsTaxonomy: "Understand"
          },
          {
            id: "q2",
            question: "Which of the following techniques directly mitigates high variance (overfitting) in a predictive model?",
            options: [
              "Removing regularization terms like L1/L2 penalties",
              "Increasing the model complexity by adding unnecessary polynomial features",
              "Using cross-validation, dropout, or pruning superfluous parameters",
              "Training on a significantly smaller subset of data"
            ],
            correctIndex: 2,
            explanation: "Overfitting occurs when the model memorizes training noise. Regularization, dropout in neural nets, and tree pruning constrain capacity and improve generalization to unseen distributions.",
            hint: "Consider how to simplify the model or inject intentional noise during training.",
            difficulty: "Medium",
            bloomsTaxonomy: "Apply"
          },
          {
            id: "q3",
            question: "In classification tasks with severe class imbalance (e.g., 99% negative, 1% positive), which metric is LEAST informative for true model efficacy?",
            options: [
              "Raw Classification Accuracy",
              "Precision-Recall AUC",
              "F1-Score",
              "Balanced Specificity and Sensitivity"
            ],
            correctIndex: 0,
            explanation: "A naive classifier predicting the majority class 100% of the time achieves 99% raw accuracy while being completely useless at detecting the critical positive minority instances.",
            hint: "If a doctor diagnoses everyone as healthy, what is their diagnostic accuracy in a rare disease scenario?",
            difficulty: "Hard",
            bloomsTaxonomy: "Analyze"
          }
        ]
      });
    }

    const systemPrompt = `You are a Psychometric Assessment Architect. Create high-quality, conceptually sound multiple-choice test questions on ${topic} (${subject}) at ${difficulty} difficulty.
Avoid trivial keyword matching. Emphasize conceptual application, diagnosing misconceptions, and realistic problem scenarios.
Include in-depth explanations and hints for each question.`;

    const { text } = await generateGeminiContent({
      contents: `Generate a quiz with ${questionCount} questions on topic: "${topic}", subject: "${subject}", difficulty: "${difficulty}".`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  bloomsTaxonomy: { type: Type.STRING },
                },
                required: [
                  "question",
                  "options",
                  "correctIndex",
                  "explanation",
                  "hint",
                  "difficulty",
                ],
              },
            },
          },
          required: ["title", "questions"],
        },
    });

    const parsed = JSON.parse(text || "{}");
    const questionsWithIds = (parsed.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: `q-${idx + 1}-${Date.now()}`,
    }));

    res.json({
      id: `quiz-${Date.now()}`,
      title: parsed.title || `${topic} Assessment`,
      subject,
      difficulty,
      totalTimeMinutes: Math.max(3, questionCount * 2),
      questions: questionsWithIds,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn("Quiz generator upstream warning, using resilient fallback:", error.message);
    const fallbackQuestions = [
      {
        id: `q-fb-1-${Date.now()}`,
        question: `In evaluating core mechanisms of ${topic}, what is the foundational governing principle?`,
        options: [
          "Optimizing state transitions under conservation and invariant bounds",
          "Random heuristic walk with unconstrained parameters",
          "Hardcoding edge cases into static lookup tables",
          "Disabling dynamic gradient feedback"
        ],
        correctIndex: 0,
        explanation: `Under ${topic}, systems achieve optimal equilibrium by strictly preserving system invariants while updating parameters.`,
        hint: "Consider what invariant must remain conserved across state transitions.",
        difficulty,
        bloomsTaxonomy: "Understand"
      },
      {
        id: `q-fb-2-${Date.now()}`,
        question: `When deploying an implementation of ${topic} to high-throughput environments, which trade-off is most prominent?`,
        options: [
          "Memory footprint and cache locality vs computational latency",
          "Zero overhead with infinite parallel scaling",
          "Arbitrary convergence without loss metrics",
          "Complete independence from underlying hardware architecture"
        ],
        correctIndex: 0,
        explanation: "Empirical systems must balance memory bandwidth, cache residency, and compute operations to prevent bottlenecks.",
        hint: "Think about spatial vs temporal locality in real memory hierarchies.",
        difficulty,
        bloomsTaxonomy: "Apply"
      },
      {
        id: `q-fb-3-${Date.now()}`,
        question: `Which diagnostic failure mode indicates an improper configuration or boundary condition in ${topic}?`,
        options: [
          "Divergent loss or oscillation around a saddle point",
          "Monotonic improvement toward theoretical optima",
          "Zero residual error across unseen generalization tests",
          "Constant execution time across varied input sizes"
        ],
        correctIndex: 0,
        explanation: "Oscillation and divergence signal excessive step sizes or unhandled numerical instabilities.",
        hint: "What happens when feedback is excessively amplified without dampening?",
        difficulty,
        bloomsTaxonomy: "Analyze"
      }
    ];

    res.json({
      id: `quiz-${Date.now()}`,
      title: `${topic} Diagnostic Assessment`,
      subject,
      difficulty,
      totalTimeMinutes: questionCount * 2,
      questions: fallbackQuestions,
      createdAt: new Date().toISOString(),
    });
  }
});

// 4. ASSIGNMENT GENERATOR
app.post("/api/assignment/generate", async (req, res) => {
  const { topic = "Algorithmic Complexity & Graph Traversals", gradeLevel = "College Sophomore", subject = "Computer Science", assignmentType = "Problem Set & Mini-Project" } = req.body || {};
  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        id: `asg-${Date.now()}`,
        title: `${topic}: Practical Analysis & Design`,
        subject,
        gradeLevel,
        durationEst: "4-6 Hours",
        problemScenario: "A smart city emergency dispatch grid requires optimal vehicle routing under dynamic road closure constraints.",
        learningObjectives: [
          "Analyze worst-case and amortized time complexities for dynamic networks.",
          "Formulate graph representations and select between BFS/Dijkstra/A* appropriately.",
          "Synthesize empirical runtime benchmark data against theoretical Big-O models."
        ],
        tieredTasks: [
          {
            tier: "Foundation",
            description: "Construct the adjacency list data structure and verify correctness with unit tests for a 10-node topology.",
            deliverable: "Documented source code and pass/fail test harness logs.",
            estimatedMinutes: 60
          },
          {
            tier: "Application",
            description: "Implement priority-queue-based Dijkstra's routing and test performance on real-world OpenStreetMap benchmark slices.",
            deliverable: "Executable script and comparative runtime table across 100, 1K, and 10K nodes.",
            estimatedMinutes: 120
          },
          {
            tier: "Mastery & Innovation",
            description: "Propose an admissible heuristic for A* under dynamic delays and prove whether it preserves optimality.",
            deliverable: "2-page technical memorandum analyzing heuristic admissibility and failure modes.",
            estimatedMinutes: 90
          }
        ],
        rubric: [
          {
            criterion: "Correctness & Algorithmic Rigor",
            weight: 40,
            exemplary: "Flawless graph implementation; handles edge cycles and disconnected subgraphs with clean error management.",
            proficient: "Solves target topologies; minor inefficiency or edge case misses on isolated nodes.",
            developing: "Logic breaks on cyclic graphs; asymptotic bottlenecks in lookup operations."
          },
          {
            criterion: "Empirical & Theoretical Analysis",
            weight: 35,
            exemplary: "Clear logarithmic/linear plot comparisons mapping theoretical Big-O to wall-clock benchmarks.",
            proficient: "Includes benchmark tables, but analysis lacks depth on cache locality or constants.",
            developing: "Superficial observations without quantitative metrics or runtime graphs."
          },
          {
            criterion: "Engineering Craft & Documentation",
            weight: 25,
            exemplary: "Modular design, PEP/Standard style conformity, comprehensive docstrings and reproducible setup instructions.",
            proficient: "Readable code with standard comments; setup instructions requires minor trial.",
            developing: "Monolithic file with sparse comments and difficult-to-reproduce test instructions."
          }
        ],
        submissionGuidelines: [
          "Submit code via GitHub classroom repository link or zipped source archive.",
          "Include a single PDF for the analysis memorandum with embedded performance charts.",
          "Ensure your automated test runner passes before final push."
        ],
        teacherKeyInsights: "Look closely at how students manage the priority queue decrease-key operation in Task 2—many default to O(V^2) arrays instead of min-heaps."
      });
    }

    const systemPrompt = `You are a Master Curriculum & Instructional Designer. Generate a complete, ready-to-assign academic assignment with learning objectives, a real-world scenario, 3-tiered difficulty tasks (Foundation, Application, Mastery & Innovation), a detailed criteria rubric, submission instructions, and educator insights.`;

    const { text } = await generateGeminiContent({
      contents: `Generate an assignment for topic: "${topic}", subject: "${subject}", grade level: "${gradeLevel}", type: "${assignmentType}".`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            durationEst: { type: Type.STRING },
            problemScenario: { type: Type.STRING },
            learningObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tieredTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tier: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deliverable: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                },
                required: ["tier", "description", "deliverable", "estimatedMinutes"],
              },
            },
            rubric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  weight: { type: Type.INTEGER },
                  exemplary: { type: Type.STRING },
                  proficient: { type: Type.STRING },
                  developing: { type: Type.STRING },
                },
                required: ["criterion", "weight", "exemplary", "proficient", "developing"],
              },
            },
            submissionGuidelines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            teacherKeyInsights: { type: Type.STRING },
          },
          required: [
            "title",
            "durationEst",
            "problemScenario",
            "learningObjectives",
            "tieredTasks",
            "rubric",
            "submissionGuidelines",
            "teacherKeyInsights",
          ],
        },
    });

    const parsed = JSON.parse(text || "{}");
    res.json({
      id: `asg-${Date.now()}`,
      subject,
      gradeLevel,
      ...parsed,
    });
  } catch (error: any) {
    console.warn("Assignment generator upstream warning, using resilient fallback:", error.message);
    res.json({
      id: `asg-${Date.now()}`,
      title: `${topic}: Practical Analysis & Design Studio`,
      subject,
      gradeLevel,
      durationEst: "4-6 Hours",
      problemScenario: `You are the lead engineering specialist tasked with analyzing and operationalizing ${topic} under realistic real-world constraints.`,
      learningObjectives: [
        `Formulate the mathematical or theoretical invariants governing ${topic}.`,
        "Implement and empirically benchmark edge cases and failure modes.",
        "Synthesize actionable technical documentation adhering to production standards."
      ],
      tieredTasks: [
        {
          tier: "Foundation",
          description: `Construct the baseline architecture and pass verification unit tests for ${topic}.`,
          deliverable: "Documented source files and automated verification test runner logs.",
          estimatedMinutes: 60
        },
        {
          tier: "Application",
          description: `Deploy a stress-testing harness with simulated boundary constraints and variable load conditions.`,
          deliverable: "Benchmark data tables and comparative runtime performance curves.",
          estimatedMinutes: 120
        },
        {
          tier: "Mastery & Innovation",
          description: "Analyze asymptotic bottlenecks and present a formal proof or architectural mitigation memorandum.",
          deliverable: "Technical report (max 2 pages) detailing design trade-offs and edge-case proofs.",
          estimatedMinutes: 90
        }
      ],
      rubric: [
        {
          criterion: "Technical Rigor & Mathematical Precision",
          weight: 40,
          exemplary: "Flawlessly addresses boundary constraints, handles edge cases, zero unhandled runtime exceptions.",
          proficient: "Solves standard problem scenarios; minor oversights on extreme boundary states.",
          developing: "Fundamental conceptual errors or fragile implementation logic."
        },
        {
          criterion: "Empirical Analysis & Benchmarking",
          weight: 35,
          exemplary: "Quantitative graphs mapped cleanly against theoretical bounds with nuanced insight into trade-offs.",
          proficient: "Includes benchmark tables, but analysis lacks depth on architectural bottlenecks.",
          developing: "Superficial observations lacking quantitative empirical support."
        },
        {
          criterion: "Engineering Craft & Clarity",
          weight: 25,
          exemplary: "Exemplary structure, strict typing, complete docstrings, and a 1-step reproduction workflow.",
          proficient: "Clean and readable code; documentation requires minimal clarification.",
          developing: "Unstructured implementation with missing setup documentation."
        }
      ],
      submissionGuidelines: [
        "Submit repository link (GitHub) with automated test configuration.",
        "Include the formal technical analysis write-up as a PDF.",
        "Ensure all reproducible scripts execute cleanly from a fresh container."
      ],
      teacherKeyInsights: "Pay close attention to how students structure their boundary-condition unit tests—many only verify happy-path inputs and miss zero or infinity limits."
    });
  }
});

// 5. ADAPTIVE STUDY PLANNER
app.post("/api/planner/generate", async (req, res) => {
  const { goalName = "Midterm Mastery", daysCount = 7, dailyHours = 3, subjects = ["Calculus", "Data Structures", "Physics"], weakAreas = "Integration by parts, Recursion trees" } = req.body || {};
  try {

    if (!process.env.GEMINI_API_KEY) {
      const schedule = Array.from({ length: Math.min(daysCount, 7) }, (_, i) => {
        const dayIdx = i + 1;
        return {
          dayNumber: dayIdx,
          dayName: `Day ${dayIdx} (${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7]})`,
          focusTheme: dayIdx % 2 === 1 ? "Foundational Weak Area Remediation" : "High-Intensity Practice & Simulation",
          dailyGoal: `Master 3 core mechanisms and complete 12 timed practice problems`,
          tasks: [
            {
              id: `t-${dayIdx}-1`,
              title: `Concept Deconstruction: ${subjects[0] || 'Core Subject'}`,
              subject: subjects[0] || 'General',
              durationMinutes: 45,
              priority: 'High',
              technique: 'Active Recall',
              completed: false,
            },
            {
              id: `t-${dayIdx}-2`,
              title: `Targeted Problem Drilling (${weakAreas.split(',')[0] || 'Key Weak Area'})`,
              subject: subjects[0] || 'General',
              durationMinutes: 60,
              priority: 'High',
              technique: 'Practice Problems',
              completed: false,
            },
            {
              id: `t-${dayIdx}-3`,
              title: `Interleaved Review: ${subjects[1] || subjects[0]}`,
              subject: subjects[1] || subjects[0],
              durationMinutes: 45,
              priority: 'Medium',
              technique: 'Spaced Review',
              completed: false,
            }
          ]
        };
      });

      return res.json({
        id: `plan-${Date.now()}`,
        goalName,
        targetDate: "Target: Upcoming Exam",
        totalDays: daysCount,
        dailyHoursAvailable: dailyHours,
        subjects: subjects.map((s: string) => ({ name: s, targetScore: "92%+", priority: "High" })),
        schedule,
        overallStrategy: "Utilizes Cognitive Science Spaced Repetition + Interleaved Practice: alternating heavy problem-solving sessions with timed micro-quizzes to eliminate the illusion of explanatory competence."
      });
    }

    const systemPrompt = `You are a Cognitive Learning Scientist & Academic Time Architect. Design an adaptive study plan for a student preparing for "${goalName}".
Incorporate active recall, spaced repetition, interleaved problem sets, and deliberate practice on reported weak areas.`;

    const { text } = await generateGeminiContent({
      contents: `Create a ${daysCount}-day study schedule with ${dailyHours} hours per day for subjects: ${JSON.stringify(subjects)}. Weak areas to emphasize: "${weakAreas}".`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStrategy: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayName: { type: Type.STRING },
                  focusTheme: { type: Type.STRING },
                  dailyGoal: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        priority: { type: Type.STRING },
                        technique: { type: Type.STRING },
                      },
                      required: ["title", "subject", "durationMinutes", "priority", "technique"],
                    },
                  },
                },
                required: ["dayNumber", "dayName", "focusTheme", "dailyGoal", "tasks"],
              },
            },
          },
          required: ["overallStrategy", "schedule"],
        },
    });

    const parsed = JSON.parse(text || "{}");
    const scheduleWithIds = (parsed.schedule || []).map((day: any) => ({
      ...day,
      tasks: (day.tasks || []).map((t: any, idx: number) => ({
        ...t,
        id: `task-${day.dayNumber}-${idx}-${Date.now()}`,
        completed: false,
      })),
    }));

    res.json({
      id: `plan-${Date.now()}`,
      goalName,
      targetDate: "Target Schedule",
      totalDays: daysCount,
      dailyHoursAvailable: dailyHours,
      subjects: subjects.map((s: string) => ({ name: s, targetScore: "Target: Mastery", priority: "High" })),
      schedule: scheduleWithIds,
      overallStrategy: parsed.overallStrategy,
    });
  } catch (error: any) {
    console.warn("Study planner upstream warning, using resilient fallback:", error.message);
    const schedule = Array.from({ length: Math.min(daysCount, 7) }, (_, i) => {
      const dayIdx = i + 1;
      return {
        dayNumber: dayIdx,
        dayName: `Day ${dayIdx} (${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7]})`,
        focusTheme: dayIdx % 2 === 1 ? "Foundational Weak Area Remediation" : "High-Intensity Practice & Simulation",
        dailyGoal: `Master 3 core mechanisms and complete active recall problem drilling`,
        tasks: [
          {
            id: `t-${dayIdx}-1-${Date.now()}`,
            title: `Concept Deconstruction: ${subjects[0] || 'Core Theory'}`,
            subject: subjects[0] || 'General Theory',
            durationMinutes: 45,
            priority: 'High',
            technique: 'Active Recall',
            completed: false,
          },
          {
            id: `t-${dayIdx}-2-${Date.now()}`,
            title: `Targeted Problem Drilling: ${(weakAreas && weakAreas.split(',')[0]) || 'Key Weak Area'}`,
            subject: subjects[0] || 'Problem Solving',
            durationMinutes: 60,
            priority: 'High',
            technique: 'Practice Problems',
            completed: false,
          },
          {
            id: `t-${dayIdx}-3-${Date.now()}`,
            title: `Interleaved Spaced Review: ${subjects[1] || subjects[0] || 'Synthesis'}`,
            subject: subjects[1] || subjects[0] || 'Review',
            durationMinutes: 45,
            priority: 'Medium',
            technique: 'Spaced Review',
            completed: false,
          }
        ]
      };
    });

    res.json({
      id: `plan-${Date.now()}`,
      goalName,
      targetDate: "Target: Upcoming Exam",
      totalDays: daysCount,
      dailyHoursAvailable: dailyHours,
      subjects: subjects.map((s: string) => ({ name: s, targetScore: "92%+", priority: "High" })),
      schedule,
      overallStrategy: "Utilizes Cognitive Science Spaced Repetition + Interleaved Practice: alternating heavy problem-solving sessions with timed micro-quizzes to eliminate the illusion of explanatory competence."
    });
  }
});

// 6. CAREER GUIDANCE & PATHWAY ARCHITECT
app.post("/api/career/pathway", async (req, res) => {
  const { dreamRole = "AI / Machine Learning Engineer", currentDegreeOrYear = "3rd Year Computer Science", existingSkills = "Python, Linear Algebra, basic PyTorch" } = req.body || {};
  try {

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        targetRole: dreamRole,
        industryDemand: "Very High",
        averageStartingSalary: "$120,000 - $165,000 / year",
        roleSummary: `Designs, deploys, and optimizes scalable neural architectures, LLM inference pipelines, and production data infrastructures.`,
        keySkills: {
          technical: [
            { name: "PyTorch & Deep Learning Foundations", proficiencyTarget: "Advanced - Custom Autograd & Distributed Training" },
            { name: "Transformer & LLM Architectures", proficiencyTarget: "Proficient - LoRA Fine-Tuning & Quantization" },
            { name: "Vector Databases & RAG Pipelines", proficiencyTarget: "Proficient - HNSW, Hybrid Sparse/Dense Search" },
            { name: "MLOps & Low-Latency Serving", proficiencyTarget: "Intermediate - vLLM, TensorRT-LLM, Docker/K8s" }
          ],
          soft: [
            { name: "Scientific Communication", importance: "Translating loss dynamics into product impact for stakeholders" },
            { name: "Research Literature Parsing", importance: "Evaluating arXiv preprints and implementing novel algorithms quickly" }
          ]
        },
        learningRoadmap: [
          {
            phase: "Phase 1: Deep Foundations & Tensor Math",
            timeframe: "Weeks 1 - 8",
            title: "Core Mathematics & Custom Implementations",
            objectives: [
              "Implement backpropagation from scratch with NumPy arrays.",
              "Deep dive into attention mechanisms (scaled dot-product, multi-head attention).",
              "Profile matrix multiplication bottlenecks on GPU hardware."
            ],
            portfolioProject: {
              title: "From-Scratch Micro-Transformer",
              description: "A minimal, clean GPT-style decoder-only transformer trained on TinyShakespeare with interactive inference.",
              techStackOrTools: ["Python", "PyTorch", "Weights & Biases", "CUDA"]
            }
          },
          {
            phase: "Phase 2: Modern Generative Systems & RAG",
            timeframe: "Weeks 9 - 18",
            title: "Applied LLM Engineering & Retrieval",
            objectives: [
              "Build multi-stage retrieval systems with rerankers and chunking optimizations.",
              "Fine-tune open-weight models using QLoRA with synthetic reasoning datasets.",
              "Benchmark latency and cost trade-offs across quantized models."
            ],
            portfolioProject: {
              title: "Enterprise Multi-Agent Knowledge Engine",
              description: "Production-ready agentic RAG application with query routing, self-correction loops, and structured evaluation metrics.",
              techStackOrTools: ["LangGraph", "ChromaDB/Pinecone", "FastAPI", "Docker"]
            }
          },
          {
            phase: "Phase 3: Production MLOps & Capstone",
            timeframe: "Weeks 19 - 28",
            title: "High-Throughput Serving & Real-World Impact",
            objectives: [
              "Deploy models with vLLM and continuous batching on cloud GPUs.",
              "Implement automated drift monitoring and evaluation harnesses.",
              "Publish open-source benchmark documentation and technical writeups."
            ],
            portfolioProject: {
              title: "Low-Latency Autonomous Research Synthesizer",
              description: "End-to-end full stack application running real-time paper scraping, multi-modal synthesis, and audio podcast generation.",
              techStackOrTools: ["Cloud Run", "Gemini API", "Next.js", "Redis"]
            }
          }
        ],
        topCertifications: [
          "DeepLearning.AI Deep Learning Specialization",
          "Google Cloud Professional Machine Learning Engineer",
          "NVIDIA Deep Learning Institute Certification"
        ],
        recommendedRealWorldProjects: [
          "Contribute a bug fix or feature to an open-source library like HuggingFace Transformers or vLLM.",
          "Write a technical blog post explaining a non-obvious paper concept with interactive visualizations.",
          "Participate in a Kaggle NLP or Code Generation challenge."
        ],
        industryOutlook2026: "Surging demand for engineers who understand both deep algorithmic fundamentals and production-grade serving architectures over pure prompt engineering."
      });
    }

    const systemPrompt = `You are a Silicon Valley Chief Talent Officer & Senior Tech Career Strategist.
Create an exhaustive, career roadmap for a student aspiring to become "${dreamRole}".
Analyze technical skills, soft skills, structured 3-phase milestones, portfolio capstone projects with tech stacks, top certifications, and realistic 2026 market outlook.`;

    const { text } = await generateGeminiContent({
      contents: `Generate a career guidance roadmap for target role: "${dreamRole}", current status: "${currentDegreeOrYear}", existing skills: "${existingSkills}".`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetRole: { type: Type.STRING },
            industryDemand: { type: Type.STRING },
            averageStartingSalary: { type: Type.STRING },
            roleSummary: { type: Type.STRING },
            keySkills: {
              type: Type.OBJECT,
              properties: {
                technical: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      proficiencyTarget: { type: Type.STRING },
                    },
                    required: ["name", "proficiencyTarget"],
                  },
                },
                soft: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      importance: { type: Type.STRING },
                    },
                    required: ["name", "importance"],
                  },
                },
              },
              required: ["technical", "soft"],
            },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  title: { type: Type.STRING },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  portfolioProject: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      techStackOrTools: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["title", "description", "techStackOrTools"],
                  },
                },
                required: ["phase", "timeframe", "title", "objectives", "portfolioProject"],
              },
            },
            topCertifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedRealWorldProjects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            industryOutlook2026: { type: Type.STRING },
          },
          required: [
            "targetRole",
            "industryDemand",
            "averageStartingSalary",
            "roleSummary",
            "keySkills",
            "learningRoadmap",
            "topCertifications",
            "recommendedRealWorldProjects",
            "industryOutlook2026",
          ],
        },
    });

    const parsed = JSON.parse(text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Career guidance upstream warning, using resilient fallback:", error.message);
    res.json({
      targetRole: dreamRole,
      industryDemand: "Very High",
      averageStartingSalary: "$120,000 - $165,000 / year",
      roleSummary: `Designs, deploys, and optimizes scalable systems, high-throughput architectures, and production algorithms in ${dreamRole}.`,
      keySkills: {
        technical: [
          { name: "Foundational Systems & Core Algorithms", proficiencyTarget: "Advanced - Algorithmic Complexity, Memory Optimization" },
          { name: "Applied Frameworks & Toolchains", proficiencyTarget: "Proficient - Production Deployment & CI/CD Pipelines" },
          { name: "Data Architecture & Query Engines", proficiencyTarget: "Proficient - Distributed State & Low-Latency Retrieval" },
          { name: "Production Observability & Monitoring", proficiencyTarget: "Intermediate - Benchmark Metrics, Profiling & Reliability" }
        ],
        soft: [
          { name: "Empirical Problem Formulation", importance: "Formulating ambiguous business or scientific questions into rigorous mathematical hypotheses." },
          { name: "Cross-Functional Technical Synthesis", importance: "Communicating asymptotic constraints and system trade-offs to product leaders." }
        ]
      },
      learningRoadmap: [
        {
          phase: "Phase 1: First-Principles Foundations",
          timeframe: "Months 1 - 2",
          title: "Rigorous Theory & From-Scratch Systems",
          objectives: [
            "Deconstruct underlying mathematical and algorithmic primitives.",
            "Implement baseline kernels without relying on high-level abstractions.",
            "Profile hardware memory bottlenecks and asymptotic scaling."
          ],
          portfolioProject: {
            title: `From-Scratch ${dreamRole.slice(0, 25)} Core Engine`,
            description: "A minimal, highly performant engine implementing core domain algorithms with unit tests and benchmark telemetry.",
            techStackOrTools: ["Python", "TypeScript", "Docker", "Git"]
          }
        },
        {
          phase: "Phase 2: Modern Applied Toolchains & Scalability",
          timeframe: "Months 3 - 4",
          title: "Production Workflows & Systems Architecture",
          objectives: [
            "Build robust multi-stage pipelines with error recovery and validation checks.",
            "Implement high-throughput batching and asynchronous task schedulers.",
            "Benchmark latency-cost frontiers under varying load distributions."
          ],
          portfolioProject: {
            title: "Scalable Enterprise Domain Service",
            description: "Production-grade microservice handling continuous ingestion, distributed state caching, and live monitoring dashboards.",
            techStackOrTools: ["Cloud Run", "FastAPI", "PostgreSQL", "Redis"]
          }
        },
        {
          phase: "Phase 3: Production Delivery & Capstone Impact",
          timeframe: "Months 5 - 6",
          title: "End-to-End Capstone & Open-Source Artifacts",
          objectives: [
            "Deploy autonomous pipelines with continuous integration and automated grading/evaluation.",
            "Publish comprehensive technical documentation and reproducible benchmark reports.",
            "Open-source a reusable utility library or contribute upstream."
          ],
          portfolioProject: {
            title: "Autonomous Real-World Capstone Platform",
            description: "Full-stack application running live inference, automated evaluations, and interactive analytical visualizers.",
            techStackOrTools: ["React", "TypeScript", "Tailwind CSS", "Gemini 3.8 Flash"]
          }
        }
      ],
      topCertifications: [
        "Google Cloud Certified Professional Cloud Architect / Data Engineer",
        "DeepLearning.AI Advanced Systems Specialization",
        "Linux Foundation Certified Kubernetes Administrator"
      ],
      recommendedRealWorldProjects: [
        "Publish an open-source benchmarking tool on GitHub with CI test workflows.",
        "Author an interactive technical case study breaking down a complex systems trade-off.",
        "Participate in high-impact hackathons or competitive engineering challenges."
      ],
      industryOutlook2026: "Surging demand for engineers who understand both deep algorithmic fundamentals and production-grade serving architectures."
    });
  }
});

// ==========================================
// 7. Personalized Weakness Guide & Diagnostic Engine
// ==========================================
app.post("/api/guide/diagnose", async (req, res) => {
  const {
    subject = "Computer Science & AI",
    goalContext = "Upcoming Semester Exams & Concept Mastery",
    userReportedWeaknesses = "",
    academicLevel = "Undergraduate",
  } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        id: `guide-${Date.now()}`,
        subject,
        goalContext,
        overallDiagnosis: `Based on your diagnostic profile in ${subject}, your highest-yield recovery focus centers on foundational conceptual representations and boundary calculations. Remediating these specific cognitive blockers will quickly elevate your retention and exam performance.`,
        weakTopics: [
          {
            id: `diag-1-${Date.now()}`,
            topicName: userReportedWeaknesses ? `${userReportedWeaknesses.slice(0, 50)} Foundations` : `${subject}: State Space Invariants & Transitions`,
            subject,
            severity: "Critical Gap",
            masteryScore: 52,
            rootCause: "Over-reliance on rote formula memorization rather than constructing causal mental models of boundary transitions.",
            actionableSuggestions: [
              "Deconstruct the problem into edge conditions (e.g. n=0, n=1 or empty limits) before generalizing.",
              "Use active recall Feynman analogies to explain the underlying mechanism in plain English.",
              "Complete 3 targeted deliberate practice problems without looking at reference solutions."
            ],
            keyPitfallToAvoid: "Proceeding with mechanical calculations before verifying physical conservation or boundary axioms.",
            quickCheckQuestion: "What invariant property remains constant as you transition between successive states here?",
            recommendedStudyTime: "35 mins / day for 3 days",
            status: "Under Review"
          },
          {
            id: `diag-2-${Date.now()}`,
            topicName: `${subject}: Multistep Synthesis & Problem Formulation`,
            subject,
            severity: "Moderate Difficulty",
            masteryScore: 68,
            rootCause: "Difficulty determining which theoretical rule applies when multiple variables shift simultaneously.",
            actionableSuggestions: [
              "Formulate a decision-tree checklist before selecting a mathematical framework.",
              "Practice mixed-topic interleaved problem sets to avoid context-dependent cueing.",
              "Review error logs from previous quizzes to identify recurring distractor triggers."
            ],
            keyPitfallToAvoid: "Assuming standard textbook simplifications hold in non-ideal or multi-parameter scenarios.",
            quickCheckQuestion: "Can you state which governing assumption breaks down under extreme limits?",
            recommendedStudyTime: "25 mins / day for 2 days",
            status: "Practicing"
          }
        ],
        weeklyRecoveryRoadmap: [
          {
            dayOrPhase: "Phase 1: Diagnostic Deconstruction (Days 1-2)",
            focus: "Isolate root cognitive misconceptions and review first-principles axioms",
            actionItems: [
              "Engage in a 15-minute Socratic dialogue on StudyMate AI Tutor exploring the core concept.",
              "Draft a 1-page summary containing only axioms, units, and boundary limits."
            ],
            recommendedTechnique: "Socratic Method & First-Principles Reduction"
          },
          {
            dayOrPhase: "Phase 2: Deliberate Scaffolded Practice (Days 3-4)",
            focus: "Solve medium difficulty problems with progressive difficulty scaffolding",
            actionItems: [
              "Generate a 5-question adaptive quiz in StudyMate Quiz Studio focusing strictly on weak areas.",
              "Write out step-by-step rationales for each option rather than just picking answers."
            ],
            recommendedTechnique: "Interleaved Practice & Active Retrieval"
          },
          {
            dayOrPhase: "Phase 3: Timed Mastery Benchmark (Days 5-6)",
            focus: "Execute under realistic time constraints to verify automated fluency",
            actionItems: [
              "Complete a timed 20-minute simulation without notes.",
              "Audit missed questions and record cognitive traps in your Doubt Resolver history."
            ],
            recommendedTechnique: "Spaced Testing Effect & Error Pattern Analysis"
          }
        ],
        generatedAt: "Just now"
      });
    }

    const systemPrompt = `You are an elite Cognitive Learning Diagnostician & Academic Weakness Remediation Strategist in ${subject} (${academicLevel}).
When analyzing a student's reported difficulties for "${goalContext}", diagnose root cognitive blockers, differentiate between superficial calculation slips and fundamental conceptual gaps, and design high-yield, scientifically validated suggestions (spaced repetition, interleaved practice, Feynman intuitive analogies, mental models).`;

    const { text } = await generateGeminiContent({
      contents: `Subject: ${subject}
Academic Level: ${academicLevel}
Goal / Context: ${goalContext}
Reported Trouble Spots or Weaknesses: "${userReportedWeaknesses || 'General diagnostic scan across core curriculum'}"

Diagnose 3-4 specific weak topics with severity, estimated mastery score (30-80), root cause, actionable suggestions, key pitfall to avoid, quick check question, recommended study time, and a 3-phase weekly recovery roadmap.`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallDiagnosis: { type: Type.STRING },
          weakTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topicName: { type: Type.STRING },
                severity: { type: Type.STRING },
                masteryScore: { type: Type.INTEGER },
                rootCause: { type: Type.STRING },
                actionableSuggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyPitfallToAvoid: { type: Type.STRING },
                quickCheckQuestion: { type: Type.STRING },
                recommendedStudyTime: { type: Type.STRING },
              },
              required: [
                "topicName",
                "severity",
                "masteryScore",
                "rootCause",
                "actionableSuggestions",
                "keyPitfallToAvoid",
                "quickCheckQuestion",
                "recommendedStudyTime",
              ],
            },
          },
          weeklyRecoveryRoadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayOrPhase: { type: Type.STRING },
                focus: { type: Type.STRING },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedTechnique: { type: Type.STRING },
              },
              required: ["dayOrPhase", "focus", "actionItems", "recommendedTechnique"],
            },
          },
        },
        required: ["overallDiagnosis", "weakTopics", "weeklyRecoveryRoadmap"],
      },
    });

    const parsed = JSON.parse(text || "{}");
    const weakTopicsWithIds = (parsed.weakTopics || []).map((wt: any, idx: number) => ({
      ...wt,
      id: `wt-${idx + 1}-${Date.now()}`,
      subject,
      status: wt.masteryScore < 60 ? "Under Review" : wt.masteryScore < 75 ? "Practicing" : "Mastered",
    }));

    res.json({
      id: `guide-${Date.now()}`,
      subject,
      goalContext,
      overallDiagnosis: parsed.overallDiagnosis || "Comprehensive diagnostic scan complete.",
      weakTopics: weakTopicsWithIds,
      weeklyRecoveryRoadmap: parsed.weeklyRecoveryRoadmap || [],
      generatedAt: "Just now",
    });
  } catch (error: any) {
    console.warn("Personalized guide upstream warning, using resilient fallback:", error.message);
    res.json({
      id: `guide-${Date.now()}`,
      subject,
      goalContext,
      overallDiagnosis: `Based on your academic profile in ${subject}, your highest-yield recovery focus centers on foundational conceptual representations and boundary calculations. Tackling these specific friction points will quickly elevate your exam performance.`,
      weakTopics: [
        {
          id: `diag-1-${Date.now()}`,
          topicName: userReportedWeaknesses ? `${userReportedWeaknesses.slice(0, 50)} Foundations` : `${subject}: State Space Invariants & Transitions`,
          subject,
          severity: "Critical Gap",
          masteryScore: 52,
          rootCause: "Over-reliance on rote formula memorization rather than constructing causal mental models of boundary transitions.",
          actionableSuggestions: [
            "Deconstruct the problem into edge conditions (e.g. n=0, n=1 or empty limits) before general cases.",
            "Use active recall Feynman analogies to explain the underlying mechanism in plain English.",
            "Complete 3 targeted deliberate practice problems without looking at reference solutions."
          ],
          keyPitfallToAvoid: "Proceeding with algebraic calculations before verifying physical conservation or boundary axioms.",
          quickCheckQuestion: "What invariant property remains constant as you transition between successive states here?",
          recommendedStudyTime: "30 mins / day for 3 days",
          status: "Under Review"
        }
      ],
      weeklyRecoveryRoadmap: [
        {
          dayOrPhase: "Phase 1: Diagnostic Deconstruction (Days 1-2)",
          focus: "Isolate root cognitive misconceptions and review first-principles axioms",
          actionItems: [
            "Engage in a 15-minute Socratic dialogue on StudyMate AI Tutor exploring the core concept.",
            "Draft a 1-page summary containing only axioms, units, and boundary limits."
          ],
          recommendedTechnique: "Socratic Method & First-Principles Reduction"
        }
      ],
      generatedAt: "Just now"
    });
  }
});

// 8. FACULTY / ORGANIZER OFFLINE REMEDIAL PLAN GENERATOR
app.post("/api/faculty/remedial-plan", async (req, res) => {
  const { 
    topic = "Dynamic Programming", 
    subject = "Computer Science & AI", 
    organization = "Apex Coaching Institute",
    targetStudentsCount = 5,
    durationMinutes = 45 
  } = req.body || {};

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        id: `plan-${Date.now()}`,
        topic,
        subject,
        organization,
        targetStudentsCount,
        estimatedDurationMinutes: durationMinutes,
        learningObjectives: [
          `Demystify the root cognitive friction point in ${topic} using interactive whiteboard mental models.`,
          `Address the 2 most common pitfalls identified across student quiz submissions.`,
          `Guide students through an offline board derivation before having them complete a paired challenge.`
        ],
        sessionRoadmap: [
          {
            timeSlot: "00:00 - 00:10 (10 mins)",
            stageTitle: "First-Principles Conceptual Deconstruction",
            pedagogyMethod: "Socratic Whiteboard Framing",
            instructionsForFaculty: `Begin by sketching a concrete real-world physical scenario on the board. Do NOT write formal equations yet. Ask the cohort: "If you had to make this decision by hand without a computer, what would you keep track of first?"`,
            whiteboardNotes: [
              `Draw the initial state box and identify input constraints.`,
              `Highlight the boundary condition (zero/base case) in red marker.`,
              `Write down the single invariant rule governing the transition.`
            ]
          },
          {
            timeSlot: "00:10 - 00:25 (15 mins)",
            stageTitle: "Interactive Cohort Board Derivation",
            pedagogyMethod: "Guided Socratic Step-by-Step",
            instructionsForFaculty: `Walk through one complete example from your batch quiz mistakes. Invite a struggling student to supply the next step, correcting signs and boundary definitions collaboratively.`,
            whiteboardNotes: [
              `Step 1: State definition (what does index i actually represent?).`,
              `Step 2: Recurrence equation with arrows showing dependency flow.`,
              `Step 3: Verification of edge cases at limits.`
            ]
          },
          {
            timeSlot: "00:25 - 00:40 (15 mins)",
            stageTitle: "Offline Paired Worksheet & Pitfall Elimination",
            pedagogyMethod: "Peer Instruction & TA Office Hour Style",
            instructionsForFaculty: `Distribute the offline handout challenge. Pair students who struggled on recent quizzes with peers who mastered the concept. Circulate through the classroom checking for negative sign and boundary indexing errors.`,
            whiteboardNotes: [
              `Common Pitfall: Confusing memory index with actual value.`,
              `Check: Does your formula work when N = 1?`
            ]
          },
          {
            timeSlot: "00:40 - 00:45 (5 mins)",
            stageTitle: "Synthesis & Student Action Contract",
            pedagogyMethod: "Actionable Summary Wrap-up",
            instructionsForFaculty: `Summarize the 1 golden rule of thumb. Assign each student to log into StudyMate this evening to solve the micro-quiz on ${topic} to verify offline retention.`,
            whiteboardNotes: [
              `Golden Takeaway: Always write out base cases before loops.`,
              `Tonight's Mission: Retake the 5-question StudyMate diagnostic quiz.`
            ]
          }
        ],
        keyMisconceptionsToAddress: [
          `Students jumping to calculation before drawing state boundaries.`,
          `Rote memorization of final formulas without understanding directional dependencies.`,
          `Forgetting to check the zero/empty input boundary case.`
        ],
        offlineHandoutChallenge: {
          problemStatement: `Analyze a system where input size N = 4 and capacity W = 7. Trace the step-by-step transition table by hand on paper without using a calculator.`,
          guidingQuestions: [
            `What subproblem must be evaluated first?`,
            `Which previously computed value provides the optimal substructure?`
          ],
          solutionKey: `Optimal solution achieved at index 3 with cumulative value 22. Boundary checked at W=0.`
        },
        generatedAt: "Just now"
      });
    }

    const systemPrompt = `You are a master academic director and pedagogical coach for faculty at elite institutions (${organization}).
Create an actionable, high-impact Offline Remedial Lecture & Mentorship Plan for faculty to conduct a ${durationMinutes}-minute physical classroom session on "${topic}" (${subject}).
Focus specifically on helping students who are struggling with this concept on quizzes and doubts.
Provide clear time allocations, whiteboard sketches to draw, exact questions to ask students, student misconceptions to destroy, and an offline handout challenge with solution key.`;

    const { text } = await generateGeminiContent({
      contents: `Generate an offline faculty remedial lesson plan for topic: "${topic}", subject: "${subject}", organization: "${organization}", students: ${targetStudentsCount}, duration: ${durationMinutes} minutes.`,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          learningObjectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          sessionRoadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeSlot: { type: Type.STRING },
                stageTitle: { type: Type.STRING },
                pedagogyMethod: { type: Type.STRING },
                instructionsForFaculty: { type: Type.STRING },
                whiteboardNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["timeSlot", "stageTitle", "pedagogyMethod", "instructionsForFaculty", "whiteboardNotes"],
            },
          },
          keyMisconceptionsToAddress: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          offlineHandoutChallenge: {
            type: Type.OBJECT,
            properties: {
              problemStatement: { type: Type.STRING },
              guidingQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              solutionKey: { type: Type.STRING },
            },
            required: ["problemStatement", "guidingQuestions", "solutionKey"],
          },
        },
        required: ["learningObjectives", "sessionRoadmap", "keyMisconceptionsToAddress", "offlineHandoutChallenge"],
      },
    });

    const parsed = JSON.parse(text || "{}");
    res.json({
      id: `plan-${Date.now()}`,
      topic,
      subject,
      organization,
      targetStudentsCount,
      estimatedDurationMinutes: durationMinutes,
      ...parsed,
      generatedAt: "Just now"
    });
  } catch (error: any) {
    console.warn("Faculty plan generation upstream warning, using resilient fallback:", error.message);
    res.json({
      id: `plan-${Date.now()}`,
      topic,
      subject,
      organization,
      targetStudentsCount,
      estimatedDurationMinutes: durationMinutes,
      learningObjectives: [
        `Demystify the root cognitive friction point in ${topic} using interactive whiteboard mental models.`,
        `Address the 2 most common pitfalls identified across student quiz submissions.`,
        `Guide students through an offline board derivation before having them complete a paired challenge.`
      ],
      sessionRoadmap: [
        {
          timeSlot: "00:00 - 00:10 (10 mins)",
          stageTitle: "First-Principles Conceptual Deconstruction",
          pedagogyMethod: "Socratic Whiteboard Framing",
          instructionsForFaculty: `Begin by sketching a concrete real-world physical scenario on the board. Do NOT write formal equations yet. Ask the cohort: "If you had to make this decision by hand without a computer, what would you keep track of first?"`,
          whiteboardNotes: [
            `Draw the initial state box and identify input constraints.`,
            `Highlight the boundary condition (zero/base case) in red marker.`,
            `Write down the single invariant rule governing the transition.`
          ]
        },
        {
          timeSlot: "00:10 - 00:25 (15 mins)",
          stageTitle: "Interactive Cohort Board Derivation",
          pedagogyMethod: "Guided Socratic Step-by-Step",
          instructionsForFaculty: `Walk through one complete example from your batch quiz mistakes. Invite a struggling student to supply the next step, correcting signs and boundary definitions collaboratively.`,
          whiteboardNotes: [
            `Step 1: State definition (what does index i actually represent?).`,
            `Step 2: Recurrence equation with arrows showing dependency flow.`,
            `Step 3: Verification of edge cases at limits.`
          ]
        },
        {
          timeSlot: "00:25 - 00:40 (15 mins)",
          stageTitle: "Offline Paired Worksheet & Pitfall Elimination",
          pedagogyMethod: "Peer Instruction & TA Office Hour Style",
          instructionsForFaculty: `Distribute the offline handout challenge. Pair students who struggled on recent quizzes with peers who mastered the concept. Circulate through the classroom checking for negative sign and boundary indexing errors.`,
          whiteboardNotes: [
            `Common Pitfall: Confusing memory index with actual value.`,
            `Check: Does your formula work when N = 1?`
          ]
        },
        {
          timeSlot: "00:40 - 00:45 (5 mins)",
          stageTitle: "Synthesis & Student Action Contract",
          pedagogyMethod: "Actionable Summary Wrap-up",
          instructionsForFaculty: `Summarize the 1 golden rule of thumb. Assign each student to log into StudyMate this evening to solve the micro-quiz on ${topic} to verify offline retention.`,
          whiteboardNotes: [
            `Golden Takeaway: Always write out base cases before loops.`,
            `Tonight's Mission: Retake the 5-question StudyMate diagnostic quiz.`
          ]
        }
      ],
      keyMisconceptionsToAddress: [
        `Students jumping to calculation before drawing state boundaries.`,
        `Rote memorization of final formulas without understanding directional dependencies.`,
        `Forgetting to check the zero/empty input boundary case.`
      ],
      offlineHandoutChallenge: {
        problemStatement: `Analyze a system where input size N = 4 and capacity W = 7. Trace the step-by-step transition table by hand on paper without using a calculator.`,
        guidingQuestions: [
          `What subproblem must be evaluated first?`,
          `Which previously computed value provides the optimal substructure?`
        ],
        solutionKey: `Optimal solution achieved at index 3 with cumulative value 22. Boundary checked at W=0.`
      },
      generatedAt: "Just now"
    });
  }
});

// Vite & Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyMate AI Academic Hub server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
