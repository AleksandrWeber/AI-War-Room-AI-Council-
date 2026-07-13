import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const moderatorSynthesisSchema = z.object({
  executivePositioning: nonEmptyStringSchema.max(4_000),
  targetUsers: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(20),
  coreProblem: nonEmptyStringSchema.max(4_000),
  proposedSolution: nonEmptyStringSchema.max(4_000),
  mvpScope: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  nonGoals: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  keyDecisions: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  risks: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  openQuestions: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  additionsToIdea: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  mvpBuildSequence: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  artifactGenerationBrief: z.record(z.string(), z.unknown()).default({}),
})

export type ModeratorSynthesis = z.infer<typeof moderatorSynthesisSchema>
