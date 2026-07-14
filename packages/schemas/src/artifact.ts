import { z } from 'zod'
import {
  artifactTypeSchema,
  nonEmptyStringSchema,
  utcDateStringSchema,
} from './common.js'
import { shieldStatusSchema } from './shield.js'

export const developmentPromptTargetToolSchema = z.enum([
  'cursor',
  'claude_code',
  'bolt',
  'lovable',
])
export type DevelopmentPromptTargetTool = z.infer<
  typeof developmentPromptTargetToolSchema
>

export const ideaBriefToolSchema = z.object({
  name: nonEmptyStringSchema.max(200),
  why: nonEmptyStringSchema.max(2_000),
  required: z.boolean().default(false),
})

export const ideaBriefAiChoiceSchema = z.object({
  name: nonEmptyStringSchema.max(200),
  role: nonEmptyStringSchema.max(500),
  why: nonEmptyStringSchema.max(2_000),
})

/** Phase A: expanded idea for human discussion and approval. */
export const ideaBriefSchema = z.object({
  summaryForUser: nonEmptyStringSchema.max(4_000),
  expandedIdea: nonEmptyStringSchema.max(16_000),
  analysis: nonEmptyStringSchema.max(8_000),
  acceptRecommendations: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  applyRecommendations: z.array(nonEmptyStringSchema.max(2_000)).min(1).max(40),
  toolsToUse: z.array(ideaBriefToolSchema).min(1).max(40),
  aiChoices: z.array(ideaBriefAiChoiceSchema).min(1).max(20),
  openQuestions: z.array(nonEmptyStringSchema.max(2_000)).max(30).default([]),
})

/** Phase B: paste-ready general build prompt (.md style). */
export const masterPromptSchema = z.object({
  title: nonEmptyStringSchema.max(500),
  targetTool: developmentPromptTargetToolSchema.default('cursor'),
  markdownBody: nonEmptyStringSchema.max(40_000),
})

/** Phase B: paste-ready UI/UX design prompt (.md style). */
export const uiPromptSchema = z.object({
  title: nonEmptyStringSchema.max(500),
  targetTool: developmentPromptTargetToolSchema.default('cursor'),
  markdownBody: nonEmptyStringSchema.max(40_000),
})

export const todoListItemSchema = z.object({
  step: z.number().int().positive().max(200),
  title: nonEmptyStringSchema.max(500),
  details: nonEmptyStringSchema.max(4_000),
  acceptanceCheck: nonEmptyStringSchema.max(2_000),
  suggestedFiles: z.array(nonEmptyStringSchema.max(500)).max(20).default([]),
})

/** Phase B: step-by-step execution checklist. */
export const todoListSchema = z.object({
  overview: nonEmptyStringSchema.max(4_000),
  items: z.array(todoListItemSchema).min(1).max(100),
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
    artifactType: z.literal('idea_brief'),
    content: ideaBriefSchema,
  }),
  z.object({
    artifactType: z.literal('master_prompt'),
    content: masterPromptSchema,
  }),
  z.object({
    artifactType: z.literal('ui_prompt'),
    content: uiPromptSchema,
  }),
  z.object({
    artifactType: z.literal('todo_list'),
    content: todoListSchema,
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

export type IdeaBriefTool = z.infer<typeof ideaBriefToolSchema>
export type IdeaBriefAiChoice = z.infer<typeof ideaBriefAiChoiceSchema>
export type IdeaBrief = z.infer<typeof ideaBriefSchema>
export type MasterPrompt = z.infer<typeof masterPromptSchema>
export type UiPrompt = z.infer<typeof uiPromptSchema>
export type TodoListItem = z.infer<typeof todoListItemSchema>
export type TodoList = z.infer<typeof todoListSchema>
export type ArtifactMetadata = z.infer<typeof artifactMetadataSchema>
export type Artifact = z.infer<typeof artifactSchema>
export type ArtifactHistoryItem = z.infer<typeof artifactHistoryItemSchema>
export type ArtifactHistoryResponse = z.infer<typeof artifactHistoryResponseSchema>

/** @deprecated Use IdeaBrief / MasterPrompt / TodoList */
export type ExecutiveSummary = IdeaBrief
/** @deprecated Use IdeaBrief / MasterPrompt / TodoList */
export type Prd = IdeaBrief
/** @deprecated Use TodoListItem */
export type DevelopmentPromptBuildTodo = TodoListItem
/** @deprecated Use MasterPrompt */
export type DevelopmentPrompt = MasterPrompt
