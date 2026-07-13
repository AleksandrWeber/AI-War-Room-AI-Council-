import { z } from 'zod'
import {
  shieldFindingCategorySchema,
  shieldRecommendedActionSchema,
  shieldSeveritySchema,
} from './shield.js'
import { nonEmptyStringSchema } from './common.js'

/** Strict schema for Shield Layer 2 LLM classifier responses. */
export const shieldLlmClassifierFindingSchema = z.object({
  severity: shieldSeveritySchema.exclude(['none']),
  category: shieldFindingCategorySchema,
  spanStart: z.number().int().nonnegative().optional(),
  spanEnd: z.number().int().nonnegative().optional(),
  quote: z.string().trim().max(2_000).optional(),
  explanation: nonEmptyStringSchema.max(2_000),
  recommendedAction: shieldRecommendedActionSchema,
})

export const shieldLlmClassifierResponseSchema = z.object({
  findings: z.array(shieldLlmClassifierFindingSchema).max(20),
  rationale: z.string().trim().max(2_000).optional(),
})

export type ShieldLlmClassifierFinding = z.infer<
  typeof shieldLlmClassifierFindingSchema
>
export type ShieldLlmClassifierResponse = z.infer<
  typeof shieldLlmClassifierResponseSchema
>
