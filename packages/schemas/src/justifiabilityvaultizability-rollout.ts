import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const justifiabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type JustifiabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof justifiabilityvaultizabilityRolloutCheckStatusSchema
>

export const justifiabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: justifiabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type JustifiabilityvaultizabilityRolloutCheck = z.infer<typeof justifiabilityvaultizabilityRolloutCheckSchema>

export const justifiabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type JustifiabilityvaultizabilityRolloutStatus = z.infer<typeof justifiabilityvaultizabilityRolloutStatusSchema>

export const justifiabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsJustifiabilityvaultizabilityRollout: z.literal(true),
  supportsJustifiabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanJustifiabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialJustifiabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type JustifiabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof justifiabilityvaultizabilityCapabilitiesResponseSchema
>

export const justifiabilityvaultizabilityRolloutResponseSchema = z.object({
  status: justifiabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(justifiabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type JustifiabilityvaultizabilityRolloutResponse = z.infer<
  typeof justifiabilityvaultizabilityRolloutResponseSchema
>

export function getJustifiabilityvaultizabilityRolloutGuidance() {
  return 'Production justifiabilityvaultizability rollout validates shield scan justifiabilityvaultizability, provider credential justifiabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production justifiabilityvaultizability tooling.'
}
