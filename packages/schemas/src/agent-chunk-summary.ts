import { z } from 'zod'
import { agentRoleSchema, nonEmptyStringSchema } from './common.js'

/** Compressed agent output passed to Moderator (spec Step 9). */
export const agentChunkSummarySchema = z.object({
  agentRole: agentRoleSchema.exclude(['moderator']),
  summary: nonEmptyStringSchema.max(4_000),
  topInsights: z.array(nonEmptyStringSchema.max(1_000)).max(8),
  topRisks: z.array(nonEmptyStringSchema.max(1_000)).max(8),
  conflicts: z.array(nonEmptyStringSchema.max(1_000)).max(8),
  recommendedDecisions: z.array(nonEmptyStringSchema.max(1_000)).max(8),
  securityNotes: z.array(nonEmptyStringSchema.max(1_000)).max(8).default([]),
})

export const agentChunkSummaryListSchema = z
  .array(agentChunkSummarySchema)
  .max(40)

export type AgentChunkSummary = z.infer<typeof agentChunkSummarySchema>
