import { z } from 'zod'
import {
  agentRoleSchema,
  nonEmptyStringSchema,
  runStatusSchema,
  utcDateStringSchema,
} from './common.js'
import { agentExecutionResultSchema } from './agent.js'
import {
  artifactSchema,
  developmentPromptTargetToolSchema,
  ideaBriefSchema,
} from './artifact.js'
import { ideaSubmissionSchema } from './idea.js'
import { moderatorSynthesisSchema } from './moderator.js'
import { shieldScanResultSchema } from './shield.js'
import { triageResultSchema } from './triage.js'

export const createRunRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  idempotencyKey: nonEmptyStringSchema.max(200),
  idea: ideaSubmissionSchema,
})

export const runStepStatusSchema = z.object({
  stepId: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: runStatusSchema,
  startedAt: utcDateStringSchema.optional(),
  completedAt: utcDateStringSchema.optional(),
})

export const draftRunSchema = z.object({
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  status: z.literal('draft'),
  idea: ideaSubmissionSchema,
  shieldScan: shieldScanResultSchema,
  triage: triageResultSchema,
  selectedAgents: z.array(agentRoleSchema).min(3).max(8),
  estimatedDurationSeconds: z.number().int().positive().max(900),
  estimatedMaxCostUsd: z.number().nonnegative().max(100),
  createdAt: utcDateStringSchema,
  updatedAt: utcDateStringSchema,
})

export const runStatusResponseSchema = z.object({
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  status: runStatusSchema,
  steps: z.array(runStepStatusSchema),
  updatedAt: utcDateStringSchema,
})

export const mockPipelineRequestSchema = z.object({
  draftRun: draftRunSchema,
  approvedTriage: triageResultSchema,
  selectedAgents: z.array(agentRoleSchema).min(3).max(8),
  developmentPromptTargetTool: developmentPromptTargetToolSchema.default('cursor'),
})

export const mockPipelineResultSchema = z.object({
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  status: z.enum(['awaiting_idea_approval', 'idea_approved', 'completed']),
  steps: z.array(runStepStatusSchema),
  agentOutputs: z.array(agentExecutionResultSchema).min(1),
  moderatorSynthesis: moderatorSynthesisSchema,
  artifacts: z.array(artifactSchema).min(1).max(4),
  completedAt: utcDateStringSchema,
})

export const approveIdeaRequestSchema = z.object({
  draftRun: draftRunSchema,
  approvedTriage: triageResultSchema,
  selectedAgents: z.array(agentRoleSchema).min(3).max(8),
  previousResult: mockPipelineResultSchema,
  approvedIdeaBrief: ideaBriefSchema,
  developmentPromptTargetTool: developmentPromptTargetToolSchema.default('cursor'),
})

/** Generate master prompt after the idea is approved. */
export const generateMasterPromptRequestSchema = approveIdeaRequestSchema

/** Generate UI prompt after the idea is approved. */
export const generateUiPromptRequestSchema = approveIdeaRequestSchema

/** Generate todo list after master prompt exists (todo is derived from the prompt). */
export const generateTodoListRequestSchema = approveIdeaRequestSchema

export const explainIdeaRequestSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  ideaBrief: ideaBriefSchema,
  question: nonEmptyStringSchema.max(4_000),
})

export const explainIdeaResponseSchema = z.object({
  explanation: nonEmptyStringSchema.max(12_000),
  modelProvider: nonEmptyStringSchema,
  modelName: nonEmptyStringSchema,
})

export type CreateRunRequest = z.infer<typeof createRunRequestSchema>
export type RunStepStatus = z.infer<typeof runStepStatusSchema>
export type DraftRun = z.infer<typeof draftRunSchema>
export type RunStatusResponse = z.infer<typeof runStatusResponseSchema>
export type MockPipelineRequest = z.infer<typeof mockPipelineRequestSchema>
export type MockPipelineResult = z.infer<typeof mockPipelineResultSchema>
export type ApproveIdeaRequest = z.infer<typeof approveIdeaRequestSchema>
export type GenerateMasterPromptRequest = z.infer<
  typeof generateMasterPromptRequestSchema
>
export type GenerateUiPromptRequest = z.infer<typeof generateUiPromptRequestSchema>
export type GenerateTodoListRequest = z.infer<typeof generateTodoListRequestSchema>
export type ExplainIdeaRequest = z.infer<typeof explainIdeaRequestSchema>
export type ExplainIdeaResponse = z.infer<typeof explainIdeaResponseSchema>

export const approvedRunRuntimePathSchema = z.enum(['temporal', 'direct'])
export type ApprovedRunRuntimePath = z.infer<typeof approvedRunRuntimePathSchema>

export const runRuntimeCapabilitiesSchema = z.object({
  defaultPath: approvedRunRuntimePathSchema,
  temporalEnabled: z.boolean(),
  taskQueue: nonEmptyStringSchema,
})
export type RunRuntimeCapabilities = z.infer<typeof runRuntimeCapabilitiesSchema>

export const runCapabilitiesResponseSchema = z.object({
  statuses: z.array(runStatusSchema),
  agentRoles: z.array(agentRoleSchema),
  flow: z.array(nonEmptyStringSchema),
  runtime: runRuntimeCapabilitiesSchema,
})
export type RunCapabilitiesResponse = z.infer<typeof runCapabilitiesResponseSchema>
