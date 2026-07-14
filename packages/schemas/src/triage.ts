import { z } from 'zod'
import {
  agentRoleSchema,
  complexitySchema,
  confidenceSchema,
  nonEmptyStringSchema,
  runModeSchema,
} from './common.js'

export const domainSchema = z.enum([
  'software',
  'mobile',
  'saas',
  'ecommerce',
  'fintech',
  'healthcare',
  'education',
  'security',
  'other',
])
export type Domain = z.infer<typeof domainSchema>

export const triageResultSchema = z.object({
  domain: domainSchema,
  subdomain: nonEmptyStringSchema.max(120),
  complexity: complexitySchema,
  marketConfidence: confidenceSchema,
  securitySensitivity: complexitySchema,
  recommendedRunMode: runModeSchema,
  recommendedAgents: z.array(agentRoleSchema).min(3).max(8),
  estimatedDurationSeconds: z.number().int().positive().max(900),
  estimatedMaxCostUsd: z.number().nonnegative().max(100),
  reasoningSummary: nonEmptyStringSchema.max(1_000),
})

export type TriageResult = z.infer<typeof triageResultSchema>
