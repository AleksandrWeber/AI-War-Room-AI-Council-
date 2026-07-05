import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const ontologizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type OntologizabilityRolloutCheckStatus = z.infer<
  typeof ontologizabilityRolloutCheckStatusSchema
>

export const ontologizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: ontologizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type OntologizabilityRolloutCheck = z.infer<typeof ontologizabilityRolloutCheckSchema>

export const ontologizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type OntologizabilityRolloutStatus = z.infer<typeof ontologizabilityRolloutStatusSchema>

export const ontologizabilityCapabilitiesResponseSchema = z.object({
  supportsOntologizabilityRollout: z.literal(true),
  supportsOntologizabilityAdminTools: z.literal(true),
  supportsMembershipOntologizabilitySignals: z.literal(true),
  supportsUsageEventOntologizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type OntologizabilityCapabilitiesResponse = z.infer<
  typeof ontologizabilityCapabilitiesResponseSchema
>

export const ontologizabilityRolloutResponseSchema = z.object({
  status: ontologizabilityRolloutStatusSchema,
  checks: z.array(ontologizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type OntologizabilityRolloutResponse = z.infer<
  typeof ontologizabilityRolloutResponseSchema
>

export function getOntologizabilityRolloutGuidance() {
  return 'Production ontologizability rollout validates membership ontologizability, usage event ontologizability signals, billing notification coverage, and ontologization readiness before production ontologizability tooling.'
}
