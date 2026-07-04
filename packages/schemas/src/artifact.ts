import { z } from 'zod'
import {
  artifactTypeSchema,
  nonEmptyStringSchema,
  utcDateStringSchema,
} from './common.js'
import { shieldStatusSchema } from './shield.js'

export const executiveSummarySchema = z.object({
  productIdea: nonEmptyStringSchema.max(2_000),
  targetUsers: z.array(nonEmptyStringSchema.max(500)).min(1).max(10),
  coreValueProposition: nonEmptyStringSchema.max(2_000),
  mainDifferentiator: nonEmptyStringSchema.max(2_000),
  mvpRecommendation: nonEmptyStringSchema.max(2_000),
  topRisks: z.array(nonEmptyStringSchema.max(1_000)).max(10),
  recommendation: z.enum(['go', 'no_go', 'revise']),
})

export const prdSchema = z.object({
  overview: nonEmptyStringSchema.max(4_000),
  goals: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(20),
  nonGoals: z.array(nonEmptyStringSchema.max(1_000)).max(20),
  userPersonas: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(20),
  userJourneys: z.array(nonEmptyStringSchema.max(1_500)).min(1).max(30),
  functionalRequirements: z
    .array(nonEmptyStringSchema.max(1_500))
    .min(1)
    .max(60),
  nonFunctionalRequirements: z
    .array(nonEmptyStringSchema.max(1_500))
    .max(40),
  mvpScope: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(40),
  futureScope: z.array(nonEmptyStringSchema.max(1_000)).max(40),
  securityConsiderations: z
    .array(nonEmptyStringSchema.max(1_000))
    .max(40),
  successMetrics: z.array(nonEmptyStringSchema.max(1_000)).max(30),
  openQuestions: z.array(nonEmptyStringSchema.max(1_000)).max(30),
})

export const developmentPromptSchema = z.object({
  productSummary: nonEmptyStringSchema.max(4_000),
  technicalStack: z.array(nonEmptyStringSchema.max(500)).min(1).max(30),
  architectureOverview: nonEmptyStringSchema.max(4_000),
  requiredModules: z.array(nonEmptyStringSchema.max(1_000)).min(1).max(50),
  dataModel: z.array(nonEmptyStringSchema.max(1_000)).max(50),
  apiRequirements: z.array(nonEmptyStringSchema.max(1_000)).max(60),
  uiRequirements: z.array(nonEmptyStringSchema.max(1_000)).max(60),
  securityConstraints: z.array(nonEmptyStringSchema.max(1_000)).max(40),
  testingRequirements: z.array(nonEmptyStringSchema.max(1_000)).max(40),
  implementationOrder: z
    .array(nonEmptyStringSchema.max(1_000))
    .min(1)
    .max(60),
  outOfScope: z.array(nonEmptyStringSchema.max(1_000)).max(40),
})

export const artifactMetadataSchema = z.object({
  artifactId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  artifactType: artifactTypeSchema,
  artifactVersion: nonEmptyStringSchema,
  promptVersion: nonEmptyStringSchema,
  modelProvider: nonEmptyStringSchema,
  modelName: nonEmptyStringSchema,
  tokenUsage: z.object({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
  }),
  estimatedCostUsd: z.number().nonnegative(),
  validationStatus: z.enum(['valid', 'repaired', 'fallback']),
  shieldStatus: shieldStatusSchema,
  createdAt: utcDateStringSchema,
})

export const artifactContentSchema = z.discriminatedUnion('artifactType', [
  z.object({
    artifactType: z.literal('executive_summary'),
    content: executiveSummarySchema,
  }),
  z.object({
    artifactType: z.literal('prd'),
    content: prdSchema,
  }),
  z.object({
    artifactType: z.literal('development_prompt'),
    content: developmentPromptSchema,
  }),
])

export const artifactSchema = z.object({
  metadata: artifactMetadataSchema,
  artifact: artifactContentSchema,
})

export type ExecutiveSummary = z.infer<typeof executiveSummarySchema>
export type Prd = z.infer<typeof prdSchema>
export type DevelopmentPrompt = z.infer<typeof developmentPromptSchema>
export type ArtifactMetadata = z.infer<typeof artifactMetadataSchema>
export type Artifact = z.infer<typeof artifactSchema>
