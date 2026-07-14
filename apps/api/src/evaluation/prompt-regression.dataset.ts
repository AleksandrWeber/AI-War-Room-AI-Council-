import {
  agentOutputSchema,
  ideaBriefSchema,
  masterPromptSchema,
  moderatorSynthesisSchema,
  todoListSchema,
  triageResultSchema,
} from '@ai-war-room/schemas'
import type { z } from 'zod'
import type { LlmMessage } from '../llm/llm.types.js'
import { agentPrompts } from '../prompts/agent.prompts.js'
import { artifactPrompts } from '../prompts/artifact.prompts.js'
import { moderatorPromptV1 } from '../prompts/moderator.prompts.js'
import { triagePromptV1 } from '../prompts/triage.prompts.js'

export type PromptRegressionCase = {
  caseId: string
  taskName: string
  expectedPromptVersion: string
  schema: z.ZodType
  messages: LlmMessage[]
  minimumClarityScore: number
  minimumUsefulnessScore: number
}

const draftRun = {
  runId: 'run_eval',
  workspaceId: 'workspace_eval',
  status: 'draft',
  idea: {
    rawIdea:
      'Build an AI War Room that turns rough product ideas into reviewed PRDs and Cursor-ready implementation prompts.',
    targetAudience: 'Technical founders',
    strategicGoals: ['Validate product ideas faster'],
    technicalPreferences: ['TypeScript', 'PostgreSQL'],
    constraints: ['MVP first'],
    references: [],
  },
  shieldScan: {
    scanId: 'scan_eval',
    status: 'clear',
    maxSeverity: 'none',
    findings: [],
  },
  triage: {
    domain: 'software',
    subdomain: 'SaaS planning',
    complexity: 'medium',
    marketConfidence: 'medium',
    securitySensitivity: 'medium',
    recommendedRunMode: 'standard',
    recommendedAgents: ['product_manager', 'critic', 'moderator'],
    estimatedDurationSeconds: 60,
    estimatedMaxCostUsd: 0.5,
    reasoningSummary: 'Evaluation fixture triage.',
  },
  selectedAgents: ['product_manager', 'critic', 'moderator'],
  estimatedDurationSeconds: 60,
  estimatedMaxCostUsd: 0.5,
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
}

const agentOutput = {
  runId: 'run_eval',
  agentRole: 'product_manager',
  output: {
    summary:
      'Product Manager produced a full breakdown for technical founders covering positioning, MVP scope, idea gaps, additions, must-have features, and build notes so the idea can become an implementation-ready web app brief.',
    strengths: ['Structured review path'],
    weaknesses: ['Needs validation data'],
    risks: ['Generated artifacts may overstate confidence'],
    recommendations: [
      'Keep human review before artifact generation',
      'Expand the idea with screens and acceptance criteria',
    ],
    ideaGaps: [
      'Primary journeys are incomplete',
      'MVP prioritization needs more detail',
    ],
    additions: [
      'Add an MVP feature checklist',
      'Add screen inventory and non-goals',
    ],
    mustHaveFeatures: [
      'Idea submission flow',
      'Artifact viewer with copyable Development Prompt',
    ],
    buildNotes: [
      'Start with schemas and primary screens',
      'Break work into Cursor-sized todos with acceptance checks',
    ],
    roleSpecificInsights: {},
  },
  validationStatus: 'valid',
  promptVersion: 'agents/product_manager/v2',
  modelProvider: 'mock',
  modelName: 'mock-json-v1',
  inputTokens: 10,
  outputTokens: 10,
  estimatedCostUsd: 0,
  completedAt: '2026-07-04T00:00:00.000Z',
}

