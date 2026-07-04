import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const moderatorSynthesisSchema = z.object({
  executivePositioning: nonEmptyStringSchema.max(2_000),
  targetUsers: z.array(nonEmptyStringSchema.max(500)).min(1).max(10),
  coreProblem: nonEmptyStringSchema.max(2_000),
  proposedSolution: nonEmptyStringSchema.max(2_000),
  mvpScope: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(30),
  nonGoals: z.array(nonEmptyStringSchema.max(1_000)).max(30),
  keyDecisions: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(30),
  risks: z.array(nonEmptyStringSchema.max(1_000)).max(30),
  openQuestions: z.array(nonEmptyStringSchema.max(1_000)).max(30),
  artifactGenerationBrief: z.record(z.string(), z.unknown()).default({}),
})

export type ModeratorSynthesis = z.infer<typeof moderatorSynthesisSchema>
