import { z } from 'zod'

export const complexitySchema = z.enum(['low', 'medium', 'high'])
export type Complexity = z.infer<typeof complexitySchema>

export const confidenceSchema = z.enum(['low', 'medium', 'high'])
export type Confidence = z.infer<typeof confidenceSchema>

export const runModeSchema = z.enum(['standard', 'deep'])
export type RunMode = z.infer<typeof runModeSchema>

export const runStatusSchema = z.enum([
  'draft',
  'pending',
  'running',
  'completed',
  'failed',
  'blocked',
])
export type RunStatus = z.infer<typeof runStatusSchema>

export const agentRoleSchema = z.enum([
  'product_manager',
  'critic',
  'moderator',
  'security_expert',
  'software_architect',
  'market_researcher',
  'mobile_ux_expert',
])
export type AgentRole = z.infer<typeof agentRoleSchema>

export const artifactTypeSchema = z.enum([
  'executive_summary',
  'prd',
  'development_prompt',
])
export type ArtifactType = z.infer<typeof artifactTypeSchema>

export const nonEmptyStringSchema = z.string().trim().min(1)

export const utcDateStringSchema = z.string().datetime()
