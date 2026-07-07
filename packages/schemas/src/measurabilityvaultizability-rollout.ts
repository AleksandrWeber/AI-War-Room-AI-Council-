import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const measurabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MeasurabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof measurabilityvaultizabilityRolloutCheckStatusSchema
>

export const measurabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: measurabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MeasurabilityvaultizabilityRolloutCheck = z.infer<typeof measurabilityvaultizabilityRolloutCheckSchema>

export const measurabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MeasurabilityvaultizabilityRolloutStatus = z.infer<typeof measurabilityvaultizabilityRolloutStatusSchema>

export const measurabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsMeasurabilityvaultizabilityRollout: z.literal(true),
  supportsMeasurabilityvaultizabilityAdminTools: z.literal(true),
  supportsMembershipMeasurabilityvaultizabilitySignals: z.literal(true),
  supportsUsageEventMeasurabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MeasurabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof measurabilityvaultizabilityCapabilitiesResponseSchema
>

export const measurabilityvaultizabilityRolloutResponseSchema = z.object({
  status: measurabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(measurabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MeasurabilityvaultizabilityRolloutResponse = z.infer<
  typeof measurabilityvaultizabilityRolloutResponseSchema
>

export function getMeasurabilityvaultizabilityRolloutGuidance() {
  return 'Production measurabilityvaultizability rollout validates membership measurabilityvaultizability, usage event measurabilityvaultizability signals, billing notification coverage, and healingization readiness before production measurabilityvaultizability tooling.'
}
