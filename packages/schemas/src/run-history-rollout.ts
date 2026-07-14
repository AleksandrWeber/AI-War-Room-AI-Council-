import { z } from 'zod'
import { nonEmptyStringSchema, utcDateStringSchema } from './common.js'

export const runHistoryRolloutCheckStatusSchema = z.enum(['pass', 'fail', 'skip'])
export type RunHistoryRolloutCheckStatus = z.infer<
  typeof runHistoryRolloutCheckStatusSchema
>

export const runHistoryRolloutCheckSchema = z.object({
  name: nonEmptyStringSchema,
  label: nonEmptyStringSchema,
  status: runHistoryRolloutCheckStatusSchema,
  detail: nonEmptyStringSchema,
})
export type RunHistoryRolloutCheck = z.infer<typeof runHistoryRolloutCheckSchema>

export const runHistoryRolloutStatusSchema = z.enum(['ready', 'not_ready'])
export type RunHistoryRolloutStatus = z.infer<typeof runHistoryRolloutStatusSchema>

export const runHistoryCapabilitiesResponseSchema = z.object({
  supportsRunHistoryRollout: z.literal(true),
  supportsRunHistoryAdminTools: z.literal(true),
  supportsMarkdownExport: z.literal(true),
  supportedArtifactTypes: z.array(
    z.enum(['idea_brief', 'master_prompt', 'todo_list']),
  ),
  guidance: nonEmptyStringSchema,
})
export type RunHistoryCapabilitiesResponse = z.infer<
  typeof runHistoryCapabilitiesResponseSchema
>

export const runHistoryRolloutResponseSchema = z.object({
  status: runHistoryRolloutStatusSchema,
  checks: z.array(runHistoryRolloutCheckSchema),
  guidance: nonEmptyStringSchema,
  checkedAt: utcDateStringSchema,
})
export type RunHistoryRolloutResponse = z.infer<
  typeof runHistoryRolloutResponseSchema
>

export const criticalRunHistoryArtifactTypes = [
  'idea_brief',
  'master_prompt',
  'todo_list',
] as const

export function getRunHistoryRolloutGuidance() {
  return 'Run history rollout validates artifact persistence, markdown export, and stream replay readiness before production history tooling.'
}
