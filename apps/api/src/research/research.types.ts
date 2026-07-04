import type { DraftRun } from '@ai-war-room/schemas'

export const RESEARCH_PROVIDER = Symbol('RESEARCH_PROVIDER')

export type ResearchDocument = {
  sourceId: string
  title: string
  url: string
  provider: string
  publishedAt: string
  content: string
}

export type ResearchCitation = Omit<ResearchDocument, 'content'>

export type ResearchProviderRequest = {
  draftRun: DraftRun
}

export interface ResearchProvider {
  readonly providerId: string
  search(request: ResearchProviderRequest): Promise<ResearchDocument[]>
}
