import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const shieldSeveritySchema = z.enum([
  'none',
  'low',
  'medium',
  'high',
  'critical',
])
export type ShieldSeverity = z.infer<typeof shieldSeveritySchema>

export const shieldStatusSchema = z.enum(['clear', 'warning', 'blocked'])
export type ShieldStatus = z.infer<typeof shieldStatusSchema>

export const shieldFindingCategorySchema = z.enum([
  'prompt_injection',
  'secrets',
  'pii',
  'unsafe_code',
  'data_exfiltration',
  'malicious_intent',
  'policy_violation',
  'other',
])
export type ShieldFindingCategory = z.infer<typeof shieldFindingCategorySchema>

export const shieldFindingSourceSchema = z.enum([
  'user_input',
  'triage_output',
  'agent_output',
  'moderator_output',
  'artifact_output',
  'external_research',
])
export type ShieldFindingSource = z.infer<typeof shieldFindingSourceSchema>

export const shieldRecommendedActionSchema = z.enum([
  'allow',
  'warn',
  'require_confirmation',
  'redact',
  'block',
])
export type ShieldRecommendedAction = z.infer<
  typeof shieldRecommendedActionSchema
>

export const shieldSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  quote: nonEmptyStringSchema.max(2_000),
})

export const shieldFindingSchema = z.object({
  findingId: nonEmptyStringSchema,
  severity: shieldSeveritySchema.exclude(['none']),
  category: shieldFindingCategorySchema,
  source: shieldFindingSourceSchema,
  span: shieldSpanSchema.optional(),
  explanation: nonEmptyStringSchema.max(2_000),
  recommendedAction: shieldRecommendedActionSchema,
})

export const shieldScanResultSchema = z.object({
  scanId: nonEmptyStringSchema,
  status: shieldStatusSchema,
  maxSeverity: shieldSeveritySchema,
  findings: z.array(shieldFindingSchema).max(100),
})

export type ShieldSpan = z.infer<typeof shieldSpanSchema>
export type ShieldFinding = z.infer<typeof shieldFindingSchema>
export type ShieldScanResult = z.infer<typeof shieldScanResultSchema>
