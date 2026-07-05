import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const survivabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type SurvivabilityRolloutCheckStatus = z.infer<
  typeof survivabilityRolloutCheckStatusSchema
>

export const survivabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: survivabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type SurvivabilityRolloutCheck = z.infer<typeof survivabilityRolloutCheckSchema>

export const survivabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type SurvivabilityRolloutStatus = z.infer<typeof survivabilityRolloutStatusSchema>

export const survivabilityCapabilitiesResponseSchema = z.object({
  supportsSurvivabilityRollout: z.literal(true),
  supportsSurvivabilityAdminTools: z.literal(true),
  supportsBillingRecordSurvivabilitySignals: z.literal(true),
  supportsMeterUsageSurvivabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type SurvivabilityCapabilitiesResponse = z.infer<
  typeof survivabilityCapabilitiesResponseSchema
>

export const survivabilityRolloutResponseSchema = z.object({
  status: survivabilityRolloutStatusSchema,
  checks: z.array(survivabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type SurvivabilityRolloutResponse = z.infer<
  typeof survivabilityRolloutResponseSchema
>

export function getSurvivabilityRolloutGuidance() {
  return 'Production survivability rollout validates billing record survivability, meter usage survivability signals, workspace limit coverage, and survival readiness before production survivability tooling.'
}
