import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const runFeedbackTargetTypeSchema = z.enum(['run', 'artifact'])
export type RunFeedbackTargetType = z.infer<typeof runFeedbackTargetTypeSchema>

export const runFeedbackUsefulnessSchema = z.enum([
  'useful',
  'partially_useful',
  'not_useful',
])
export type RunFeedbackUsefulness = z.infer<typeof runFeedbackUsefulnessSchema>

export const createRunFeedbackRequestSchema = z
  .object({
    targetType: runFeedbackTargetTypeSchema,
    runId: nonEmptyStringSchema,
    artifactId: nonEmptyStringSchema.optional(),
    usefulness: runFeedbackUsefulnessSchema,
    comment: z.string().trim().max(1_000).optional(),
  })
  .superRefine((value, context) => {
    if (value.targetType === 'artifact' && !value.artifactId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'artifactId is required when targetType is artifact.',
        path: ['artifactId'],
      })
    }
  })

export const runFeedbackResponseSchema = z.object({
  feedbackId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  artifactId: nonEmptyStringSchema.nullable(),
  targetType: runFeedbackTargetTypeSchema,
  targetKey: nonEmptyStringSchema,
  actorUserId: nonEmptyStringSchema,
  usefulness: runFeedbackUsefulnessSchema,
  comment: z.string().nullable(),
  createdAt: nonEmptyStringSchema,
  updatedAt: nonEmptyStringSchema,
})

export type CreateRunFeedbackRequest = z.infer<
  typeof createRunFeedbackRequestSchema
>
export type RunFeedbackResponse = z.infer<typeof runFeedbackResponseSchema>
