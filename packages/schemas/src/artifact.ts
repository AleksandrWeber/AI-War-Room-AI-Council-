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
  overview: nonEmptyStringSchema.max(8_000),
  goals: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  nonGoals: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  userPersonas: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(30),
  userJourneys: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  functionalRequirements: z
    .array(nonEmptyStringSchema.max(2_000))
    .min(1)
    .max(100),
  nonFunctionalRequirements: z
    .array(nonEmptyStringSchema.max(2_000))
    .max(60),
  mvpScope: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  futureScope: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  securityConsiderations: z
    .array(nonEmptyStringSchema.max(2_000))
    .max(60),
  successMetrics: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  openQuestions: z.array(nonEmptyStringSchema.max(2_000)).max(40),
  screensOrViews: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  userStories: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(80),
  acceptanceCriteria: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(80),
})

export const developmentPromptTargetToolSchema = z.enum([
  'cursor',
  'claude_code',
  'bolt',
  'lovable',
])
export type DevelopmentPromptTargetTool = z.infer<
  typeof developmentPromptTargetToolSchema
>

export const developmentPromptBuildTodoSchema = z.object({
  title: nonEmptyStringSchema.max(500),
  details: nonEmptyStringSchema.max(4_000),
  acceptanceCheck: nonEmptyStringSchema.max(2_000),
  suggestedFiles: z.array(nonEmptyStringSchema.max(500)).max(20).default([]),
})

export const developmentPromptSchema = z.object({
  targetTool: developmentPromptTargetToolSchema.default('cursor'),
  productSummary: nonEmptyStringSchema.max(8_000),
  technicalStack: z.array(nonEmptyStringSchema.max(500)).min(1).max(40),
  architectureOverview: nonEmptyStringSchema.max(8_000),
  requiredModules: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(80),
  dataModel: z.array(nonEmptyStringSchema.max(2_000)).max(80),
  apiRequirements: z.array(nonEmptyStringSchema.max(2_000)).max(100),
  uiRequirements: z.array(nonEmptyStringSchema.max(2_000)).max(100),
  securityConstraints: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  testingRequirements: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  implementationOrder: z
    .array(nonEmptyStringSchema.max(2_000))
    .min(1)
    .max(100),
  outOfScope: z.array(nonEmptyStringSchema.max(2_000)).max(60),
  toolSpecificGuidance: z
    .array(nonEmptyStringSchema.max(2_000))
    .max(30)
    .default([]),
  buildTodos: z.array(developmentPromptBuildTodoSchema).min(1).max(100),
  screenMap: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(60),
  copyPasteBrief: nonEmptyStringSchema.max(12_000),
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

export const artifactHistoryItemSchema = z.object({
  artifactId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  workspaceId: nonEmptyStringSchema,
  artifactType: artifactTypeSchema,
  artifactVersion: nonEmptyStringSchema,
  createdAt: utcDateStringSchema,
  metadata: artifactMetadataSchema,
  artifact: artifactContentSchema,
})

export const artifactHistoryResponseSchema = z.object({
  workspaceId: nonEmptyStringSchema,
  artifacts: z.array(artifactHistoryItemSchema),
})

export type ExecutiveSummary = z.infer<typeof executiveSummarySchema>
export type Prd = z.infer<typeof prdSchema>
export type DevelopmentPromptBuildTodo = z.infer<
  typeof developmentPromptBuildTodoSchema
>
export type DevelopmentPrompt = z.infer<typeof developmentPromptSchema>
export type ArtifactMetadata = z.infer<typeof artifactMetadataSchema>
export type Artifact = z.infer<typeof artifactSchema>
export type ArtifactHistoryItem = z.infer<typeof artifactHistoryItemSchema>
export type ArtifactHistoryResponse = z.infer<typeof artifactHistoryResponseSchema>
