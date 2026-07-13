import { z } from 'zod'
import {
  agentRoleSchema,
  artifactTypeSchema,
  nonEmptyStringSchema,
  utcDateStringSchema,
} from './common.js'

export const modelRouterRoleSchema = z.union([
  agentRoleSchema,
  artifactTypeSchema,
  z.enum(['triage', 'shield_classifier']),
])
export type ModelRouterRole = z.infer<typeof modelRouterRoleSchema>

export const modelLifecycleStatusSchema = z.enum([
  'active',
  'candidate',
  'degraded',
  'disabled',
])
export type ModelLifecycleStatus = z.infer<typeof modelLifecycleStatusSchema>

export const modelHealthStatusSchema = z.enum([
  'healthy',
  'degraded',
  'over_quota',
  'unavailable',
])
export type ModelHealthStatus = z.infer<typeof modelHealthStatusSchema>

export const modelRegistryEntrySchema = z.object({
  modelId: nonEmptyStringSchema,
  providerId: z.enum(['mock', 'anthropic', 'openai', 'gemini']),
  modelName: nonEmptyStringSchema,
  supportedRoles: z.array(modelRouterRoleSchema).min(1),
  contextWindowTokens: z.number().int().positive(),
  maxOutputTokens: z.number().int().positive(),
  inputCostPerMillionTokensUsd: z.number().nonnegative(),
  outputCostPerMillionTokensUsd: z.number().nonnegative(),
  latencyP95Ms: z.number().int().positive(),
  evaluationScore: z.number().min(0).max(1),
  safetyScore: z.number().min(0).max(1),
  reliabilityScore: z.number().min(0).max(1),
  lifecycleStatus: modelLifecycleStatusSchema,
  healthStatus: modelHealthStatusSchema,
  consecutiveFailures: z.number().int().nonnegative(),
  updatedAt: utcDateStringSchema,
})
export type ModelRegistryEntry = z.infer<typeof modelRegistryEntrySchema>

export const selectedModelSchema = z.object({
  modelId: nonEmptyStringSchema,
  providerId: modelRegistryEntrySchema.shape.providerId,
  modelName: nonEmptyStringSchema,
  score: z.number(),
  lifecycleStatus: modelLifecycleStatusSchema,
  healthStatus: modelHealthStatusSchema,
})
export type SelectedModel = z.infer<typeof selectedModelSchema>

export const modelSelectionDecisionSchema = z.object({
  decisionId: nonEmptyStringSchema,
  taskName: nonEmptyStringSchema,
  role: modelRouterRoleSchema,
  champion: selectedModelSchema,
  deputy: selectedModelSchema.optional(),
  selected: selectedModelSchema,
  selectionReason: nonEmptyStringSchema,
  candidateCount: z.number().int().nonnegative(),
  createdAt: utcDateStringSchema,
})
export type ModelSelectionDecision = z.infer<
  typeof modelSelectionDecisionSchema
>

export const modelHealthEventSchema = z.object({
  eventId: nonEmptyStringSchema,
  modelId: nonEmptyStringSchema,
  eventType: z.enum(['degraded', 'recovered']),
  reason: nonEmptyStringSchema,
  createdAt: utcDateStringSchema,
})
export type ModelHealthEvent = z.infer<typeof modelHealthEventSchema>
