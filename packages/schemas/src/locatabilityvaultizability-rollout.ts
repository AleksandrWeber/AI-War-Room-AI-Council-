import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const locatabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type LocatabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof locatabilityvaultizabilityRolloutCheckStatusSchema
>

export const locatabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: locatabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type LocatabilityvaultizabilityRolloutCheck = z.infer<typeof locatabilityvaultizabilityRolloutCheckSchema>

export const locatabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type LocatabilityvaultizabilityRolloutStatus = z.infer<typeof locatabilityvaultizabilityRolloutStatusSchema>

export const locatabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsLocatabilityvaultizabilityRollout: z.literal(true),
  supportsLocatabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipLocatabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventLocatabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type LocatabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof locatabilityvaultizabilityCapabilitiesResponseSchema
>

export const locatabilityvaultizabilityRolloutResponseSchema = z.object({
  status: locatabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(locatabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type LocatabilityvaultizabilityRolloutResponse = z.infer<
  typeof locatabilityvaultizabilityRolloutResponseSchema
>

export function getLocatabilityvaultizabilityRolloutGuidance() {
  return 'Production locatabilityvaultizability rollout validates membership locatabilityvaultizability, usage event locatabilityvaultizability signals, billing notification coverage, and healingization readiness before production locatabilityvaultizability tooling.'
}
