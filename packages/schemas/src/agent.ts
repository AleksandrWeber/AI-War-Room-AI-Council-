import { z } from 'zod'
import {
  agentRoleSchema,
  nonEmptyStringSchema,
  utcDateStringSchema,
} from './common.js'
import { shieldScanResultSchema } from './shield.js'

export const agentOutputSchema = z.object({
  summary: nonEmptyStringSchema.max(4_000),
  strengths: z.array(nonEmptyStringSchema.max(1_000)).max(20),
  weaknesses: z.array(nonEmptyStringSchema.max(1_000)).max(20),
  risks: z.array(nonEmptyStringSchema.max(1_000)).max(20),
  recommendations: z.array(nonEmptyStringSchema.max(1_000)).max(20),
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