const moderatorSynthesis = {
  executivePositioning:
    'AI War Room creates reviewed planning artifacts through a structured council workflow.',
  targetUsers: ['Technical founders'],
  coreProblem: 'Founders need a reliable path from rough idea to build-ready plan.',
  proposedSolution:
    'Use Shield, triage, specialist agents, moderator synthesis, and schema-validated artifacts.',
  mvpScope: ['Idea submission', 'Human review', 'Artifact generation'],
  nonGoals: ['Open-ended chat'],
  keyDecisions: ['Keep agents isolated'],
  risks: ['Artifact confidence can exceed evidence'],
  openQuestions: ['Which export format ships first?'],
  additionsToIdea: [
    'Add MVP checklist and non-goals',
    'Add screen inventory and acceptance criteria',
  ],
  mvpBuildSequence: [
    'Clarify gaps and additions',
    'Lock idea brief with founder',
    'Generate master prompt and todo list',
    'Implement web app in todo order',
  ],
  artifactGenerationBrief: {
    promptVersion: 'moderator/v2',
  },
}

const approvedIdeaBrief = {
  summaryForUser: 'Expanded idea brief for AI War Room planning.',
  expandedIdea: 'Build a structured AI council that produces an editable idea, then a master prompt and todos.',
  analysis: 'Accept the isolated agent model; apply clearer MVP checklist before coding.',
  acceptRecommendations: ['Keep Shield + human review', 'Keep schema validation'],
  applyRecommendations: ['Add screen inventory', 'Add AI/tool rationale'],
  toolsToUse: [
    { name: 'Vite + React + TypeScript', why: 'Web UI', required: true },
    { name: 'NestJS', why: 'API', required: true },
  ],
  aiChoices: [
    {
      name: 'OpenRouter GPT-class',
      role: 'Planning',
      why: 'Structured JSON and markdown',
    },
  ],
  openQuestions: ['Which export ships first?'],
}

function createMessages(system: string, userTemplate: string, payload: unknown) {
  return [
    {
      role: 'system' as const,
      content: system,
    },
    {
      role: 'user' as const,
      content: `${userTemplate}${JSON.stringify(payload)}`,
    },
  ]
}

export const promptRegressionDataset: PromptRegressionCase[] = [
  {
    caseId: 'triage-standard-saas',
    taskName: triagePromptV1.version,
    expectedPromptVersion: 'triage/v1',
    schema: triageResultSchema,
    messages: createMessages(triagePromptV1.system, triagePromptV1.userTemplate, {
      idea: draftRun.idea,
      shieldStatus: 'clear',
      shieldMaxSeverity: 'none',
      shieldFindingCategories: [],
    }),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'agent-product-manager',
    taskName: agentPrompts.product_manager.version,
    expectedPromptVersion: 'agents/product_manager/v2',
    schema: agentOutputSchema,
    messages: createMessages(
      agentPrompts.product_manager.system,
      agentPrompts.product_manager.userTemplate,
      {
        draftRun,
        role: 'product_manager',
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'moderator-synthesis',
    taskName: moderatorPromptV1.version,
    expectedPromptVersion: 'moderator/v2',
    schema: moderatorSynthesisSchema,
    messages: createMessages(
      moderatorPromptV1.system,
      moderatorPromptV1.userTemplate,
      {
        draftRun,
        approvedTriage: draftRun.triage,
        agentOutputs: [agentOutput],
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'artifact-idea-brief',
    taskName: artifactPrompts.idea_brief.version,
    expectedPromptVersion: 'artifacts/idea_brief/v1',
    schema: ideaBriefSchema,
    messages: createMessages(
      artifactPrompts.idea_brief.system,
      artifactPrompts.idea_brief.userTemplate,
      {
        draftRun,
        moderatorSynthesis,
        agentOutputs: [agentOutput],
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'artifact-master-prompt',
    taskName: artifactPrompts.master_prompt.version,
    expectedPromptVersion: 'artifacts/master_prompt/v1',
    schema: masterPromptSchema,
    messages: createMessages(
      artifactPrompts.master_prompt.system,
      artifactPrompts.master_prompt.userTemplate,
      {
        draftRun,
        approvedIdeaBrief,
        targetTool: 'cursor',
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'artifact-todo-list',
    taskName: artifactPrompts.todo_list.version,
    expectedPromptVersion: 'artifacts/todo_list/v1',
    schema: todoListSchema,
    messages: createMessages(
      artifactPrompts.todo_list.system,
      artifactPrompts.todo_list.userTemplate,
      {
        draftRun,
        approvedIdeaBrief,
        targetTool: 'cursor',
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
]
