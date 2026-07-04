import { z } from 'zod'
import {
  agentRoleSchema,
  nonEmptyStringSchema,
  runStatusSchema,
  utcDateStringSchema,
} from './common.js'
import { ideaSubmissionSchema } from './idea.js'
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
  selectedAgents: z.array(agentRoleSchema).min(3).max(7),
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

export type CreateRunRequest = z.infer<typeof createRunRequestSchema>
export type RunStepStatus = z.infer<typeof runStepStatusSchema>
export type DraftRun = z.infer<typeof draftRunSchema>
export type RunStatusResponse = z.infer<typeof runStatusResponseSchema>
