import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const researchProviderIdSchema = z.enum(['mock', 'tavily'])
export type ResearchProviderId = z.infer<typeof researchProviderIdSchema>

export const researchCapabilitiesResponseSchema = z.object({
  researchProvider: researchProviderIdSchema,
  tavilyMaxResults: z.number().int().positive(),
  supportsResearchRollout: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ResearchCapabilitiesResponse = z.infer<
  typeof researchCapabilitiesResponseSchema
>

export const researchRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ResearchRolloutCheckStatus = z.infer<
  typeof researchRolloutCheckStatusSchema
>

export const researchRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: researchRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ResearchRolloutCheck = z.infer<typeof researchRolloutCheckSchema>

export const researchRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ResearchRolloutStatus = z.infer<typeof researchRolloutStatusSchema>

export const researchRolloutResponseSchema = z.object({
  status: researchRolloutStatusSchema,
  researchProvider: researchProviderIdSchema,
  checks: z.array(researchRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ResearchRolloutResponse = z.infer<typeof researchRolloutResponseSchema>

export function getResearchProviderGuidance(input: {
  researchProvider: ResearchProviderId
}) {
  if (input.researchProvider === 'mock') {
    return 'Mock research provider is active for local development and tests.'
  }

  return 'Tavily research is configured. Workspace BYOK can override the platform key; set RESEARCH_SECONDARY_PROVIDER=serper for failover.'
}
