import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const resilientizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type ResilientizabilityRolloutCheckStatus = z.infer<
  typeof resilientizabilityRolloutCheckStatusSchema
>

export const resilientizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: resilientizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type ResilientizabilityRolloutCheck = z.infer<typeof resilientizabilityRolloutCheckSchema>

export const resilientizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type ResilientizabilityRolloutStatus = z.infer<typeof resilientizabilityRolloutStatusSchema>

export const resilientizabilityCapabilitiesResponseSchema = z.object({
  supportsResilientizabilityRollout: z.literal(true),
  supportsResilientizabilityAdminTools: z.literal(true),
  supportsMembershipResilientizabilitySignals: z.literal(true),
  supportsUsageEventResilientizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type ResilientizabilityCapabilitiesResponse = z.infer<
  typeof resilientizabilityCapabilitiesResponseSchema
>

export const resilientizabilityRolloutResponseSchema = z.object({
  status: resilientizabilityRolloutStatusSchema,
  checks: z.array(resilientizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type ResilientizabilityRolloutResponse = z.infer<
  typeof resilientizabilityRolloutResponseSchema
>

export function getResilientizabilityRolloutGuidance() {
  return 'Production resilientizability rollout validates membership resilientizability, usage event resilientizability signals, billing notification coverage, and resilientization readiness before production resilientizability tooling.'
}
