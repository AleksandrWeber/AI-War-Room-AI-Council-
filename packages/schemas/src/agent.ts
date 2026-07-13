import { z } from 'zod'
import {
  agentRoleSchema,
  nonEmptyStringSchema,
  utcDateStringSchema,
} from './common.js'
import { shieldScanResultSchema } from './shield.js'

export const agentOutputSchema = z.object({
  summary: nonEmptyStringSchema.max(8_000),
  strengths: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  weaknesses: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  risks: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  recommendations: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  ideaGaps: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  additions: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  mustHaveFeatures: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  buildNotes: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  roleSpecificInsights: z.record(z.string(), z.unknown()).default({}),
})

export const agentExecutionResultSchema = z.object({
  runId: nonEmptyStringSchema,
  agentRole: agentRoleSchema.exclude(['moderator']),
  output: agentOutputSchema,
  validationStatus: z.enum(['valid', 'repaired', 'fallback']),
  promptVersion: nonEmptyStringSchema,
  modelProvider: nonEmptyStringSchema,
  modelName: nonEmptyStringSchema,
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
  shieldScan: shieldScanResultSchema.optional(),
  completedAt: utcDateStringSchema,
})

export type AgentOutput = z.infer<typeof agentOutputSchema>
export type AgentExecutionResult = z.infer<typeof agentExecutionResultSchema>
