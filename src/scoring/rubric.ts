export const RUBRIC_VERSION = "0.1.0";

export interface AxisScore {
  axis: string;
  score: number;
  confidence: "high" | "medium" | "low";
  suggestion: string;
  evidence: string;
}

export interface SessionScore {
  rubricVersion: string;
  overallScore: number;
  yeggeLevel: number;
  axes: AxisScore[];
  summary: string;
  topSuggestions: string[];
}

export const SCORING_AXES = [
  {
    key: "task_decomposition",
    name: "Task Decomposition",
    description: "Does the human break large tasks into manageable steps before asking the AI to implement?",
    antiPattern: "Paste-and-pray: dumping entire codebases or massive requirements in a single message",
    signals: {
      high: "Explicit step-by-step breakdown, numbered tasks, incremental requests",
      low: "Single massive request, no structure, 'just do everything'",
    },
  },
  {
    key: "context_discipline",
    name: "Context Discipline",
    description: "Does the human scope context appropriately - providing what's needed without flooding?",
    antiPattern: "Context dumping: pasting >500 lines, entire files, or irrelevant code",
    signals: {
      high: "Targeted context, references to specific lines/functions, progressive disclosure",
      low: "Pasting entire files, including unrelated code, no filtering",
    },
  },
  {
    key: "verification_behaviour",
    name: "Verification Behaviour",
    description: "Does the human define pass/fail criteria before implementation and verify after?",
    antiPattern: "No verification criteria given; accepting output without testing",
    signals: {
      high: "Defines success criteria upfront, asks for tests, verifies output matches spec",
      low: "No mention of testing, accepts all output at face value, no verification step",
    },
  },
  {
    key: "evidence_seeking",
    name: "Evidence-Seeking",
    description: "Does the human demand proof - tests, screenshots, logs, or concrete examples?",
    antiPattern: "Accepting assertions without evidence; not asking 'show me it works'",
    signals: {
      high: "Asks for test output, requests proof, challenges claims, demands examples",
      low: "Accepts 'it should work' without verification, never asks for proof",
    },
  },
  {
    key: "plan_before_code",
    name: "Plan-Before-Code",
    description: "Does the human plan the approach before jumping into implementation?",
    antiPattern: "Skipping plan phase on multi-file changes; immediate 'just code it'",
    signals: {
      high: "Discusses approach first, reviews plan before implementation, iterates on design",
      low: "Jumps straight to 'write the code', no discussion of approach",
    },
    confidence_note: "Medium confidence - planning may happen outside the transcript",
  },
  {
    key: "trust_calibration",
    name: "Trust Calibration",
    description: "Does the human critically review AI output rather than rubber-stamping?",
    antiPattern: "Black box blindness: accepting everything without review or question",
    signals: {
      high: "Questions AI choices, catches errors, pushes back on suggestions, reviews diffs",
      low: "Accepts everything, never questions, no pushback, rubber-stamps all changes",
    },
    confidence_note: "Medium confidence - trust may be calibrated but not visible in transcript",
  },
  {
    key: "session_hygiene",
    name: "Session Hygiene",
    description: "Does the human manage context window effectively - starting fresh when needed?",
    antiPattern: "Context neglect: never starting fresh sessions, running into degraded performance",
    signals: {
      high: "Fresh sessions for new topics, clear context boundaries, uses /clear or new sessions",
      low: "Endless sessions, topic drift, context window exhaustion symptoms",
    },
  },
  {
    key: "yegge_level",
    name: "Yegge Level",
    description: "What level of AI adoption does the observed behaviour indicate?",
    antiPattern: "N/A - this is a classification, not a behaviour to improve",
    signals: {
      high: "L5+ Director/AI-first behaviour: reviewing, delegating, orchestrating",
      low: "L1-L3: No AI, occasional use, or ad-hoc unstructured usage",
    },
  },
] as const;

export const SCORING_PROMPT = `You are an expert AI coding coach. You analyze transcripts of human-AI coding sessions and score the HUMAN's interaction quality across 8 axes.

## Scoring Rubric

For each axis, score 1-10 where:
- 1-3: Anti-patterns dominate. The human shows no awareness of the skill.
- 4-6: Mixed. Some good habits but inconsistent or with notable gaps.
- 7-9: Strong. Consistent good practices with minor room for improvement.
- 10: Exceptional. Could be used as a teaching example.

## Axes

${SCORING_AXES.map(
  (a) => `### ${a.name} (${a.key})
${a.description}
Anti-pattern: ${a.antiPattern}
High signal: ${a.signals.high}
Low signal: ${a.signals.low}
${"confidence_note" in a ? `Note: ${a.confidence_note}` : ""}`
).join("\n\n")}

## Yegge Level Classification

Map the observed behaviour to Steve Yegge's 8-level AI adoption ladder:
- L1: No AI usage
- L2: Occasional (tab completion, simple Q&A)
- L3: Regular but ad-hoc
- L4: Systematic (structured prompting, consistent workflows)
- L5: Director (reviewer/delegator, defines acceptance criteria)
- L6: AI-first (designs with AI, verifies after)
- L7: Agentic (multi-step autonomous delegation)
- L8: Orchestrator (meta-prompting, tool composition)

## Important Instructions

- Score the HUMAN's behaviour, not the AI's quality
- Base scores on observable evidence in the transcript
- If you cannot observe a behaviour (e.g., verification happened outside the transcript), give a 5 with medium confidence
- Provide ONE specific, actionable suggestion per axis
- The summary should highlight the single biggest improvement opportunity
- Top suggestions should be the 3 most impactful changes the human could make

Respond with valid JSON matching the schema provided.`;
