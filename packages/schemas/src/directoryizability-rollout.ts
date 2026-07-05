import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const directoryizabilityRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type DirectoryizabilityRolloutCheckStatus = z.infer<
  typeof directoryizabilityRolloutCheckStatusSchema
>

export const directoryizabilityRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: directoryizabilityRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type DirectoryizabilityRolloutCheck = z.infer<typeof directoryizabilityRolloutCheckSchema>

export const directoryizabilityRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type DirectoryizabilityRolloutStatus = z.infer<typeof directoryizabilityRolloutStatusSchema>

export const directoryizabilityCapabilitiesResponseSchema = z.object({
  supportsDirectoryizabilityRollout: z.literal(true),
  supportsDirectoryizabilityAdminTools: z.literal(true),
  supportsMembershipDirectoryizabilitySignals: z.literal(true),
  supportsUsageEventDirectoryizabilitySignals: z.literal(true),
  guidance: nonEmptyStringSchema,
})
export type DirectoryizabilityCapabilitiesResponse = z.infer<
  typeof directoryizabilityCapabilitiesResponseSchema
>

export const directoryizabilityRolloutResponseSchema = z.object({
  status: directoryizabilityRolloutStatusSchema,
  checks: z.array(directoryizabilityRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type DirectoryizabilityRolloutResponse = z.infer<
  typeof directoryizabilityRolloutResponseSchema
>

export function getDirectoryizabilityRolloutGuidance() {
  return 'Production directoryizability rollout validates membership directoryizability, usage event directoryizability signals, billing notification coverage, and directorization readiness before production directoryizability tooling.'
}
