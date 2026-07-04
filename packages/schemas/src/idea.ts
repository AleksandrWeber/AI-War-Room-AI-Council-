import { z } from 'zod'
import { nonEmptyStringSchema } from './common.js'

export const ideaSubmissionSchema = z.object({
  rawIdea: nonEmptyStringSchema.max(12_000),
  targetAudience: z.string().trim().max(2_000).optional(),
  strategicGoals: z.array(nonEmptyStringSchema.max(500)).max(10).default([]),
  technicalPreferences: z.array(nonEmptyStringSchema.max(500)).max(10).default([]),
  constraints: z.array(nonEmptyStringSchema.max(500)).max(10).default([]),
  references: z.array(z.url()).max(10).default([]),
})

export type IdeaSubmission = z.infer<typeof ideaSubmissionSchema>
