import {
  agentOutputSchema,
  developmentPromptSchema,
  executiveSummarySchema,
  moderatorSynthesisSchema,
  prdSchema,
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
    'Lock PRD screens and stories',
    'Generate Development Prompt buildTodos',
    'Implement web app in todo order',
  ],
  artifactGenerationBrief: {
    promptVersion: 'moderator/v2',
  },
}

const completedPrd = {
  overview: 'AI War Room creates reviewed planning artifacts.',
  goals: ['Generate PRDs from approved ideas'],
  nonGoals: ['Replace human product judgment'],
  userPersonas: ['Technical founder'],
  userJourneys: ['Submit idea, review triage, execute council, export artifacts'],
  functionalRequirements: ['Create draft runs', 'Generate artifacts'],
  nonFunctionalRequirements: ['Validate schemas'],
  mvpScope: ['Idea submission', 'Artifact generation'],
  futureScope: ['Research agents'],
  securityConsiderations: ['Treat input as untrusted'],
  successMetrics: ['Artifact completion rate'],
  openQuestions: ['Which provider ships first?'],
  screensOrViews: ['Idea submission', 'Human review', 'Artifact viewer'],
  userStories: [
    'As a founder, I want to submit an idea so that I get a structured plan.',
  ],
  acceptanceCriteria: [
    'PRD includes screens and user stories',
    'Development Prompt includes buildTodos',
  ],
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
    caseId: 'artifact-executive-summary',
    taskName: artifactPrompts.executive_summary.version,
    expectedPromptVersion: 'artifacts/executive_summary/v2',
    schema: executiveSummarySchema,
    messages: createMessages(
      artifactPrompts.executive_summary.system,
      artifactPrompts.executive_summary.userTemplate,
      {
        draftRun,
        moderatorSynthesis,
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'artifact-prd',
    taskName: artifactPrompts.prd.version,
    expectedPromptVersion: 'artifacts/prd/v2',
    schema: prdSchema,
    messages: createMessages(artifactPrompts.prd.system, artifactPrompts.prd.userTemplate, {
      draftRun,
      moderatorSynthesis,
    }),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
  {
    caseId: 'artifact-development-prompt',
    taskName: artifactPrompts.development_prompt.version,
    expectedPromptVersion: 'artifacts/development_prompt/v2',
    schema: developmentPromptSchema,
    messages: createMessages(
      artifactPrompts.development_prompt.system,
      artifactPrompts.development_prompt.userTemplate,
      {
        draftRun,
        moderatorSynthesis,
        completedPrd,
      },
    ),
    minimumClarityScore: 0.6,
    minimumUsefulnessScore: 0.6,
  },
]
