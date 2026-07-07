import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const monitorabilityvaultizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type MonitorabilityvaultizabilityRolloutCheckStatus = z.infer<
  typeof monitorabilityvaultizabilityRolloutCheckStatusSchema
>

export const monitorabilityvaultizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: monitorabilityvaultizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type MonitorabilityvaultizabilityRolloutCheck = z.infer<typeof monitorabilityvaultizabilityRolloutCheckSchema>

export const monitorabilityvaultizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type MonitorabilityvaultizabilityRolloutStatus = z.infer<typeof monitorabilityvaultizabilityRolloutStatusSchema>

export const monitorabilityvaultizabilityCapabilitiesResponseSchema = z.object({
  supportsMonitorabilityvaultizabilityRollout: z.literal(true),
  supportsMonitorabilityvaultizabilityAdminTools: z.literal(true),
  supportsShieldScanMonitorabilityvaultizabilitySignals: z.literal(true),
  supportsProviderCredentialMonitorabilityvaultizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type MonitorabilityvaultizabilityCapabilitiesResponse = z.infer<
  typeof monitorabilityvaultizabilityCapabilitiesResponseSchema
>

export const monitorabilityvaultizabilityRolloutResponseSchema = z.object({
  status: monitorabilityvaultizabilityRolloutStatusSchema,
  checks: z.array(monitorabilityvaultizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type MonitorabilityvaultizabilityRolloutResponse = z.infer<
  typeof monitorabilityvaultizabilityRolloutResponseSchema
>

export function getMonitorabilityvaultizabilityRolloutGuidance() {
  return 'Production monitorabilityvaultizability rollout validates shield scan monitorabilityvaultizability, provider credential monitorabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production monitorabilityvaultizability tooling.'
}
